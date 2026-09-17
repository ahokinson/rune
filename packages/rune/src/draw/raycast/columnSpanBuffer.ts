/**
 * Per-column (startRow, endRow) span buffer for the raycaster, tracking which
 * rows of each screen column have been filled.
 *
 * @module
 */

/**
 * Stores an optional inclusive (startRow, endRow) span per column in a packed
 * `Int16Array`. Unset columns read -1. Used to track filled row ranges during
 * raycast rendering.
 */
export class ColumnSpanBuffer {
  /** Column count this buffer was created with. */
  readonly columnCount: number
  private readonly data: Int16Array

  /**
   * @param columnCount - Number of screen columns.
   */
  constructor(columnCount: number) {
    this.columnCount = Math.max(0, Math.floor(columnCount))
    this.data = new Int16Array(this.columnCount * 2)
    this.clear()
  }

  /** Reset every column to unset (-1). */
  clear(): void {
    this.data.fill(-1)
  }

  /**
   * Record the inclusive span `[startRow, endRow]` for `column`.
   *
   * @param column - Column index.
   * @param startRow - First row of the span.
   * @param endRow - Last row of the span.
   */
  set(column: number, startRow: number, endRow: number): void {
    if (column < 0 || column >= this.columnCount) return
    const offset = column * 2
    this.data[offset] = startRow
    this.data[offset + 1] = endRow
  }

  /**
   * Whether `column` has a recorded span.
   *
   * @param column - Column index.
   * @returns `true` if a span has been set.
   */
  hasSpan(column: number): boolean {
    if (column < 0 || column >= this.columnCount) return false
    return this.data[column * 2] !== -1
  }

  /**
   * First row of the span at `column`.
   *
   * @param column - Column index.
   * @returns Start row, or -1 if unset or out of bounds.
   */
  spanStartAt(column: number): number {
    if (column < 0 || column >= this.columnCount) return -1
    return this.data[column * 2] ?? -1
  }

  /**
   * Last row of the span at `column`.
   *
   * @param column - Column index.
   * @returns End row, or -1 if unset or out of bounds.
   */
  spanEndAt(column: number): number {
    if (column < 0 || column >= this.columnCount) return -1
    return this.data[column * 2 + 1] ?? -1
  }
}
