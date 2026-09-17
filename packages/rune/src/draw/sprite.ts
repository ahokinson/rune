/**
 * Glyph-grid sprites and blitting: a 2D array of coloured, optionally
 * transparent cells drawn onto a {@link Canvas}, with or without a camera.
 *
 * @module
 */

import { Vector2 } from "@/math/vector2"
import type { Camera } from "./camera"
import type { Canvas } from "./canvas"
import { Color } from "./color"

/** A single cell of a {@link Sprite}: glyph, colours, and transparency flag. */
export interface SpriteCell {
  /** Glyph to draw. */
  character: string
  /** Foreground colour. */
  foreground: Color
  /** Background colour, or `null` for a transparent background. */
  background: Color | null
  /** If `true`, the cell is skipped when blitting. */
  transparent: boolean
}

/** A legend entry mapping an ASCII-art character to a {@link Sprite} cell spec. */
export interface SpriteLegendEntry {
  /** Glyph to draw (defaults to the legend key character). */
  character?: string
  /** Foreground colour. */
  foreground: Color
  /** Background colour, or `null` for transparent (default `null`). */
  background?: Color | null
}

/**
 * A 2D grid of optionally transparent, coloured glyphs that can be blitted onto
 * a canvas.
 *
 * @example
 * ```ts
 * const sprite = Sprite.fromString("##\n##", Color.RED)
 * drawSprite(canvas, sprite, 10, 5)
 * ```
 */
export class Sprite {
  /** Width in cells. */
  readonly width: number
  /** Height in cells. */
  readonly height: number
  private readonly cells: SpriteCell[]

  /**
   * @param width - Width in cells (clamped to ≥ 0).
   * @param height - Height in cells (clamped to ≥ 0).
   */
  constructor(width: number, height: number) {
    this.width = Math.max(0, Math.floor(width))
    this.height = Math.max(0, Math.floor(height))
    this.cells = new Array(this.width * this.height)
    for (let index = 0; index < this.cells.length; index++) {
      this.cells[index] = {
        character: " ",
        foreground: Color.WHITE,
        background: null,
        transparent: true,
      }
    }
  }

  private indexFor(x: number, y: number): number {
    return y * this.width + x
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  /**
   * Set a cell's glyph and colours; marks it non-transparent. Out-of-bounds
   * writes are ignored.
   *
   * @param x - Column.
   * @param y - Row.
   * @param character - Glyph to write.
   * @param foreground - Glyph colour (default white).
   * @param background - Cell background, or `null` for transparent (default `null`).
   */
  setCell(
    x: number,
    y: number,
    character: string,
    foreground: Color = Color.WHITE,
    background: Color | null = null,
  ): void {
    if (!this.inBounds(x, y)) return
    const cell = this.cells[this.indexFor(x, y)]
    if (!cell) return
    cell.character = character
    cell.foreground = foreground
    cell.background = background
    cell.transparent = false
  }

  /**
   * Read the cell at `(x, y)`.
   *
   * @param x - Column.
   * @param y - Row.
   * @returns The cell, or `null` if out of bounds.
   */
  cellAt(x: number, y: number): SpriteCell | null {
    if (!this.inBounds(x, y)) return null
    return this.cells[this.indexFor(x, y)] ?? null
  }

  /**
   * Build a sprite from ASCII art plus a legend mapping each character to a
   * colour and optional glyph. Spaces and characters missing from the legend
   * are left transparent.
   *
   * @param source - ASCII art (leading/trailing blank lines trimmed).
   * @param legend - Map from character to {@link SpriteLegendEntry}.
   * @returns A new {@link Sprite}.
   */
  static fromLegend(source: string, legend: Record<string, SpriteLegendEntry>): Sprite {
    const lines = source.replace(/\r\n/g, "\n").split("\n")
    while (lines.length > 0 && lines[0] === "") lines.shift()
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()
    const height = lines.length
    let width = 0
    for (const line of lines) if (line.length > width) width = line.length
    const sprite = new Sprite(width, height)
    for (let y = 0; y < height; y++) {
      const line = lines[y] ?? ""
      for (let x = 0; x < line.length; x++) {
        const key = line[x] as string
        if (key === " ") continue
        const spec = legend[key]
        if (!spec) continue
        const ch = spec.character ?? key
        sprite.setCell(x, y, ch, spec.foreground, spec.background ?? null)
      }
    }
    return sprite
  }

  /**
   * Build a sprite from ASCII art in a single foreground colour. Spaces and
   * `.` are treated as transparent.
   *
   * @param source - ASCII art (leading/trailing blank lines trimmed).
   * @param foreground - Glyph colour (default white).
   * @returns A new {@link Sprite}.
   */
  static fromString(source: string, foreground: Color = Color.WHITE): Sprite {
    const lines = source.replace(/\r\n/g, "\n").split("\n")
    while (lines.length > 0 && lines[0] === "") lines.shift()
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()
    const height = lines.length
    let width = 0
    for (const line of lines) if (line.length > width) width = line.length
    const sprite = new Sprite(width, height)
    for (let y = 0; y < height; y++) {
      const line = lines[y] ?? ""
      for (let x = 0; x < line.length; x++) {
        const character = line[x] as string
        if (character === " " || character === ".") continue
        sprite.setCell(x, y, character, foreground, null)
      }
    }
    return sprite
  }
}

/**
 * Blit a {@link Sprite} onto `canvas` at `(x, y)`, optionally transformed by a
 * camera. Transparent cells are skipped.
 *
 * @param canvas - Target canvas.
 * @param sprite - Sprite to draw.
 * @param x - World X (or screen X if no camera).
 * @param y - World Y (or screen Y if no camera).
 * @param camera - Optional camera to project `(x, y)` through.
 */
export function drawSprite(canvas: Canvas, sprite: Sprite, x: number, y: number, camera?: Camera): void {
  let originX = x
  let originY = y
  if (camera) {
    const screen = camera.worldToScreen(new Vector2(x, y))
    originX = Math.round(screen.x)
    originY = Math.round(screen.y)
  }
  for (let row = 0; row < sprite.height; row++) {
    for (let column = 0; column < sprite.width; column++) {
      const cell = sprite.cellAt(column, row)
      if (!cell || cell.transparent) continue
      if (cell.background) {
        canvas.setCell(originX + column, originY + row, cell.character, cell.foreground, cell.background)
      } else {
        canvas.setCell(originX + column, originY + row, cell.character, cell.foreground)
      }
    }
  }
}
