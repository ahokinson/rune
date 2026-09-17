/**
 * Axis-separated swept-AABB movement: moves a rectangle by `(deltaX, deltaY)`
 * against axis-aligned obstacles, resolving each axis independently so the box
 * stops flush against terrain instead of tunnelling at speed.
 *
 * @module
 */

import type { Rectangle } from "@/math/rectangle"
import { type SweepHit, sweep } from "./boundingBox"

/** Result of a `moveAndCollide` step: which axes hit, and any bonked ceiling. */
export interface CollisionResult {
  /** `true` if the X-axis sweep was arrested by an obstacle. */
  hitX: boolean
  /** `true` if the body landed on a floor this step (downward-facing normal). */
  grounded: boolean
  /** The tile rectangle bonked from below this step, if any. */
  ceiling: Rectangle | null
}

export type { SweepHit }

/**
 * Move `box` by `(deltaX, deltaY)` against axis-aligned obstacles, resolving each
 * axis independently with the engine's swept-AABB test so the box stops flush
 * against terrain instead of tunnelling through it at speed. `box` is mutated to
 * the resolved position; the caller zeroes whatever velocity component collided.
 *
 * @param box - The AABB to move; mutated to the resolved position.
 * @param deltaX - X displacement for this step.
 * @param deltaY - Y displacement for this step.
 * @param obstacles - Axis-aligned terrain rectangles to collide against.
 * @returns The {@link CollisionResult} describing this step's collisions.
 */
export function moveAndCollide(
  box: Rectangle,
  deltaX: number,
  deltaY: number,
  obstacles: readonly Rectangle[],
): CollisionResult {
  const result: CollisionResult = { hitX: false, grounded: false, ceiling: null }

  if (deltaX !== 0) {
    const hit = sweep(box, deltaX, 0, obstacles)
    if (hit) {
      box.x = hit.positionX
      result.hitX = true
    } else {
      box.x += deltaX
    }
  }

  if (deltaY !== 0) {
    const hit = sweep(box, 0, deltaY, obstacles)
    if (hit) {
      box.y = hit.positionY
      if (hit.normalY < 0) result.grounded = true
      else if (hit.normalY > 0) result.ceiling = hit.obstacle
    } else {
      box.y += deltaY
    }
  }

  return result
}
