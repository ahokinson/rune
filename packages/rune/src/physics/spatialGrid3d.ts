/**
 * A 3D hash-grid broad phase, the volumetric companion to SpatialGrid. Space is
 * diced into cubic cells; each inserted item is filed under every cell its AABB
 * overlaps, so a region query only compares against items sharing a cell instead
 * of the whole world — the standard cheap first pass before exact collision or
 * for frustum/range culling in Scene3D. Unlike the 2D grid (which reads
 * Entity2D.bounds), 3D entities carry no built-in AABB, so the caller supplies
 * each item's box explicitly; the grid stays generic over the item type.
 *
 * @module
 */

/** A 3D axis-aligned bounding box in min/max form. */
export interface AABB3 {
  /** Minimum X corner. */
  minX: number
  /** Minimum Y corner. */
  minY: number
  /** Minimum Z corner. */
  minZ: number
  /** Maximum X corner. */
  maxX: number
  /** Maximum Y corner. */
  maxY: number
  /** Maximum Z corner. */
  maxZ: number
}

/** A uniform 3D hash grid bucketing items of type `T` by an explicit {@link AABB3}. */
export class SpatialGrid3D<T> {
  /** Edge length of one cubic cell. */
  readonly cellSize: number
  private readonly buckets: Map<string, T[]> = new Map()

  /**
   * @param cellSize - Cell edge length; must be `> 0`.
   */
  constructor(cellSize: number) {
    if (cellSize <= 0) throw new Error("SpatialGrid3D: cellSize must be > 0")
    this.cellSize = cellSize
  }

  private keyFor(column: number, row: number, depth: number): string {
    return `${column},${row},${depth}`
  }

  private cellRange(box: AABB3): {
    minC: number
    maxC: number
    minR: number
    maxR: number
    minD: number
    maxD: number
  } {
    return {
      minC: Math.floor(box.minX / this.cellSize),
      maxC: Math.floor(box.maxX / this.cellSize),
      minR: Math.floor(box.minY / this.cellSize),
      maxR: Math.floor(box.maxY / this.cellSize),
      minD: Math.floor(box.minZ / this.cellSize),
      maxD: Math.floor(box.maxZ / this.cellSize),
    }
  }

  /** Drop every inserted item. */
  clear(): void {
    this.buckets.clear()
  }

  /**
   * File `item` under every cell its `box` overlaps.
   *
   * @param item - Item to insert.
   * @param box - The item's 3D bounds.
   */
  insert(item: T, box: AABB3): void {
    const range = this.cellRange(box)
    for (let depth = range.minD; depth <= range.maxD; depth++) {
      for (let row = range.minR; row <= range.maxR; row++) {
        for (let column = range.minC; column <= range.maxC; column++) {
          const key = this.keyFor(column, row, depth)
          const bucket = this.buckets.get(key)
          if (bucket) bucket.push(item)
          else this.buckets.set(key, [item])
        }
      }
    }
  }

  /**
   * Items whose cells overlap `box`. Deduplicated, since a large item spans cells.
   *
   * @param box - Query bounds.
   * @returns Set of candidate items.
   */
  query(box: AABB3): Set<T> {
    const results = new Set<T>()
    const range = this.cellRange(box)
    for (let depth = range.minD; depth <= range.maxD; depth++) {
      for (let row = range.minR; row <= range.maxR; row++) {
        for (let column = range.minC; column <= range.maxC; column++) {
          const bucket = this.buckets.get(this.keyFor(column, row, depth))
          if (!bucket) continue
          for (const item of bucket) results.add(item)
        }
      }
    }
    return results
  }
}
