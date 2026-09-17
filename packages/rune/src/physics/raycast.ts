/**
 * DDA grid raycasting (Amanatides–Woo): walks the cells a ray crosses in order
 * and reports the first blocking cell, the side it crossed, and the hit point —
 * the basis for the engine's raycaster renderer and AI sight tests.
 *
 * @module
 */

import { Vector2 } from "@/math/vector2"
import type { CellPredicate } from "./grid"

/** Result of a successful {@link castRay}: where and how the ray struck a cell. */
export interface RaycastHit {
  /** Perpendicular distance from the origin to the hit (corrected for fish-eye). */
  distance: number
  /** Column of the blocking cell. */
  cellColumn: number
  /** Row of the blocking cell. */
  cellRow: number
  /** Which axis the ray crossed to enter the cell — `"x"` or `"y"`. */
  side: "x" | "y"
  /** World-space hit point. */
  hitPoint: Vector2
  /** Texture coordinate across the hit wall, in `[0, 1)`. */
  wallU: number
}

/**
 * Cast a ray through a uniform cell grid using DDA, returning the first cell
 * `isBlocking` accepts. An optional `out` {@link RaycastHit} is filled in place
 * to avoid per-cast allocation.
 *
 * @param origin - Ray origin in world space.
 * @param direction - Ray direction (need not be normalized; need not be zero).
 * @param isBlocking - Returns `true` if the given cell blocks the ray.
 * @param maxDistance - Maximum perpendicular distance to trace.
 * @param out - Optional receiver for the hit, to avoid allocating.
 * @returns The hit (either `out` or a new {@link RaycastHit}), or `null` if no
 *   blocking cell is reached within `maxDistance`.
 */
export function castRay(
  origin: Vector2,
  direction: Vector2,
  isBlocking: CellPredicate,
  maxDistance: number,
  out?: RaycastHit,
): RaycastHit | null {
  if (direction.x === 0 && direction.y === 0) return null
  if (maxDistance <= 0) return null

  let cellColumn = Math.floor(origin.x)
  let cellRow = Math.floor(origin.y)

  const deltaDistX = direction.x === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / direction.x)
  const deltaDistY = direction.y === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / direction.y)

  let stepX: number
  let stepY: number
  let sideDistX: number
  let sideDistY: number

  if (direction.x < 0) {
    stepX = -1
    sideDistX = (origin.x - cellColumn) * deltaDistX
  } else {
    stepX = 1
    sideDistX = (cellColumn + 1 - origin.x) * deltaDistX
  }

  if (direction.y < 0) {
    stepY = -1
    sideDistY = (origin.y - cellRow) * deltaDistY
  } else {
    stepY = 1
    sideDistY = (cellRow + 1 - origin.y) * deltaDistY
  }

  let side: "x" | "y" = "x"
  let perpendicularDistance = 0

  for (let iteration = 0; iteration < 10_000; iteration++) {
    if (sideDistX < sideDistY) {
      perpendicularDistance = sideDistX
      sideDistX += deltaDistX
      cellColumn += stepX
      side = "x"
    } else {
      perpendicularDistance = sideDistY
      sideDistY += deltaDistY
      cellRow += stepY
      side = "y"
    }

    if (perpendicularDistance > maxDistance) return null

    if (isBlocking(cellColumn, cellRow)) {
      const hitPointX = origin.x + direction.x * perpendicularDistance
      const hitPointY = origin.y + direction.y * perpendicularDistance
      const wallU = side === "x" ? hitPointY - Math.floor(hitPointY) : hitPointX - Math.floor(hitPointX)
      if (out) {
        out.distance = perpendicularDistance
        out.cellColumn = cellColumn
        out.cellRow = cellRow
        out.side = side
        out.hitPoint.x = hitPointX
        out.hitPoint.y = hitPointY
        out.wallU = wallU
        return out
      }
      return {
        distance: perpendicularDistance,
        cellColumn,
        cellRow,
        side,
        hitPoint: new Vector2(hitPointX, hitPointY),
        wallU,
      }
    }
  }

  return null
}
