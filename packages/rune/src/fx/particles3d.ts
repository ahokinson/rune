import { PooledSet } from "@/core/pooledSet"
import type { Canvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import type { ProjectedPoint } from "@/geom/camera3d"
import { Vector3 } from "@/math/vector3"
import { type Draw3DContext, Entity3D } from "@/scene/entity3d"

/**
 * 3D particle system drawn as a World3D geometry. Each particle is projected,
 * near-culled, and depth-tested exactly like a PointCloud3D point, so a trail
 * rides a rotating surface and hides behind it.
 *
 * @module
 */

interface Particle3D {
  // World direction (unit, for the sphere projector) the particle sits on; the
  // radial lift is carried separately in `altitude` so it matches PolylineVertex.
  position: Vector3
  velocity: Vector3
  altitude: number
  ageMilliseconds: number
  lifetimeMilliseconds: number
  color: Color
  active: boolean
}

/**
 * Per-particle draw callback — the game keeps full control of glyph/colour, the
 * same split PointCloud3D/Polyline3D use. Only called for particles that pass
 * projection, the near cull, and (when occluding) the depth test. `lifeFraction`
 * runs 0 (just spawned) -> 1 (about to die) so the style can fade the trail.
 */
export interface Particle3DStyle {
  /**
   * Render one visible particle.
   *
   * @param canvas - Target canvas.
   * @param x - Projected screen column.
   * @param y - Projected screen row.
   * @param depth - Projected depth (LARGER = NEARER).
   * @param lifeFraction - 0 just spawned, 1 about to expire.
   * @param color - Particle colour.
   * @param index - Index of this particle in the active list.
   */
  draw(canvas: Canvas, x: number, y: number, depth: number, lifeFraction: number, color: Color, index: number): void
}

/** Options for constructing a {@link Particles3D} entity. */
export interface Particles3DOptions {
  /** Per-particle draw callback. */
  style: Particle3DStyle
  /** Particle lifetime in milliseconds. */
  lifetimeMilliseconds: number
  /** Pool cap. Default 256. */
  maximumParticles?: number
  /** Draw order within the World3D pass. */
  zIndex?: number
  /**
   * Particles nearer-facing than this depth are kept; the rest (grazing/far side)
   * are culled. Defaults to 0.1 to match the globe's city markers and arcs.
   */
  minDepth?: number
  /** Base colour (per-particle colour is snapshotted at spawn). Default white. */
  color?: Color
  /**
   * Constant acceleration applied to every particle's velocity each update
   * (gravity-like); defaults to none.
   */
  drift?: Vector3
}

/**
 * A pooled set of world-space particles drawn as a World3D geometry: each is
 * projected/near-culled/depth-tested exactly like a PointCloud3D point, so a
 * trail rides a rotating surface and hides behind it. Unlike the 2D Particles
 * entity, the simulation step (`update`) is driven by the host and `draw` only
 * renders, since World3D geometries are draw-only.
 *
 * The emitter state (`origin`, `altitude`, `velocity`, `color`,
 * `lifetimeMilliseconds`) is snapshotted by `emit()` — set it before each call to
 * move the source, recolour, or change trail length, so one emitter can serve
 * many moving sources in a single frame.
 */
export class Particles3D extends Entity3D {
  /** Origin snapshot used for particles spawned by the next `emit()`. */
  origin = new Vector3()
  /** Velocity snapshot used for particles spawned by the next `emit()`. */
  velocity = new Vector3()
  /** Altitude (radial lift) snapshot for the next `emit()`. */
  altitude = 1
  /** Colour snapshot for the next `emit()`. */
  color: Color
  /** Lifetime (ms) snapshot for the next `emit()`. */
  lifetimeMilliseconds: number
  /** Near-depth cull; particles closer than this are kept. */
  minDepth: number
  /** Constant per-step acceleration applied to every particle. */
  drift: Vector3
  /** Per-particle draw callback. */
  style: Particle3DStyle
  private readonly particles: PooledSet<Particle3D>
  private _p: ProjectedPoint = { x: 0, y: 0, depth: 0 }

  /**
   * @param options - Particle configuration.
   */
  constructor(options: Particles3DOptions) {
    super({ zIndex: options.zIndex })
    this.style = options.style
    this.lifetimeMilliseconds = options.lifetimeMilliseconds
    this.minDepth = options.minDepth ?? 0.1
    this.color = options.color ?? Color.WHITE
    this.drift = options.drift?.clone() ?? new Vector3(0, 0, 0)
    this.particles = new PooledSet<Particle3D>({
      create: () => ({
        position: new Vector3(),
        velocity: new Vector3(),
        altitude: 1,
        ageMilliseconds: 0,
        lifetimeMilliseconds: 0,
        color: Color.WHITE,
        active: false,
      }),
      reset: (particle) => {
        particle.active = false
        particle.ageMilliseconds = 0
      },
      capacity: options.maximumParticles ?? 256,
    })
  }

  /**
   * Spawn `count` particles, snapshooting the current emitter state.
   *
   * @param count - How many to spawn (default 1).
   */
  emit(count = 1): void {
    for (let index = 0; index < count; index++) {
      this.spawnParticle()
    }
  }

  private spawnParticle(): Particle3D | null {
    const particle = this.particles.spawn()
    if (!particle) return null
    particle.position.copyFrom(this.origin)
    particle.velocity.copyFrom(this.velocity)
    particle.altitude = this.altitude
    particle.ageMilliseconds = 0
    particle.lifetimeMilliseconds = this.lifetimeMilliseconds
    particle.color = this.color
    particle.active = true
    return particle
  }

  /**
   * Advance the simulation by `deltaMilliseconds`: age particles, expire the
   * dead, and integrate velocity + position under `drift`.
   *
   * @param deltaMilliseconds - Frame delta in milliseconds.
   */
  override update(deltaMilliseconds: number): void {
    const deltaSeconds = deltaMilliseconds / 1000
    const active = this.particles.active
    for (let index = 0; index < active.length; index++) {
      active[index]!.ageMilliseconds += deltaMilliseconds
    }
    this.particles.expire((particle) => particle.ageMilliseconds >= particle.lifetimeMilliseconds)
    for (let index = 0; index < active.length; index++) {
      const particle = active[index]!
      particle.velocity.x += this.drift.x * deltaSeconds
      particle.velocity.y += this.drift.y * deltaSeconds
      particle.velocity.z += this.drift.z * deltaSeconds
      particle.position.x += particle.velocity.x * deltaSeconds
      particle.position.y += particle.velocity.y * deltaSeconds
      particle.position.z += particle.velocity.z * deltaSeconds
    }
  }

  /**
   * Project and draw every live particle that passes the near cull (and the
   * depth test when `ctx.occlude` is set).
   *
   * @param ctx - 3D draw context (camera, viewport, canvas, depth buffer).
   */
  override draw(ctx: Draw3DContext): void {
    const active = this.particles.active
    for (let index = 0; index < active.length; index++) {
      const particle = active[index]!
      if (!particle.active) continue
      const r = ctx.camera.projectInto(this._p, particle.position, particle.altitude, ctx.viewport)
      if (!r) continue
      if (r.depth < this.minDepth) continue
      if (ctx.occlude && !ctx.depth.testNearer(r.x, r.y, r.depth)) continue
      const lifeFraction =
        particle.lifetimeMilliseconds > 0 ? particle.ageMilliseconds / particle.lifetimeMilliseconds : 1
      this.style.draw(ctx.canvas, r.x, r.y, r.depth, lifeFraction, particle.color, index)
    }
  }

  /** Number of live particles. */
  get activeCount(): number {
    return this.particles.size
  }
}
