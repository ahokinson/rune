import { Vector3 } from "@/math/vector3"

/**
 * Generic 3D camera, projector strategies, and viewport/projection types shared
 * by the sphere and mesh rendering pipelines. Depth convention is
 * LARGER = NEARER, matching {@link GridDepthBuffer}.
 *
 * @module
 */

/**
 * Where a 3D camera is drawing this frame, in screen cells. `radius` is the
 * world-unit -> cell scale on the horizontal axis; `aspectY` squashes the
 * vertical axis for non-square terminal cells (e.g. 0.5 for 2:1 cells). Mirrors
 * SphereView so the sphere consumer and the generic projectors share placement.
 */
export interface Viewport3D {
  centerX: number
  centerY: number
  radius: number
  aspectY: number
}

/**
 * A projected screen position with its camera-facing depth. Depth follows the
 * LARGER = NEARER convention shared with GridDepthBuffer.
 */
export interface ProjectedPoint {
  x: number
  y: number
  depth: number
}

/**
 * A world-space ray for a screen cell (inverse projection), used for sampling
 * implicit surfaces. `direction` is unit length.
 */
export interface ScreenRay {
  origin: Vector3
  direction: Vector3
}

/**
 * Strategy that maps between world space and screen space for a Camera3D. Both
 * directions are provided so forward (point -> screen) and inverse (cell -> ray)
 * projections can stay in lock-step. Implemented by OrthographicProjector3D and
 * PerspectiveProjector3D (generic), and SphereProjector (the globe).
 */
export interface Projector3D {
  /**
   * Forward-project a world point. `altitude` (>= 1) optionally pushes the point
   * radially outward so arcs can bow off a surface; pass 1 for plain points.
   * Returns null when culled. Writes into `out` and returns it otherwise.
   */
  projectInto(
    out: ProjectedPoint,
    worldPoint: Vector3,
    altitude: number,
    camera: Camera3D,
    viewport: Viewport3D,
  ): ProjectedPoint | null

  /**
   * Inverse: the world-space ray through a (sub)cell centre. Returns null when
   * the cell maps to nothing (e.g. outside a sphere's disc).
   */
  rayInto(out: ScreenRay, screenX: number, screenY: number, camera: Camera3D, viewport: Viewport3D): ScreenRay | null
}

/** Options for constructing a {@link Camera3D}. */
export interface Camera3DOptions {
  /** Camera position in world space (default `(0, 0, 1)`). */
  position?: Vector3
  /**
   * Orientation as a forward look direction + an up hint; the right axis and a
   * re-orthogonalised up are derived per projection. Both default to looking
   * down -z (toward the origin from +z), matching the sphere camera.
   */
  forward?: Vector3
  /** Up hint used to derive the camera's right axis (default screen-up). */
  up?: Vector3
  /** Pluggable projector; `null` means projection calls return `null`. */
  projector?: Projector3D
}

/**
 * A free 3D camera: a position + orientation in world space plus a pluggable
 * projector. Geometry is projected/culled through `projector`, so the same
 * camera can drive an orthographic, perspective, or spherical view.
 *
 * @example
 * ```ts
 * const cam = new Camera3D({ projector: new OrthographicProjector3D() })
 * const p = cam.projectInto(out, worldPoint, 1, viewport)
 * ```
 */
export class Camera3D {
  /** Camera position in world space. */
  position: Vector3
  /** Forward look direction (unit). */
  forward: Vector3
  /** Up hint used to derive the right axis. */
  up: Vector3
  /** Pluggable projector strategy; `null` disables projection. */
  projector: Projector3D | null

  /**
   * @param options - Position, orientation, and projector.
   */
  constructor(options: Camera3DOptions = {}) {
    this.position = options.position ?? new Vector3(0, 0, 1)
    this.forward = options.forward ?? new Vector3(0, 0, -1)
    this.up = options.up ?? Vector3.up.clone()
    this.projector = options.projector ?? null
  }

  /**
   * Forward-project a world point through the camera's projector.
   *
   * @param out - Target projected point to fill.
   * @param worldPoint - Point in world space.
   * @param altitude - Radial lift (>= 1); pass 1 for plain points.
   * @param viewport - Screen placement for this frame.
   * @returns `out` with screen coordinates and depth, or `null` if culled / no projector.
   */
  projectInto(out: ProjectedPoint, worldPoint: Vector3, altitude: number, viewport: Viewport3D): ProjectedPoint | null {
    if (!this.projector) return null
    return this.projector.projectInto(out, worldPoint, altitude, this, viewport)
  }

  /**
   * Inverse-project a screen cell to a world-space ray through the camera's projector.
   *
   * @param out - Target ray to fill.
   * @param screenX - Screen column (sub-cell centre).
   * @param screenY - Screen row (sub-cell centre).
   * @param viewport - Screen placement for this frame.
   * @returns `out` with origin and unit direction, or `null` if culled / no projector.
   */
  rayInto(out: ScreenRay, screenX: number, screenY: number, viewport: Viewport3D): ScreenRay | null {
    if (!this.projector) return null
    return this.projector.rayInto(out, screenX, screenY, this, viewport)
  }
}

/**
 * Fill an orthonormal camera basis (forward/right/up) into the provided scratch
 * vectors. Right = up x forward, then up is rebuilt as forward x right so the
 * three stay orthogonal even if the caller's up hint was not perpendicular.
 * Convention: +right -> +screenX, +up -> -screenY (screen y points down).
 */
function computeBasis(camera: Camera3D, f: Vector3, r: Vector3, u: Vector3): void {
  f.copyFrom(camera.forward)
  const fl = f.length() || 1
  f.scaleInPlace(1 / fl)

  const ux = camera.up.x
  const uy = camera.up.y
  const uz = camera.up.z
  r.set(uy * f.z - uz * f.y, uz * f.x - ux * f.z, ux * f.y - uy * f.x)
  const rl = r.length() || 1
  r.scaleInPlace(1 / rl)

  u.set(f.y * r.z - f.z * r.y, f.z * r.x - f.x * r.z, f.x * r.y - f.y * r.x)
}

/** Options for {@link OrthographicProjector3D}. */
export interface OrthographicProjector3DOptions {
  /** Extra world-unit -> cell multiplier applied on top of `viewport.radius`. */
  scale?: number
}

/**
 * Parallel projection: depth does not affect screen scale. `altitude` lifts the
 * projected offset radially from the viewport centre (so it bows arcs the same
 * way the sphere does). Culls points behind the camera.
 */
export class OrthographicProjector3D implements Projector3D {
  /** Extra scale multiplier on top of `viewport.radius`. */
  scale: number
  private _f = new Vector3()
  private _r = new Vector3()
  private _u = new Vector3()

  /**
   * @param options - Scale multiplier.
   */
  constructor(options: OrthographicProjector3DOptions = {}) {
    this.scale = options.scale ?? 1
  }

  /**
   * Forward-project a world point orthographically.
   *
   * @param out - Target projected point.
   * @param worldPoint - Point in world space.
   * @param altitude - Radial lift (>= 1); pass 1 for plain points.
   * @param camera - Camera providing position and orientation.
   * @param viewport - Screen placement.
   * @returns `out` with screen coordinates and depth, or `null` if behind the camera.
   */
  projectInto(
    out: ProjectedPoint,
    worldPoint: Vector3,
    altitude: number,
    camera: Camera3D,
    viewport: Viewport3D,
  ): ProjectedPoint | null {
    computeBasis(camera, this._f, this._r, this._u)
    const dx = worldPoint.x - camera.position.x
    const dy = worldPoint.y - camera.position.y
    const dz = worldPoint.z - camera.position.z

    const camForward = dx * this._f.x + dy * this._f.y + dz * this._f.z
    if (camForward <= 0) return null

    const camRight = dx * this._r.x + dy * this._r.y + dz * this._r.z
    const camUp = dx * this._u.x + dy * this._u.y + dz * this._u.z
    const a = altitude || 1
    const sx = viewport.radius * this.scale * a

    out.x = Math.round(viewport.centerX + camRight * sx)
    out.y = Math.round(viewport.centerY - camUp * sx * viewport.aspectY)
    out.depth = -camForward
    return out
  }

  /**
   * Inverse-project a screen cell to an orthographic world-space ray.
   *
   * @param out - Target ray.
   * @param screenX - Screen column.
   * @param screenY - Screen row.
   * @param camera - Camera providing position and orientation.
   * @param viewport - Screen placement.
   * @returns `out` with origin on the camera plane and unit forward direction.
   */
  rayInto(out: ScreenRay, screenX: number, screenY: number, camera: Camera3D, viewport: Viewport3D): ScreenRay | null {
    computeBasis(camera, this._f, this._r, this._u)
    const ndcX = (screenX - viewport.centerX) / (viewport.radius * this.scale)
    const ndcY = -(screenY - viewport.centerY) / (viewport.radius * this.scale * viewport.aspectY)
    out.origin.set(
      camera.position.x + this._r.x * ndcX + this._u.x * ndcY,
      camera.position.y + this._r.y * ndcX + this._u.y * ndcY,
      camera.position.z + this._r.z * ndcX + this._u.z * ndcY,
    )
    out.direction.copyFrom(this._f)
    return out
  }
}

/** Options for {@link PerspectiveProjector3D}. */
export interface PerspectiveProjector3DOptions {
  /** Vertical field of view in radians (default π/3). */
  fieldOfView?: number
  /** Near clip distance (default 0.01). */
  near?: number
  /** Far clip distance (default Infinity). */
  far?: number
}

/**
 * Pinhole perspective: closer points project larger. Culls points at/behind the
 * near plane and beyond `far`. `altitude` scales the projected offset outward
 * for arc bowing, mirroring the orthographic/sphere behaviour.
 */
export class PerspectiveProjector3D implements Projector3D {
  /** Vertical field of view in radians. */
  fieldOfView: number
  /** Near clip distance. */
  near: number
  /** Far clip distance. */
  far: number
  private _f = new Vector3()
  private _r = new Vector3()
  private _u = new Vector3()

  /**
   * @param options - FOV, near, and far clip distances.
   */
  constructor(options: PerspectiveProjector3DOptions = {}) {
    this.fieldOfView = options.fieldOfView ?? Math.PI / 3
    this.near = options.near ?? 0.01
    this.far = options.far ?? Number.POSITIVE_INFINITY
  }

  /**
   * Forward-project a world point with perspective division.
   *
   * @param out - Target projected point.
   * @param worldPoint - Point in world space.
   * @param altitude - Radial lift (>= 1); pass 1 for plain points.
   * @param camera - Camera providing position and orientation.
   * @param viewport - Screen placement.
   * @returns `out` with screen coordinates and depth, or `null` if culled by near/far.
   */
  projectInto(
    out: ProjectedPoint,
    worldPoint: Vector3,
    altitude: number,
    camera: Camera3D,
    viewport: Viewport3D,
  ): ProjectedPoint | null {
    computeBasis(camera, this._f, this._r, this._u)
    const dx = worldPoint.x - camera.position.x
    const dy = worldPoint.y - camera.position.y
    const dz = worldPoint.z - camera.position.z

    const camForward = dx * this._f.x + dy * this._f.y + dz * this._f.z
    if (camForward <= this.near || camForward > this.far) return null

    const camRight = dx * this._r.x + dy * this._r.y + dz * this._r.z
    const camUp = dx * this._u.x + dy * this._u.y + dz * this._u.z
    const tan = Math.tan(this.fieldOfView / 2)
    const a = altitude || 1
    const ndcX = (camRight / (camForward * tan)) * a
    const ndcY = (camUp / (camForward * tan)) * a

    out.x = Math.round(viewport.centerX + ndcX * viewport.radius)
    out.y = Math.round(viewport.centerY - ndcY * viewport.radius * viewport.aspectY)
    out.depth = -camForward
    return out
  }

  /**
   * Inverse-project a screen cell to a perspective world-space ray.
   *
   * @param out - Target ray.
   * @param screenX - Screen column.
   * @param screenY - Screen row.
   * @param camera - Camera providing position and orientation.
   * @param viewport - Screen placement.
   * @returns `out` with origin at the camera and a unit direction through the cell.
   */
  rayInto(out: ScreenRay, screenX: number, screenY: number, camera: Camera3D, viewport: Viewport3D): ScreenRay | null {
    computeBasis(camera, this._f, this._r, this._u)
    const tan = Math.tan(this.fieldOfView / 2)
    const ndcX = ((screenX - viewport.centerX) / viewport.radius) * tan
    const ndcY = (-(screenY - viewport.centerY) / (viewport.radius * viewport.aspectY)) * tan
    out.direction.set(
      this._f.x + this._r.x * ndcX + this._u.x * ndcY,
      this._f.y + this._r.y * ndcX + this._u.y * ndcY,
      this._f.z + this._r.z * ndcX + this._u.z * ndcY,
    )
    const dl = out.direction.length() || 1
    out.direction.scaleInPlace(1 / dl)
    out.origin.copyFrom(camera.position)
    return out
  }
}
