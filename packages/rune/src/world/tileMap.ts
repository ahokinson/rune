/**
 * A 2D grid of cells addressed by (column, row). Construct it filled with a
 * single value, or parse it from an ASCII layout via {@link TileMap.fromString}
 * using a symbol → cell mapping. Bounds-checked `get`/`set` and a row-major
 * `forEach` cover the common iteration patterns.
 *
 * @module
 */

/**
 * A 2D grid of cells addressed by (column, row).
 *
 * @typeParam TCell - Cell value type.
 */
export class TileMap<TCell> {
  /** Grid width in cells. */
  readonly width: number
  /** Grid height in cells. */
  readonly height: number
  /** Row-major cell storage; `cells[row * width + column]`. */
  readonly cells: TCell[]

  /**
   * @param width - Grid width in cells.
   * @param height - Grid height in cells.
   * @param fill - Value every cell is initialised to.
   */
  constructor(width: number, height: number, fill: TCell) {
    this.width = Math.max(0, Math.floor(width))
    this.height = Math.max(0, Math.floor(height))
    this.cells = new Array(this.width * this.height)
    for (let index = 0; index < this.cells.length; index++) {
      this.cells[index] = fill
    }
  }

  private indexFor(column: number, row: number): number {
    return row * this.width + column
  }

  /**
   * @param column - Cell column.
   * @param row - Cell row.
   * @returns `true` if (column, row) is inside the grid.
   */
  inBounds(column: number, row: number): boolean {
    return column >= 0 && row >= 0 && column < this.width && row < this.height
  }

  /**
   * @param column - Cell column.
   * @param row - Cell row.
   * @returns The cell at (column, row), or `undefined` if out of bounds.
   */
  get(column: number, row: number): TCell | undefined {
    if (!this.inBounds(column, row)) return undefined
    return this.cells[this.indexFor(column, row)]
  }

  /**
   * Write `value` to (column, row). No-ops silently when out of bounds.
   *
   * @param column - Cell column.
   * @param row - Cell row.
   * @param value - Value to write.
   */
  set(column: number, row: number, value: TCell): void {
    if (!this.inBounds(column, row)) return
    this.cells[this.indexFor(column, row)] = value
  }

  /**
   * Iterate every cell in row-major order.
   *
   * @param callback - Called per cell with the cell value and its (column, row).
   */
  forEach(callback: (cell: TCell, column: number, row: number) => void): void {
    for (let row = 0; row < this.height; row++) {
      for (let column = 0; column < this.width; column++) {
        const cell = this.cells[this.indexFor(column, row)] as TCell
        callback(cell, column, row)
      }
    }
  }

  /**
   * Parse an ASCII `source` into a grid using `mapping` (symbol → cell); any
   * character missing from `mapping` keeps the `fallback` cell. Leading and
   * trailing blank lines are stripped; ragged rows are padded with `fallback`.
   *
   * @typeParam TCell - Cell value type.
   * @param source - Multi-line ASCII layout.
   * @param mapping - Symbol → cell lookup.
   * @param fallback - Cell for blank or unmapped characters.
   * @returns A new {@link TileMap}.
   */
  static fromString<TCell>(source: string, mapping: Record<string, TCell>, fallback: TCell): TileMap<TCell> {
    const lines = source.replace(/\r\n/g, "\n").split("\n")
    while (lines.length > 0 && lines[0] === "") lines.shift()
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()
    const height = lines.length
    let width = 0
    for (const line of lines) if (line.length > width) width = line.length
    const map = new TileMap<TCell>(width, height, fallback)
    for (let row = 0; row < height; row++) {
      const line = lines[row] ?? ""
      for (let column = 0; column < width; column++) {
        const character = line[column]
        if (character === undefined) continue
        const cell = mapping[character]
        if (cell !== undefined) map.set(column, row, cell)
      }
    }
    return map
  }
}
