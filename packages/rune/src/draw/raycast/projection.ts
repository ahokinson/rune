/**
 * 2D camera projections: {@link OrthographicProjection} and
 * {@link RaycastProjection} — a first-person DOOM-style projector that caches the
 * forward/right basis vectors and the camera plane from `yaw` + `fieldOfView`.
 *
 * @module
 */

import { Angle } from "@/math/angle"
import { Vector2 } from "@/math/vector2"
import type { Camera } from "../camera"

/** Project world points to screen space and back, driven by a {@link Camera}. */
export interface Projection {
  worldToScreen(point: Vector2, camera: Camera): Vector2
  screenToWorld(point: Vector2, camera: Camera): Vector2
}

/**
 * Orthographic projection: scales world space by `zoom` around the camera
 * position with no perspective.
 */
export class OrthographicProjection implements Projection {
  /** Zoom factor; world units are multiplied by this to get screen pixels. */
  zoom: number

  /**
   * @param zoom - Zoom factor (default 1).
   */
  constructor(zoom = 1) {
    this.zoom = zoom
  }

  worldToScreen(point: Vector2, camera: Camera): Vector2 {
    return new Vector2((point.x - camera.position.x) * this.zoom, (point.y - camera.position.y) * this.zoom)
  }

  screenToWorld(point: Vector2, camera: Camera): Vector2 {
    if (this.zoom === 0) return camera.position.clone()
    return new Vector2(point.x / this.zoom + camera.position.x, point.y / this.zoom + camera.position.y)
  }
}

/** Options for {@link RaycastProjection}. */
export interface RaycastProjectionOptions {
  /** Facing angle in radians (0 = +X). Default 0. */
  yaw?: number
  /** Horizontal field of view in radians. Default 66°. */
  fieldOfView?: number
  /** Vertical pitch in radians. Default 0. */
  pitch?: number
  /** Viewport width in cells. Default 80. */
  viewportWidth?: number
  /** Viewport height in cells. Default 24. */
  viewportHeight?: number
}

/**
 * First-person raycast projection. Derives the forward and right basis vectors
 * and the camera-plane magnitude from `yaw` and `fieldOfView`, caching them
 * until either changes. Provides per-column view rays for the DDA marcher.
 */
export class RaycastProjection implements Projection {
  private _yaw: number
  private _fieldOfView: number
  private _projectionDirty = true
  private _cachedForwardX = 0
  private _cachedForwardY = 0
  private _cachedRightX = 0
  private _cachedRightY = 0
  private _cachedPlaneMag = 0
  /** Vertical pitch in radians. */
  pitch: number
  /** Viewport width in cells. */
  viewportWidth: number
  /** Viewport height in cells. */
  viewportHeight: number

  /**
   * @param options - Projection parameters; see {@link RaycastProjectionOptions}.
   */
  constructor(options: RaycastProjectionOptions = {}) {
    this._yaw = options.yaw ?? 0
    this._fieldOfView = options.fieldOfView ?? Angle.fromDegrees(66)
    this.pitch = options.pitch ?? 0
    this.viewportWidth = options.viewportWidth ?? 80
    this.viewportHeight = options.viewportHeight ?? 24
  }

  /** Facing angle in radians (0 = +X). */
  get yaw(): number {
    return this._yaw
  }

  /** @param value - New yaw in radians. */
  set yaw(value: number) {
    if (this._yaw !== value) {
      this._yaw = value
      this._projectionDirty = true
    }
  }

  /** Horizontal field of view in radians. */
  get fieldOfView(): number {
    return this._fieldOfView
  }

  /** @param value - New field of view in radians. */
  set fieldOfView(value: number) {
    if (this._fieldOfView !== value) {
      this._fieldOfView = value
      this._projectionDirty = true
    }
  }

  private ensureCached(): void {
    if (!this._projectionDirty) return
    this._cachedForwardX = Math.cos(this._yaw)
    this._cachedForwardY = Math.sin(this._yaw)
    const rightAngle = this._yaw + Math.PI / 2
    this._cachedRightX = Math.cos(rightAngle)
    this._cachedRightY = Math.sin(rightAngle)
    this._cachedPlaneMag = Math.tan(this._fieldOfView / 2)
    this._projectionDirty = false
  }

  /** Cached forward basis X component. */
  get forwardX(): number {
    this.ensureCached()
    return this._cachedForwardX
  }

  /** Cached forward basis Y component. */
  get forwardY(): number {
    this.ensureCached()
    return this._cachedForwardY
  }

  /** Cached right basis X component. */
  get rightX(): number {
    this.ensureCached()
    return this._cachedRightX
  }

  /** Cached right basis Y component. */
  get rightY(): number {
    this.ensureCached()
    return this._cachedRightY
  }

  /** Cached camera-plane magnitude (`tan(fieldOfView / 2)`). */
  get planeMagnitude(): number {
    this.ensureCached()
    return this._cachedPlaneMag
  }

  /** Return the forward basis vector as a new {@link Vector2}. */
  forward(): Vector2 {
    this.ensureCached()
    return new Vector2(this._cachedForwardX, this._cachedForwardY)
  }

  /**
   * Write the forward basis vector into `out` (no allocation).
   *
   * @param out - Target vector.
   * @returns `out` for chaining.
   */
  forwardInto(out: Vector2): Vector2 {
    this.ensureCached()
    out.x = this._cachedForwardX
    out.y = this._cachedForwardY
    return out
  }

  /** Return the right basis vector as a new {@link Vector2}. */
  right(): Vector2 {
    this.ensureCached()
    return new Vector2(this._cachedRightX, this._cachedRightY)
  }

  /**
   * Write the right basis vector into `out` (no allocation).
   *
   * @param out - Target vector.
   * @returns `out` for chaining.
   */
  rightInto(out: Vector2): Vector2 {
    this.ensureCached()
    out.x = this._cachedRightX
    out.y = this._cachedRightY
    return out
  }

  /**
   * Return the view-ray direction for screen `column` (camera-space X in [-1, 1]
   * mapped across `columnCount`) as a new {@link Vector2}.
   *
   * @param column - Screen column index.
   * @param columnCount - Total screen columns.
   * @returns A new ray direction.
   */
  viewRayForColumn(column: number, columnCount: number): Vector2 {
    const cameraX = columnCount <= 1 ? 0 : (2 * column) / (columnCount - 1) - 1
    this.ensureCached()
    return new Vector2(
      this._cachedForwardX + this._cachedRightX * this._cachedPlaneMag * cameraX,
      this._cachedForwardY + this._cachedRightY * this._cachedPlaneMag * cameraX,
    )
  }

  /**
   * Write the view-ray direction for screen `column` into `out` (no allocation).
   *
   * @param column - Screen column index.
   * @param columnCount - Total screen columns.
   * @param out - Target vector.
   * @returns `out` for chaining.
   */
  viewRayForColumnInto(column: number, columnCount: number, out: Vector2): Vector2 {
    const cameraX = columnCount <= 1 ? 0 : (2 * column) / (columnCount - 1) - 1
    this.ensureCached()
    out.x = this._cachedForwardX + this._cachedRightX * this._cachedPlaneMag * cameraX
    out.y = this._cachedForwardY + this._cachedRightY * this._cachedPlaneMag * cameraX
    return out
  }

  worldToScreen(point: Vector2, camera: Camera): Vector2 {
    const deltaX = point.x - camera.position.x
    const deltaY = point.y - camera.position.y
    this.ensureCached()
    const forwardDistance = deltaX * this._cachedForwardX + deltaY * this._cachedForwardY
    const rightDistance = deltaX * this._cachedRightX + deltaY * this._cachedRightY
    if (forwardDistance <= 0) {
      return new Vector2(Number.NaN, Number.NaN)
    }
    const normalizedX = rightDistance / forwardDistance / this._cachedPlaneMag
    const column = (normalizedX + 1) * 0.5 * (this.viewportWidth - 1)
    return new Vector2(column, this.viewportHeight / 2)
  }

  screenToWorld(point: Vector2, camera: Camera): Vector2 {
    const direction = this.viewRayForColumn(point.x, this.viewportWidth)
    return new Vector2(camera.position.x + direction.x, camera.position.y + direction.y)
  }
}
