/**
 * Swept-AABB collision primitives: axis-aligned rectangle intersection, point
 * containment, and the time-of-impact sweep used by the engine's
 * `moveAndCollide` solver.
 *
 * @module
 */

import type { Rectangle } from "@/math/rectangle"
import type { Vector2 } from "@/math/vector2"

/**
 * Test whether two axis-aligned rectangles overlap.
 *
 * @param rectangleA - First rectangle.
 * @param rectangleB - Second rectangle.
 * @returns `true` if the rectangles share any area.
 */
export function intersects(rectangleA: Rectangle, rectangleB: Rectangle): boolean {
  return rectangleA.intersects(rectangleB)
}

/**
 * Test whether `point` lies inside `rectangle` (edges inclusive).
 *
 * @param rectangle - Bounds to test against.
 * @param point - Point to test.
 * @returns `true` if the point is within the rectangle.
 */
export function contains(rectangle: Rectangle, point: Vector2): boolean {
  return rectangle.contains(point)
}

/**
 * Result of a swept-AABB collision: the contact time and contact normal of the
 * first obstacle hit, plus the resolved position of the moving rectangle.
 */
export interface SweepHit {
  /** Time of impact in `[0, 1]`, as a fraction of the swept displacement. */
  time: number
  /** X component of the contact normal (−1, 0, or +1). */
  normalX: number
  /** Y component of the contact normal (−1, 0, or +1). */
  normalY: number
  /** The obstacle rectangle that was hit. */
  obstacle: Rectangle
  /** Resolved X position of the moving rectangle at the moment of impact. */
  positionX: number
  /** Resolved Y position of the moving rectangle at the moment of impact. */
  positionY: number
}

/** Per-axis sweep result: the entry/exit time window and contact normal. */
interface AxisSweep {
  enterTime: number
  exitTime: number
  normal: number
}

/**
 * Sweep one axis: return the time interval over which `[start, start + size]`
 * overlaps `[obstacleStart, obstacleStart + obstacleSize]` while moving by
 * `delta`, along with the contact normal sign for that axis.
 *
 * @param start - Moving span origin.
 * @param size - Moving span length.
 * @param delta - Displacement along this axis.
 * @param obstacleStart - Obstacle span origin.
 * @param obstacleSize - Obstacle span length.
 * @returns The sweep window, or `null` if the spans never overlap.
 */
function sweepAxis(
  start: number,
  size: number,
  delta: number,
  obstacleStart: number,
  obstacleSize: number,
): AxisSweep | null {
  if (delta === 0) {
    if (start + size <= obstacleStart || start >= obstacleStart + obstacleSize) {
      return null
    }
    return { enterTime: -Infinity, exitTime: Infinity, normal: 0 }
  }
  const inverseDelta = 1 / delta
  let entry: number
  let exit: number
  let normal: number
  if (delta > 0) {
    entry = (obstacleStart - (start + size)) * inverseDelta
    exit = (obstacleStart + obstacleSize - start) * inverseDelta
    normal = -1
  } else {
    entry = (obstacleStart + obstacleSize - start) * inverseDelta
    exit = (obstacleStart - (start + size)) * inverseDelta
    normal = 1
  }
  return { enterTime: entry, exitTime: exit, normal }
}

/**
 * Sweep `moving` by `(deltaX, deltaY)` and return the earliest obstacle hit in
 * the normalized interval `[0, 1]`. Resolves each axis independently and picks
 * the latest entry time across both axes as the contact moment.
 *
 * @param moving - The rectangle being moved.
 * @param deltaX - X displacement for this step.
 * @param deltaY - Y displacement for this step.
 * @param obstacles - Candidate rectangles to test against.
 * @returns The earliest {@link SweepHit}, or `null` if none is struck.
 */
export function sweep(
  moving: Rectangle,
  deltaX: number,
  deltaY: number,
  obstacles: readonly Rectangle[],
): SweepHit | null {
  let nearestTime = 1
  let hit: SweepHit | null = null
  for (const obstacle of obstacles) {
    const sweepX = sweepAxis(moving.x, moving.width, deltaX, obstacle.x, obstacle.width)
    const sweepY = sweepAxis(moving.y, moving.height, deltaY, obstacle.y, obstacle.height)
    if (!sweepX || !sweepY) continue
    const entry = Math.max(sweepX.enterTime, sweepY.enterTime)
    const exit = Math.min(sweepX.exitTime, sweepY.exitTime)
    if (entry > exit) continue
    if (entry < 0 || entry > 1) continue
    if (entry >= nearestTime) continue
    nearestTime = entry
    const normalX = sweepX.enterTime > sweepY.enterTime ? sweepX.normal : 0
    const normalY = sweepY.enterTime >= sweepX.enterTime ? sweepY.normal : 0
    hit = {
      time: entry,
      normalX,
      normalY,
      obstacle,
      positionX: moving.x + deltaX * entry,
      positionY: moving.y + deltaY * entry,
    }
  }
  return hit
}
