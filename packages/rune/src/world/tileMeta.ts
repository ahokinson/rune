/**
 * A sparse per-cell side-table keyed by column/row. Tile games keep mutable
 * per-cell data (a block's hidden item, a brick's remaining coins, a door's
 * state) outside the static grid; this is the standard place for it instead of
 * each game spelling out its own `Map<string, T>` keyed by a "col,row" string.
 *
 * @module
 */

/**
 * Sparse per-cell side-table keyed by (column, row).
 *
 * @typeParam T - Stored value type.
 */
export class TileMeta<T> {
  private readonly entries = new Map<string, T>()

  private static key(column: number, row: number): string {
    return `${column},${row}`
  }

  /**
   * @param column - Cell column.
   * @param row - Cell row.
   * @returns The value at (column, row), or `undefined` if unset.
   */
  get(column: number, row: number): T | undefined {
    return this.entries.get(TileMeta.key(column, row))
  }

  /**
   * Store `value` at (column, row).
   *
   * @param column - Cell column.
   * @param row - Cell row.
   * @param value - Value to store.
   */
  set(column: number, row: number, value: T): void {
    this.entries.set(TileMeta.key(column, row), value)
  }

  /**
   * @param column - Cell column.
   * @param row - Cell row.
   * @returns `true` if a value is stored at (column, row).
   */
  has(column: number, row: number): boolean {
    return this.entries.has(TileMeta.key(column, row))
  }

  /**
   * Remove the value at (column, row).
   *
   * @param column - Cell column.
   * @param row - Cell row.
   * @returns `true` if a value was present and removed.
   */
  delete(column: number, row: number): boolean {
    return this.entries.delete(TileMeta.key(column, row))
  }

  /** Number of stored entries. */
  get size(): number {
    return this.entries.size
  }

  /**
   * Iterate every stored entry.
   *
   * @param callback - Called per entry with the value and its (column, row).
   */
  forEach(callback: (value: T, column: number, row: number) => void): void {
    for (const [key, value] of this.entries) {
      const comma = key.indexOf(",")
      const column = Number(key.slice(0, comma))
      const row = Number(key.slice(comma + 1))
      callback(value, column, row)
    }
  }
}
