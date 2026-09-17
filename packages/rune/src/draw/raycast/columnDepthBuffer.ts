/**
 * Screen-column depth buffer for the raycaster/billboard pass, with optional
 * per-cell refinement (pass a rowCount). Depth convention here is SMALLER =
 * NEARER the camera (a camera-space distance) — the opposite of GridDepthBuffer
 * (larger = nearer). The distinct writeIfCloser / writeIfNearer names keep the
 * two conventions from being confused at a call site.
 *
 * @module
 */

/**
 * Per-column depth buffer using the SMALLER = NEARER convention.
 *
 * Used by the raycaster and billboard pass to resolve visibility and occlude
 * sprites behind walls. An optional per-cell grid refines occlusion row by row.
 */
export class ColumnDepthBuffer {
  /** Column count this buffer was created with. */
  readonly columnCount: number
  /** Per-cell refinement row count (0 means column-only depth). */
  readonly rowCount: number
  private values: Float32Array
  private rowValues: Float32Array
  private dirtyMin: number
  private dirtyMax: number

  /**
   * Create a new buffer, optionally with per-cell refinement.
   *
   * @param columnCount - Number of screen columns.
   * @param rowCount - Per-cell row count for refinement (default 0, column-only).
   */
  constructor(columnCount: number, rowCount: number = 0) {
    this.columnCount = Math.max(0, Math.floor(columnCount))
    this.rowCount = Math.max(0, Math.floor(rowCount))
    this.values = new Float32Array(this.columnCount)
    this.rowValues = new Float32Array(this.columnCount * this.rowCount)
    this.dirtyMin = 0
    this.dirtyMax = this.columnCount > 0 ? this.columnCount - 1 : 0
    this.values.fill(Number.POSITIVE_INFINITY)
    this.rowValues.fill(Number.POSITIVE_INFINITY)
  }

  /**
   * Clear columns written since the last clear to `value`, and reset the per-cell
   * grid if present. Only dirty columns are reset, so it can be called every frame
   * cheaply.
   *
   * @param value - Depth to fill with (default +Infinity, meaning "nothing nearer").
   */
  clear(value = Number.POSITIVE_INFINITY): void {
    const min = this.dirtyMin
    const max = Math.min(this.dirtyMax, this.columnCount - 1)
    if (min <= max && min < this.columnCount) {
      for (let i = min; i <= max; i++) {
        this.values[i] = value
      }
    }
    this.dirtyMin = this.columnCount
    this.dirtyMax = -1
    if (this.rowCount > 0) {
      this.rowValues.fill(value)
    }
  }

  /**
   * Store `depth` for `column` and mark the column dirty.
   *
   * @param column - Column index.
   * @param depth - Depth value.
   */
  set(column: number, depth: number): void {
    if (column < 0 || column >= this.columnCount) return
    this.values[column] = depth
    if (column < this.dirtyMin) this.dirtyMin = column
    if (column > this.dirtyMax) this.dirtyMax = column
  }

  /**
   * Read the column depth. Out-of-bounds reads return +Infinity.
   *
   * @param column - Column index.
   * @returns Stored depth, or +Infinity if `column` is outside the buffer.
   */
  get(column: number): number {
    if (column < 0 || column >= this.columnCount) return Number.POSITIVE_INFINITY
    return this.values[column] ?? Number.POSITIVE_INFINITY
  }

  /**
   * Store `depth` for the per-cell (column, row). No-op when the buffer has no
   * per-cell refinement.
   *
   * @param column - Column index.
   * @param row - Row index.
   * @param depth - Depth value.
   */
  setCell(column: number, row: number, depth: number): void {
    if (this.rowCount <= 0) return
    if (column < 0 || column >= this.columnCount) return
    if (row < 0 || row >= this.rowCount) return
    this.rowValues[row * this.columnCount + column] = depth
  }

  /**
   * Read the per-cell depth at (column, row). Returns +Infinity when there is no
   * per-cell refinement or the index is out of bounds.
   *
   * @param column - Column index.
   * @param row - Row index.
   * @returns Stored depth, or +Infinity if unavailable.
   */
  getCell(column: number, row: number): number {
    if (this.rowCount <= 0) return Number.POSITIVE_INFINITY
    if (column < 0 || column >= this.columnCount) return Number.POSITIVE_INFINITY
    if (row < 0 || row >= this.rowCount) return Number.POSITIVE_INFINITY
    return this.rowValues[row * this.columnCount + column] ?? Number.POSITIVE_INFINITY
  }

  /**
   * Write `depth` if it is strictly closer (smaller) than what's stored.
   *
   * @param column - Column index.
   * @param depth - Candidate depth (SMALLER = NEARER).
   * @returns `true` if the depth won the test and was written.
   */
  writeIfCloser(column: number, depth: number): boolean {
    if (column < 0 || column >= this.columnCount) return false
    const current = this.values[column] ?? Number.POSITIVE_INFINITY
    if (depth < current) {
      this.values[column] = depth
      if (column < this.dirtyMin) this.dirtyMin = column
      if (column > this.dirtyMax) this.dirtyMax = column
      return true
    }
    return false
  }
}
