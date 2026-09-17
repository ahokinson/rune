/**
 * 2D hash-grid broad phase: dices the world into square cells and files each
 * inserted {@link Entity2D} under every cell its bounds overlap, so a region
 * query only compares against entities sharing a cell instead of the whole
 * world. The standard cheap first pass before exact collision.
 *
 * @module
 */

import type { Rectangle } from "@/math/rectangle"
import type { Entity2D } from "@/scene/entity2d"

/** A uniform 2D hash grid that buckets {@link Entity2D} instances by their bounds. */
export class SpatialGrid {
  /** Edge length of one cell. */
  readonly cellSize: number
  private readonly buckets: Map<number, Entity2D[]> = new Map()

  /**
   * @param cellSize - Cell edge length; must be `> 0`.
   */
  constructor(cellSize: number) {
    if (cellSize <= 0) throw new Error("SpatialGrid: cellSize must be > 0")
    this.cellSize = cellSize
  }

  private keyFor(column: number, row: number): number {
    return ((column + 32768) << 16) | ((row + 32768) & 0xffff)
  }

  private boundsToCellRange(bounds: Rectangle): {
    minColumn: number
    maxColumn: number
    minRow: number
    maxRow: number
  } {
    return {
      minColumn: Math.floor(bounds.left / this.cellSize),
      maxColumn: Math.floor(bounds.right / this.cellSize),
      minRow: Math.floor(bounds.top / this.cellSize),
      maxRow: Math.floor(bounds.bottom / this.cellSize),
    }
  }

  /** Drop every inserted entity. */
  clear(): void {
    this.buckets.clear()
  }

  /**
   * File `entity` under every cell its bounds overlap.
   *
   * @param entity - Entity to insert.
   */
  insert(entity: Entity2D): void {
    const range = this.boundsToCellRange(entity.bounds)
    for (let row = range.minRow; row <= range.maxRow; row++) {
      for (let column = range.minColumn; column <= range.maxColumn; column++) {
        const key = this.keyFor(column, row)
        const bucket = this.buckets.get(key)
        if (bucket) bucket.push(entity)
        else this.buckets.set(key, [entity])
      }
    }
  }

  /**
   * Return every entity whose bounds overlap any cell intersected by `bounds`.
   * The result is deduplicated (a large entity spans several cells).
   *
   * @param bounds - Query rectangle.
   * @returns Set of candidate entities.
   */
  query(bounds: Rectangle): Set<Entity2D> {
    const results = new Set<Entity2D>()
    const range = this.boundsToCellRange(bounds)
    for (let row = range.minRow; row <= range.maxRow; row++) {
      for (let column = range.minColumn; column <= range.maxColumn; column++) {
        const bucket = this.buckets.get(this.keyFor(column, row))
        if (!bucket) continue
        for (const entity of bucket) results.add(entity)
      }
    }
    return results
  }
}
