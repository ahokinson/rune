/**
 * Build and sync a 2D {@link Camera} wired to a {@link RaycastProjection} — the
 * standard first-person (DOOM-style) view camera. The camera's position is the
 * eye location in world cells and the projection's `yaw` is the facing angle;
 * sync both from the player each frame with {@link syncFirstPersonCamera}. Kept
 * as an engine primitive so every raycast game configures the view the same way
 * instead of hand-rolling it.
 *
 * @module
 */

import { Camera } from "@/draw/camera"
import { RaycastProjection } from "@/draw/raycast/projection"
import { Angle } from "@/math/angle"
import { Vector2 } from "@/math/vector2"

/** Options for {@link createFirstPersonCamera}. */
export interface FirstPersonCameraOptions {
  /** Horizontal field of view. Default 66° (the classic DOOM value). */
  fieldOfViewDegrees?: number
  /** Viewport width in cells. */
  viewportWidth: number
  /** Viewport height in cells. */
  viewportHeight: number
}

/**
 * Create a first-person {@link Camera} with a {@link RaycastProjection} at the
 * origin, facing +X.
 *
 * @param options - Camera parameters; see {@link FirstPersonCameraOptions}.
 * @returns A new {@link Camera} ready to sync each frame.
 */
export function createFirstPersonCamera(options: FirstPersonCameraOptions): Camera {
  const projection = new RaycastProjection({
    fieldOfView: Angle.fromDegrees(options.fieldOfViewDegrees ?? 66),
    viewportWidth: options.viewportWidth,
    viewportHeight: options.viewportHeight,
  })
  return new Camera(new Vector2(0, 0), projection)
}

/**
 * Anything with a world position and a facing angle drives the view — the player,
 * a spectator, a cutscene rig.
 */
export interface FirstPersonView {
  /** Eye position in world cells. */
  position: Vector2
  /** Facing angle in radians. */
  yaw: number
}

/**
 * Copy a view's position and yaw onto a first-person camera. No-op on the yaw if
 * the camera isn't using a {@link RaycastProjection}.
 *
 * @param camera - Camera to update.
 * @param view - Source position and yaw.
 */
export function syncFirstPersonCamera(camera: Camera, view: FirstPersonView): void {
  camera.position.copyFrom(view.position)
  if (camera.projection instanceof RaycastProjection) {
    camera.projection.yaw = view.yaw
  }
}
