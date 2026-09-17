/**
 * View camera: holds a world-space position and a projection, and provides
 * smoothing plus snapshot/interpolation helpers for frame-rate-independent
 * render loops.
 *
 * @module
 */

import { Angle } from "@/math/angle"
import { lerp } from "@/math/scalar"
import { Vector2 } from "@/math/vector2"
import { OrthographicProjection, type Projection, RaycastProjection } from "./raycast/projection"

/**
 * View camera combining a world position with a projection.
 *
 * @example
 * ```ts
 * const camera = new Camera(new Vector2(0, 0), new OrthographicProjection(1))
 * camera.follow(target, 0.1)        // ease toward target each update
 * camera.snapshot()                 // capture state for interpolation
 * camera.applyInterpolation(0.5)    // blend toward snapshot for rendering
 * camera.restoreInterpolation()     // restore true position after render
 * ```
 */
export class Camera {
  /** World-space position of the camera centre. */
  position: Vector2
  /** Projection used to map world points to screen space. */
  projection: Projection

  private previousPosition: Vector2 | null = null
  private previousYaw: number | null = null
  private renderPosition: Vector2 | null = null
  private savedPosition: Vector2 | null = null
  private savedYaw: number | null = null

  /**
   * @param position - Initial world position (default origin).
   * @param projection - Projection to use (default unit orthographic).
   */
  constructor(position: Vector2 = new Vector2(0, 0), projection: Projection = new OrthographicProjection(1)) {
    this.position = position
    this.projection = projection
  }

  /**
   * Project a world-space point to screen space.
   *
   * @param point - World coordinate.
   * @returns Screen-space coordinate.
   */
  worldToScreen(point: Vector2): Vector2 {
    return this.projection.worldToScreen(point, this)
  }

  /**
   * Unproject a screen-space point back to world space.
   *
   * @param point - Screen coordinate.
   * @returns World-space coordinate.
   */
  screenToWorld(point: Vector2): Vector2 {
    return this.projection.screenToWorld(point, this)
  }

  /**
   * Ease the camera position toward `target` by `smoothing`.
   *
   * @param target - Position to move toward.
   * @param smoothing - Blend factor in 0..1 (0 = no move, 1 = snap; default 1).
   */
  follow(target: Vector2, smoothing = 1): void {
    const factor = smoothing <= 0 ? 0 : smoothing >= 1 ? 1 : smoothing
    this.position.x = lerp(this.position.x, target.x, factor)
    this.position.y = lerp(this.position.y, target.y, factor)
  }

  /**
   * Capture the current position (and yaw, for raycast projections) as the
   * previous-frame state for {@link applyInterpolation}.
   */
  snapshot(): void {
    if (!this.previousPosition) this.previousPosition = this.position.clone()
    else this.previousPosition.copyFrom(this.position)
    if (this.projection instanceof RaycastProjection) {
      this.previousYaw = this.projection.yaw
    } else {
      this.previousYaw = null
    }
  }

  /**
   * Overwrite the camera's render position with an interpolated blend of the
   * previous snapshot and the current state, for use between update and render.
   *
   * @param alpha - Blend factor in 0..1 (0 = previous, 1 = current).
   * @returns `true` if interpolation was applied; `false` if no snapshot exists or `alpha` is 0.
   */
  applyInterpolation(alpha: number): boolean {
    if (this.previousPosition === null || alpha <= 0) return false
    const clamped = alpha >= 1 ? 1 : alpha
    if (!this.renderPosition) this.renderPosition = new Vector2(0, 0)
    if (!this.savedPosition) this.savedPosition = new Vector2(0, 0)
    this.savedPosition.copyFrom(this.position)
    this.renderPosition.x = lerp(this.previousPosition.x, this.savedPosition.x, clamped)
    this.renderPosition.y = lerp(this.previousPosition.y, this.savedPosition.y, clamped)
    this.position = this.renderPosition
    const projection = this.projection
    if (projection instanceof RaycastProjection && this.previousYaw !== null) {
      this.savedYaw = projection.yaw
      projection.yaw = Angle.lerpShortest(this.previousYaw, projection.yaw, clamped)
    }
    return true
  }

  /**
   * Restore the true camera position after a rendering pass that called
   * {@link applyInterpolation}.
   */
  restoreInterpolation(): void {
    if (this.savedPosition) {
      this.position = this.savedPosition
    }
    if (this.savedYaw !== null && this.projection instanceof RaycastProjection) {
      this.projection.yaw = this.savedYaw
      this.savedYaw = null
    }
  }
}
