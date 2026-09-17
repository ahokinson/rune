import type { CellPredicate } from "@/physics/grid"

/**
 * Recursive shadowcasting field-of-view (Björn Bergström's algorithm). From an
 * origin cell it sweeps the eight octants, tracking a shrinking range of visible
 * slopes; a blocking cell casts a shadow that narrows the range for everything
 * behind it. The result is symmetric, artifact-free FOV — the standard for
 * roguelike sight and the visibility term of a light source. `reveal` is called
 * once per visible cell (including the origin); `isBlocking` reports opaque cells.
 *
 * @module
 */

/** Options for {@link computeFieldOfView}. */
export interface FieldOfViewOptions {
  /** Origin column. */
  originX: number
  /** Origin row. */
  originY: number
  /** Maximum sight distance in cells (Euclidean). */
  radius: number
  /** Reports whether a cell blocks sight. */
  isBlocking: CellPredicate
  /** Called once per visible cell with its coordinates and distance from origin. */
  reveal: (column: number, row: number, distance: number) => void
}

// Per-octant transform of (row, column-within-row) into world (x, y). The eight
// entries are the sign/axis swaps that map octant-local space to the grid.
const OCTANTS: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [0, -1, 1, 0],
  [-1, 0, 0, 1],
  [-1, 0, 0, -1],
  [0, -1, -1, 0],
  [0, 1, -1, 0],
  [1, 0, 0, -1],
]

/**
 * Compute a symmetric, artifact-free field of view via recursive shadowcasting.
 * `reveal` is called once per visible cell (including the origin).
 *
 * @param options - Origin, radius, blocking predicate, and reveal callback.
 */
export function computeFieldOfView(options: FieldOfViewOptions): void {
  const { originX, originY, radius, isBlocking, reveal } = options
  reveal(originX, originY, 0)
  const radiusSquared = radius * radius

  for (const [xx, xy, yx, yy] of OCTANTS) {
    castLight(1, 1, 0, xx, xy, yx, yy)
  }

  // Scan rows of one octant from `row` outward, between slopes [startSlope, endSlope].
  function castLight(
    row: number,
    startSlope: number,
    endSlope: number,
    xx: number,
    xy: number,
    yx: number,
    yy: number,
  ): void {
    if (startSlope < endSlope) return
    let nextStartSlope = startSlope
    for (let distance = row; distance <= radius; distance++) {
      let blocked = false
      for (let deltaX = -distance; deltaX <= 0; deltaX++) {
        const deltaY = -distance
        const leftSlope = (deltaX - 0.5) / (deltaY + 0.5)
        const rightSlope = (deltaX + 0.5) / (deltaY - 0.5)
        if (rightSlope > startSlope) continue
        if (leftSlope < endSlope) break

        const mapX = originX + deltaX * xx + deltaY * xy
        const mapY = originY + deltaX * yx + deltaY * yy
        const distanceSquared = deltaX * deltaX + deltaY * deltaY
        if (distanceSquared <= radiusSquared) reveal(mapX, mapY, Math.sqrt(distanceSquared))

        const cellBlocks = isBlocking(mapX, mapY)
        if (blocked) {
          if (cellBlocks) {
            nextStartSlope = rightSlope
            continue
          }
          blocked = false
          startSlope = nextStartSlope
        } else if (cellBlocks && distance < radius) {
          // A wall begins a shadow: recurse to scan the strip above it, then
          // continue this row with a narrowed slope range past the wall.
          blocked = true
          castLight(distance + 1, startSlope, leftSlope, xx, xy, yx, yy)
          nextStartSlope = rightSlope
        }
      }
      if (blocked) break
    }
  }
}

/**
 * Collect a field of view into a Set of "column,row" keys, for callers that want
 * a membership test rather than a streaming callback.
 *
 * @param originX - Origin column.
 * @param originY - Origin row.
 * @param radius - Maximum sight distance in cells.
 * @param isBlocking - Reports whether a cell blocks sight.
 * @returns Set of `"column,row"` strings for every visible cell.
 */
export function fieldOfViewSet(
  originX: number,
  originY: number,
  radius: number,
  isBlocking: CellPredicate,
): Set<string> {
  const visible = new Set<string>()
  computeFieldOfView({
    originX,
    originY,
    radius,
    isBlocking,
    reveal: (column, row) => visible.add(`${column},${row}`),
  })
  return visible
}
