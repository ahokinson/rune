import { PooledSet } from "@/core/pooledSet"
import type { Camera } from "@/draw/camera"
import type { Canvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { OrthographicProjection } from "@/draw/raycast/projection"
import type { Rectangle } from "@/math/rectangle"
import { Vector2 } from "@/math/vector2"
import { Entity2D } from "@/scene/entity2d"
import type { ForceField } from "./forceField"

/**
 * 2D particle system entity. Pooled particles spawn at an origin, fly out under
 * gravity plus arbitrary force fields, collide with rectangles, age through a
 * glyph table, and expire — with an optional sub-emitter hook on death.
 *
 * @module
 */

interface Particle {
  position: Vector2
  velocity: Vector2
  ageMilliseconds: number
  lifetimeMilliseconds: number
  characterIndex: number
  active: boolean
}

/** Options for constructing a {@link Particles} entity. */
export interface ParticlesOptions {
  /** World-space origin particles spawn at. */
  origin: Vector2
  /** Continuous spawns per second (0 = manual `emit` only). Default 0. */
  ratePerSecond?: number
  /** Particle lifetime in milliseconds. */
  lifetimeMilliseconds: number
  /** [min, max] initial speed. Default [0, 0]. */
  speedRange?: [number, number]
  /** [min, max] initial heading in radians. Default [0, 2π). */
  angleRange?: [number, number]
  /** Constant acceleration per step. Default (0, 0). */
  gravity?: Vector2
  /** Glyph table indexed by life-fraction; particles step through it as they age. */
  characters: string[]
  /** Draw colour. Default white. */
  color?: Color
  /** Pool cap. Default 256. */
  maximumParticles?: number
  /** Force fields summed onto each particle every step (attractors, wind, drag). */
  forces?: ForceField[]
  /** Solid rectangles particles bounce off; `bounce` is the restitution (0–1). */
  collideWith?: readonly Rectangle[]
  /** Restitution coefficient for `collideWith` (0 = stop, 1 = perfect bounce). */
  bounce?: number
  /**
   * Called when a particle expires, with its final position and velocity — the
   * hook for sub-emitters (a spark dies into a puff of smoke).
   */
  onExpire?: (position: Vector2, velocity: Vector2) => void
}

function randomBetween(low: number, high: number): number {
  if (low === high) return low
  return low + Math.random() * (high - low)
}

/**
 * Pooled 2D particle emitter drawn as a scene entity.
 */
export class Particles extends Entity2D {
  /** Spawn origin (a copy of `options.origin`). */
  origin: Vector2
  /** Continuous spawn rate per second. */
  ratePerSecond: number
  /** Particle lifetime in milliseconds. */
  lifetimeMilliseconds: number
  /** [min, max] initial speed. */
  speedRange: [number, number]
  /** [min, max] initial heading in radians. */
  angleRange: [number, number]
  /** Constant per-step acceleration. */
  gravity: Vector2
  /** Glyph table stepped through as a particle ages. */
  characters: string[]
  /** Draw colour. */
  color: Color
  /** Force fields applied each step. */
  forces: ForceField[]
  /** Solid rectangles particles bounce off. */
  collideWith: readonly Rectangle[]
  /** Restitution coefficient (0–1). */
  bounce: number
  /** Sub-emitter callback on particle death. */
  onExpire?: (position: Vector2, velocity: Vector2) => void
  private readonly particles: PooledSet<Particle>
  private emissionAccumulator = 0
  // Scratch accumulator for summed forces, reused so update never allocates.
  private readonly forceAccumulator = new Vector2()

  /**
   * @param options - Particle configuration.
   */
  constructor(options: ParticlesOptions) {
    super({ position: options.origin.clone(), size: new Vector2(0, 0) })
    this.origin = options.origin.clone()
    this.ratePerSecond = options.ratePerSecond ?? 0
    this.lifetimeMilliseconds = options.lifetimeMilliseconds
    this.speedRange = options.speedRange ?? [0, 0]
    this.angleRange = options.angleRange ?? [0, Math.PI * 2]
    this.gravity = options.gravity?.clone() ?? new Vector2(0, 0)
    this.characters = options.characters
    this.color = options.color ?? Color.WHITE
    this.forces = options.forces ?? []
    this.collideWith = options.collideWith ?? []
    this.bounce = options.bounce ?? 0
    this.onExpire = options.onExpire
    this.particles = new PooledSet<Particle>({
      create: () => ({
        position: new Vector2(),
        velocity: new Vector2(),
        ageMilliseconds: 0,
        lifetimeMilliseconds: 0,
        characterIndex: 0,
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
   * Spawn `count` particles immediately (in addition to the rate-based stream).
   *
   * @param count - How many to spawn.
   */
  emit(count: number): void {
    for (let index = 0; index < count; index++) {
      this.spawnParticle()
    }
  }

  private spawnParticle(): Particle | null {
    const particle = this.particles.spawn()
    if (!particle) return null
    particle.position.copyFrom(this.origin)
    const angle = randomBetween(this.angleRange[0], this.angleRange[1])
    const speed = randomBetween(this.speedRange[0], this.speedRange[1])
    particle.velocity.set(Math.cos(angle) * speed, Math.sin(angle) * speed)
    particle.ageMilliseconds = 0
    particle.lifetimeMilliseconds = this.lifetimeMilliseconds
    particle.characterIndex = 0
    particle.active = true
    return particle
  }

  /**
   * Advance the simulation by `deltaMilliseconds`: spawn from the rate, age
   * particles, apply gravity + force fields, resolve collisions, and step the
   * glyph index.
   *
   * @param deltaMilliseconds - Frame delta in milliseconds.
   */
  override update(deltaMilliseconds: number): void {
    if (this.ratePerSecond > 0) {
      this.emissionAccumulator += (this.ratePerSecond * deltaMilliseconds) / 1000
      while (this.emissionAccumulator >= 1) {
        this.emit(1)
        this.emissionAccumulator -= 1
      }
    }
    const deltaSeconds = deltaMilliseconds / 1000
    const active = this.particles.active
    for (let index = 0; index < active.length; index++) {
      active[index]!.ageMilliseconds += deltaMilliseconds
    }
    // Fire the sub-emitter hook for each particle about to expire.
    this.particles.expire((particle) => {
      if (particle.ageMilliseconds < particle.lifetimeMilliseconds) return false
      this.onExpire?.(particle.position, particle.velocity)
      return true
    })
    for (let index = 0; index < active.length; index++) {
      const particle = active[index]!
      // Sum gravity and every force field into the scratch accumulator.
      this.forceAccumulator.set(this.gravity.x, this.gravity.y)
      for (const force of this.forces) force(particle.position, particle.velocity, this.forceAccumulator)
      particle.velocity.x += this.forceAccumulator.x * deltaSeconds
      particle.velocity.y += this.forceAccumulator.y * deltaSeconds
      particle.position.x += particle.velocity.x * deltaSeconds
      particle.position.y += particle.velocity.y * deltaSeconds
      if (this.collideWith.length > 0) this.resolveCollisions(particle)
      const lifeFraction = particle.ageMilliseconds / particle.lifetimeMilliseconds
      particle.characterIndex = Math.min(this.characters.length - 1, Math.floor(lifeFraction * this.characters.length))
    }
  }

  // Point-vs-AABB bounce: if a particle is inside an obstacle, eject it along the
  // shallowest axis and reflect that velocity component by `bounce`.
  private resolveCollisions(particle: Particle): void {
    for (const box of this.collideWith) {
      const { x, y } = particle.position
      if (x < box.left || x >= box.right || y < box.top || y >= box.bottom) continue
      const overlapLeft = x - box.left
      const overlapRight = box.right - x
      const overlapTop = y - box.top
      const overlapBottom = box.bottom - y
      const minX = Math.min(overlapLeft, overlapRight)
      const minY = Math.min(overlapTop, overlapBottom)
      if (minX < minY) {
        particle.position.x = overlapLeft < overlapRight ? box.left : box.right
        particle.velocity.x = -particle.velocity.x * this.bounce
      } else {
        particle.position.y = overlapTop < overlapBottom ? box.top : box.bottom
        particle.velocity.y = -particle.velocity.y * this.bounce
      }
    }
  }

  /**
   * Draw live particles. In a flat (orthographic) scene they scroll with the
   * camera; in other scenes (e.g. a raycast view) they're drawn at raw positions
   * as a screen-space overlay — how a muzzle-flash emitter parked at screen
   * coordinates behaves.
   *
   * @param canvas - Target canvas.
   * @param camera - Optional camera for orthographic projection.
   */
  override draw(canvas: Canvas, camera?: Camera): void {
    // Particle positions are world-space. In a flat (orthographic) scene they are
    // projected through the camera so they scroll with the rest of the world; in
    // other scenes (e.g. a raycast view) there is no meaningful 2D projection, so
    // they are drawn at their raw position as a screen-space overlay — which is
    // how an emitter parked at screen coordinates (a muzzle flash, say) behaves.
    const projection = camera?.projection
    const ortho = projection instanceof OrthographicProjection ? projection : null
    const cameraX = ortho ? camera!.position.x : 0
    const cameraY = ortho ? camera!.position.y : 0
    const zoom = ortho ? ortho.zoom : 1

    const active = this.particles.active
    for (let index = 0; index < active.length; index++) {
      const particle = active[index]!
      if (!particle.active) continue
      const character = this.characters[particle.characterIndex] ?? this.characters[0]
      if (!character) continue
      const drawColumn = ortho ? Math.round((particle.position.x - cameraX) * zoom) : Math.round(particle.position.x)
      const drawRow = ortho ? Math.round((particle.position.y - cameraY) * zoom) : Math.round(particle.position.y)
      canvas.setCell(drawColumn, drawRow, character, this.color)
    }
  }

  /** Number of live particles. */
  get activeCount(): number {
    return this.particles.size
  }
}

/** Options for {@link burstEmitter}; the {@link ParticlesOptions} fields a burst needs. */
export interface BurstEmitterOptions {
  /** Glyph table stepped through as a particle ages. */
  characters: string[]
  /** Draw colour. */
  color: Color
  /** Particle lifetime in milliseconds. */
  lifetimeMilliseconds: number
  /** [min, max] initial speed. */
  speedRange: [number, number]
  /** [min, max] initial heading in radians. */
  angleRange: [number, number]
  /** Constant per-step acceleration (default none). */
  gravity?: Vector2
  /** Pool cap (default 64). */
  maximumParticles?: number
  /** Draw order; applied to the returned emitter when given. */
  zIndex?: number
  /** Initial spawn origin in the owner's coordinate space (default `(0, 0)`). */
  origin?: Vector2
}

/**
 * Build a manual-emit {@link Particles} emitter — `ratePerSecond` 0, so nothing
 * spawns until {@link Particles.emit} fires on a gameplay event (a muzzle flash,
 * coin sparkle, blood spray, brick shatter). Defaults the origin to `(0, 0)` (the
 * owner repositions it each frame) and the pool to 64, and applies `zIndex` when
 * given. Continuous effects can start here and raise `ratePerSecond` at runtime.
 *
 * @param options - Burst configuration.
 * @returns A configured {@link Particles} entity.
 */
export function burstEmitter(options: BurstEmitterOptions): Particles {
  const particles = new Particles({
    origin: options.origin ?? new Vector2(0, 0),
    characters: options.characters,
    color: options.color,
    lifetimeMilliseconds: options.lifetimeMilliseconds,
    speedRange: options.speedRange,
    angleRange: options.angleRange,
    gravity: options.gravity,
    ratePerSecond: 0,
    maximumParticles: options.maximumParticles ?? 64,
  })
  if (options.zIndex !== undefined) particles.zIndex = options.zIndex
  return particles
}
