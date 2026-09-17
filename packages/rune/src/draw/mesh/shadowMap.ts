/**
 * Directional shadow mapping for the 3D mesh pass: renders caster depth from the
 * light's point of view into a {@link SubpixelTarget} and answers a
 * per-fragment lit/shadowed query that a shader multiplies into its direct light.
 *
 * @module
 */

import { Camera3D, PerspectiveProjector3D, type Viewport3D } from "@/geom/camera3d"
import type { Matrix4 } from "@/math/matrix4"
import { Vector3 } from "@/math/vector3"
import { Color, type SurfaceColor } from "../color"
import { type Mesh, type MeshShader, renderMesh } from "./rasterizer"
import { SubpixelTarget } from "./subpixelTarget"

/**
 * One caster handed to {@link ShadowMap.render}: a mesh and the model transform
 * that places it in the world this frame.
 */
export interface ShadowCaster {
  mesh: Mesh
  model: Matrix4
}

/** Options for {@link ShadowMap}. */
export interface ShadowMapOptions {
  /**
   * Square depth grid resolution in subpixels. Default 512. Lower it to trade
   * shadow crispness for the cost of the extra depth pass.
   */
  resolution?: number
  /**
   * Direction toward the light (world space); the depth pass renders the scene
   * from here. Normalised internally.
   */
  light: { x: number; y: number; z: number }
  /** World point the light camera frames. Default the origin. */
  focus?: { x: number; y: number; z: number }
  /**
   * How far the light camera sits from `focus`. A large distance with a narrow
   * `fieldOfView` approximates a parallel sun. Default 5.
   */
  distance?: number
  /** World half-extent the map should cover around `focus`. Default 2.2. */
  extent?: number
  /**
   * Light camera field of view (radians). Narrow keeps the projection near
   * parallel. Default 0.5.
   */
  fieldOfView?: number
  /**
   * Relative depth bias that fights self-shadow acne, loosened at grazing angles.
   * Default 0.004.
   */
  bias?: number
}

/**
 * A no-op shader for the depth pass: renderMesh always writes a colour, but the
 * shadow map only consumes `target.depth`, so the colour is irrelevant.
 */
const DEPTH_SHADER: MeshShader = {
  shade(_fragment, _out: SurfaceColor): void {},
}

const SHADOW_CLEAR = Color.BLACK

/**
 * A directional/spot shadow map. Renders caster depth from the light's point of
 * view into its own {@link SubpixelTarget}, then answers a lit↔shadowed query for
 * any world point — multiply a surface's direct light by {@link shadowAt} to drop
 * cast and self shadows. The depth pass reuses {@link renderMesh} (with no canvas
 * so nothing blits), and {@link shadowAt} reproduces renderMesh's exact
 * perspective projection so the stored `1/zv` depths line up with the lookup.
 */
export class ShadowMap {
  private readonly target: SubpixelTarget
  private readonly viewport: Viewport3D
  private readonly camera: Camera3D
  private readonly focus: Vector3
  private readonly distance: number
  private readonly fov: number
  private readonly tan: number
  private readonly bias: number

  // Light-camera basis + eye, recomputed whenever the light moves. The same
  // forward/right/up renderMesh derives from the camera, cached as scalars so the
  // per-fragment lookup avoids re-deriving them.
  private eX = 0
  private eY = 0
  private eZ = 0
  private fX = 0
  private fY = 0
  private fZ = 0
  private rX = 0
  private rY = 0
  private rZ = 1
  private uX = 0
  private uY = 1
  private uZ = 0

  /**
   * @param options - Shadow map parameters; see {@link ShadowMapOptions}.
   */
  constructor(options: ShadowMapOptions) {
    const resolution = Math.max(1, Math.floor(options.resolution ?? 512))
    this.target = new SubpixelTarget(resolution, resolution / 2)
    this.distance = options.distance ?? 5
    this.fov = options.fieldOfView ?? 0.5
    this.tan = Math.tan(this.fov / 2)
    this.bias = options.bias ?? 0.004
    const extent = options.extent ?? 2.2
    // Frame `extent` world units across the half-map at the focus plane:
    // screenOffset = (worldOffset / (distance·tan)) · radius, solved for radius.
    const radius = ((this.target.width / 2) * this.distance * this.tan) / extent
    this.viewport = { centerX: this.target.width / 2, centerY: this.target.height / 2, radius, aspectY: 1 }
    this.focus = new Vector3(options.focus?.x ?? 0, options.focus?.y ?? 0, options.focus?.z ?? 0)
    this.camera = new Camera3D({ projector: new PerspectiveProjector3D({ fieldOfView: this.fov, near: 0.05 }) })
    this.setLight(options.light.x, options.light.y, options.light.z)
  }

  /**
   * Aim the light camera down `(lx, ly, lz)` (direction toward the light) and
   * recompute the cached basis. Cheap; call when the light direction changes.
   *
   * @param lx - Light direction X (toward the light).
   * @param ly - Light direction Y (toward the light).
   * @param lz - Light direction Z (toward the light).
   */
  setLight(lx: number, ly: number, lz: number): void {
    const ll = Math.hypot(lx, ly, lz) || 1
    // Camera forward points the way the light travels: from the source into the
    // scene, i.e. opposite the direction toward the light.
    const fx = -lx / ll
    const fy = -ly / ll
    const fz = -lz / ll
    // Eye sits on the light's side of the focus.
    this.eX = this.focus.x - fx * this.distance
    this.eY = this.focus.y - fy * this.distance
    this.eZ = this.focus.z - fz * this.distance
    this.camera.position.set(this.eX, this.eY, this.eZ)
    this.camera.forward.set(fx, fy, fz)

    // Basis matching renderMesh/camera3d: right = up × forward, up = forward ×
    // right. Pick an up hint not parallel to forward.
    const hintY = Math.abs(fy) > 0.9 ? 0 : 1
    const hintZ = hintY === 0 ? 1 : 0
    this.camera.up.set(0, hintY, hintZ)
    this.fX = fx
    this.fY = fy
    this.fZ = fz
    // right = hint × forward, with hint = (0, hintY, hintZ).
    const cx = hintY * fz - hintZ * fy
    const cy = hintZ * fx
    const cz = -hintY * fx
    const rl = Math.hypot(cx, cy, cz) || 1
    this.rX = cx / rl
    this.rY = cy / rl
    this.rZ = cz / rl
    this.uX = fy * this.rZ - fz * this.rY
    this.uY = fz * this.rX - fx * this.rZ
    this.uZ = fx * this.rY - fy * this.rX
  }

  /**
   * Render the casters' depth from the light. Call once per frame before shading,
   * after the casters' model transforms are set for this frame.
   *
   * @param casters - Casters to render this frame.
   */
  render(casters: readonly ShadowCaster[]): void {
    this.target.clear(SHADOW_CLEAR)
    for (const caster of casters) {
      renderMesh({
        camera: this.camera,
        viewport: this.viewport,
        target: this.target,
        mesh: caster.mesh,
        model: caster.model,
        shader: DEPTH_SHADER,
      })
    }
  }

  /**
   * Light reaching `(wx, wy, wz)`: 1 fully lit, 0 fully shadowed, fractional at
   * soft edges (2×2 PCF). `ndotl` (surface·light, clamped ≥0) slopes the bias so
   * grazing surfaces don't self-shadow. Points outside the light frustum read lit.
   *
   * @param wx - World X.
   * @param wy - World Y.
   * @param wz - World Z.
   * @param ndotl - Surface·light dot product, clamped ≥0.
   * @returns Lit fraction in [0, 1].
   */
  shadowAt(wx: number, wy: number, wz: number, ndotl: number): number {
    const dx = wx - this.eX
    const dy = wy - this.eY
    const dz = wz - this.eZ
    const vz = dx * this.fX + dy * this.fY + dz * this.fZ
    if (vz <= 0.05) return 1
    const invVz = 1 / vz
    const vr = dx * this.rX + dy * this.rY + dz * this.rZ
    const vu = dx * this.uX + dy * this.uY + dz * this.uZ
    const scale = this.viewport.radius / (vz * this.tan)
    const cx = this.viewport.centerX + vr * scale
    const cy = this.viewport.centerY - vu * scale
    const sx = Math.round(cx)
    const sy = Math.round(cy)

    // Occluder must be nearer to the light than this fragment by the bias margin.
    // Depth stores 1/zv (larger = nearer), so shadow when stored > fragment·(1+bias).
    const threshold = invVz * (1 + this.bias / Math.max(ndotl, 0.15))
    const width = this.target.width
    const height = this.target.height
    const depth = this.target.depth

    let lit = 0
    let taps = 0
    for (let oy = 0; oy <= 1; oy++) {
      const py = sy + oy
      if (py < 0 || py >= height) continue
      for (let ox = 0; ox <= 1; ox++) {
        const px = sx + ox
        if (px < 0 || px >= width) continue
        taps++
        const stored = depth[py * width + px]!
        // Nothing rendered (stored 0 = infinitely far) or occluder not in front.
        if (stored <= 0 || stored <= threshold) lit++
      }
    }
    if (taps === 0) return 1
    return lit / taps
  }
}
