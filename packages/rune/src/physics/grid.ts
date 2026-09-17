/**
 * Grid helpers: cell indexing and a Bresenham line-of-sight test over a 2D cell
 * grid, used by raycasting and AI sight checks.
 *
 * @module
 */

import type { Vector2 } from "@/math/vector2"

/** A cell coordinate in a uniform grid. */
export interface GridCell {
  /** Grid column (X index). */
  column: number
  /** Grid row (Y index). */
  row: number
}

/**
 * Map a world-space point to its containing grid cell.
 *
 * @param point - World-space position.
 * @param cellSize - Width of one cell (`0` is treated as `1`).
 * @returns The cell the point falls within.
 */
export function cellAt(point: Vector2, cellSize: number): GridCell {
  const size = cellSize === 0 ? 1 : cellSize
  return {
    column: Math.floor(point.x / size),
    row: Math.floor(point.y / size),
  }
}

/** Predicate over a cell coordinate — used to test whether a cell blocks a ray/line. */
export type CellPredicate = (column: number, row: number) => boolean

/**
 * Bresenham line-of-sight from `from` to `to`: walks the cells the line crosses
 * and returns `false` as soon as `isBlocking` rejects one.
 *
 * @param from - Start point (its starting cell is never tested).
 * @param to - End point.
 * @param isBlocking - Returns `true` if the given cell blocks the line.
 * @returns `true` if no blocking cell lies between `from` and `to`.
 */
export function lineOfSight(from: Vector2, to: Vector2, isBlocking: CellPredicate): boolean {
  let x0 = Math.floor(from.x)
  let y0 = Math.floor(from.y)
  const x1 = Math.floor(to.x)
  const y1 = Math.floor(to.y)
  const deltaX = Math.abs(x1 - x0)
  const deltaY = -Math.abs(y1 - y0)
  const stepX = x0 < x1 ? 1 : -1
  const stepY = y0 < y1 ? 1 : -1
  let error = deltaX + deltaY
  while (true) {
    if (!(x0 === Math.floor(from.x) && y0 === Math.floor(from.y))) {
      if (isBlocking(x0, y0)) return false
    }
    if (x0 === x1 && y0 === y1) return true
    const doubleError = 2 * error
    if (doubleError >= deltaY) {
      if (x0 === x1) return true
      error += deltaY
      x0 += stepX
    }
    if (doubleError <= deltaX) {
      if (y0 === y1) return true
      error += deltaX
      y0 += stepY
    }
  }
}
