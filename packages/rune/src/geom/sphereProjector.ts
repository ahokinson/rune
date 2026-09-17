import type { Vector3 } from "@/math/vector3"
import type { Camera3D, ProjectedPoint, Projector3D, ScreenRay, Viewport3D } from "./camera3d"
import { sphericalToVector3Into } from "./sphere"
import type { ScreenPoint, SphereProjection, SphereView, SurfacePoint } from "./sphereProjection"

/**
 * Adapts {@link SphereProjection} to the generic {@link Projector3D} interface so
 * a {@link Camera3D} can drive the globe while the actual pixels still come from
 * the battle-tested sphere math.
 *
 * @module
 */

/**
 * One sampled point on an implicit sphere surface: its spherical angles, the
 * camera-space normal (also the unit screen-space lighting direction), and the
 * camera-facing depth (LARGER = NEARER, i.e. the normal's z). Extends the shape
 * SphereProjection writes so it can be filled in place with no extra scratch.
 */
export interface SurfaceSample extends SurfacePoint {
  depth: number
}

/**
 * Adapts the proven SphereProjection (tilt/spin/aspect, lock-step forward and
 * inverse) to the generic Projector3D, so a Camera3D can drive the globe while
 * the actual pixels still come from the battle-tested sphere math. The spin
 * (`rotation`) is owned here and refreshed by the game each frame, like the old
 * per-call SphereView.rotation.
 *
 * @example
 * ```ts
 * const proj = new SphereProjector(sphere, spin)
 * const cam = new Camera3D({ projector: proj })
 * ```
 */
export class SphereProjector implements Projector3D {
  /** The wrapped sphere projection (owns tilt and aspect). */
  readonly sphere: SphereProjection
  /** Spin about the polar axis in radians, refreshed by the game each frame. */
  rotation: number
  // Reused per-call so building the SphereView allocates nothing.
  private _view: SphereView = { centerX: 0, centerY: 0, radius: 1, rotation: 0 }

  /**
   * @param sphere - Sphere projection to adapt.
   * @param rotation - Initial spin about the polar axis in radians (default 0).
   */
  constructor(sphere: SphereProjection, rotation = 0) {
    this.sphere = sphere
    this.rotation = rotation
  }

  // aspectY is owned by the SphereProjection itself (not the view), so the
  // viewport's aspectY is unused here — it only places the disc on screen.
  private viewFrom(viewport: Viewport3D): SphereView {
    const v = this._view
    v.centerX = viewport.centerX
    v.centerY = viewport.centerY
    v.radius = viewport.radius
    v.rotation = this.rotation
    return v
  }

  /**
   * Forward-project a world point (treated as a unit surface direction) through
   * the wrapped sphere projection.
   *
   * @param out - Target projected point.
   * @param worldPoint - Unit surface direction.
   * @param altitude - Radial lift (>= 1); pass 1 for surface points.
   * @param _camera - Unused (sphere placement comes from the viewport).
   * @param viewport - Screen placement.
   * @returns `out`, or `null` if culled.
   */
  projectInto(
    out: ProjectedPoint,
    worldPoint: Vector3,
    altitude: number,
    _camera: Camera3D,
    viewport: Viewport3D,
  ): ProjectedPoint | null {
    return this.sphere.directionToScreenInto(out as ScreenPoint, worldPoint, altitude, this.viewFrom(viewport))
  }

  /**
   * Inverse-project a screen cell to a world-space ray whose direction is the
   * surface point's unit direction.
   *
   * @param out - Target ray.
   * @param screenX - Screen column.
   * @param screenY - Screen row.
   * @param camera - Camera providing the ray origin.
   * @param viewport - Screen placement.
   * @returns `out`, or `null` if the cell is off the disc.
   */
  rayInto(out: ScreenRay, screenX: number, screenY: number, camera: Camera3D, viewport: Viewport3D): ScreenRay | null {
    const surface = this.sphere.screenToSurface(screenX, screenY, this.viewFrom(viewport))
    if (!surface) return null
    sphericalToVector3Into(out.direction, surface.theta, surface.phi)
    out.origin.copyFrom(camera.position)
    return out
  }

  /**
   * Surface-specialised inverse used by SurfaceMesh3D: returns theta/phi/normal
   * (allocation-free, writing into `out`) plus depth = normal.z, the data an
   * implicit-surface sampler needs. Mirrors SphereProjection.screenToSurfaceInto.
   *
   * @param out - Target surface sample (its `normal` and `depth` are filled).
   * @param screenX - Screen column.
   * @param screenY - Screen row.
   * @param viewport - Screen placement.
   * @returns `out`, or `null` if the cell is off the disc.
   */
  surfaceInto(out: SurfaceSample, screenX: number, screenY: number, viewport: Viewport3D): SurfaceSample | null {
    const result = this.sphere.screenToSurfaceInto(out as SurfacePoint, screenX, screenY, this.viewFrom(viewport))
    if (!result) return null
    out.depth = out.normal.z
    return out
  }
}
