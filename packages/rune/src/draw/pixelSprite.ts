/**
 * Pixel-art sprites rendered at double vertical resolution via half-block
 * glyphs. See {@link PixelSprite} and {@link drawPixelSprite}.
 *
 * @module
 */

import type { Canvas } from "./canvas"
import type { Color } from "./color"

const UPPER_HALF_BLOCK = "▀"
const LOWER_HALF_BLOCK = "▄"

/**
 * A pixel-art sprite where each cell is a full-color pixel (or transparent).
 * Rendered through `drawPixelBillboard`, two stacked pixels share one
 * terminal cell via the ▀/▄ half-block characters, doubling effective
 * vertical resolution compared to a {@link Sprite} of the same cell footprint.
 *
 * `height` is measured in pixels — a 10-pixel-tall PixelSprite occupies 5
 * terminal rows on screen at 1:1 scale.
 */
export class PixelSprite {
  /** Width in pixels. */
  readonly width: number
  /** Height in pixels (two pixels share one terminal row when rendered). */
  readonly height: number
  private readonly pixels: (Color | null)[]

  /**
   * @param width - Width in pixels (clamped to ≥ 0).
   * @param height - Height in pixels (clamped to ≥ 0).
   */
  constructor(width: number, height: number) {
    this.width = Math.max(0, Math.floor(width))
    this.height = Math.max(0, Math.floor(height))
    this.pixels = new Array<Color | null>(this.width * this.height).fill(null)
  }

  private indexFor(x: number, y: number): number {
    return y * this.width + x
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  /**
   * Set the pixel at `(x, y)`, or clear it with `null`. Out-of-bounds writes
   * are ignored.
   *
   * @param x - Pixel column.
   * @param y - Pixel row.
   * @param color - Colour to write, or `null` for transparent.
   */
  setPixel(x: number, y: number, color: Color | null): void {
    if (!this.inBounds(x, y)) return
    this.pixels[this.indexFor(x, y)] = color
  }

  /**
   * Read the pixel at `(x, y)`.
   *
   * @param x - Pixel column.
   * @param y - Pixel row.
   * @returns The colour, or `null` if transparent or out of bounds.
   */
  pixelAt(x: number, y: number): Color | null {
    if (!this.inBounds(x, y)) return null
    return this.pixels[this.indexFor(x, y)] ?? null
  }

  /**
   * Build a PixelSprite from an ASCII-art string. Each character maps via
   * `legend` to a Color (opaque pixel) or null (transparent). Characters not
   * found in the legend, plus literal spaces, are treated as transparent.
   *
   * @param source - ASCII art (leading/trailing blank lines trimmed).
   * @param legend - Map from character to colour (or `null` for transparent).
   * @returns A new {@link PixelSprite}.
   */
  static fromString(source: string, legend: Record<string, Color | null>): PixelSprite {
    const lines = source.replace(/\r\n/g, "\n").split("\n")
    while (lines.length > 0 && lines[0] === "") lines.shift()
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()
    const height = lines.length
    let width = 0
    for (const line of lines) if (line.length > width) width = line.length
    const sprite = new PixelSprite(width, height)
    for (let y = 0; y < height; y++) {
      const line = lines[y] ?? ""
      for (let x = 0; x < line.length; x++) {
        const key = line[x] as string
        if (key === " ") continue
        const color = legend[key]
        if (color) sprite.setPixel(x, y, color)
      }
    }
    return sprite
  }
}

/**
 * Blit a PixelSprite straight onto a 2D canvas (no camera or projection). Two
 * stacked pixels share one terminal cell via the ▀/▄ half-blocks: the upper
 * pixel paints the foreground of "▀" and the lower pixel its background, so the
 * sprite renders at double vertical resolution. The 3D counterpart is
 * {@link drawPixelBillboard}.
 *
 * `screenX`/`screenY` are the top-left terminal cell. A sprite `height` pixels
 * tall occupies `ceil(height / 2)` rows; transparent pixels are skipped, and a
 * cell whose pair is fully transparent is left untouched.
 *
 * @param canvas - Target canvas.
 * @param sprite - Sprite to draw.
 * @param screenX - Leftmost terminal column.
 * @param screenY - Top terminal row.
 */
export function drawPixelSprite(canvas: Canvas, sprite: PixelSprite, screenX: number, screenY: number): void {
  for (let py = 0; py < sprite.height; py += 2) {
    const row = screenY + (py >> 1)
    for (let px = 0; px < sprite.width; px++) {
      const upper = sprite.pixelAt(px, py)
      const lower = sprite.pixelAt(px, py + 1)
      const x = screenX + px
      if (upper && lower) canvas.setCell(x, row, UPPER_HALF_BLOCK, upper, lower)
      else if (upper) canvas.setCell(x, row, UPPER_HALF_BLOCK, upper)
      else if (lower) canvas.setCell(x, row, LOWER_HALF_BLOCK, lower)
    }
  }
}
