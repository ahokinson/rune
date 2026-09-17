import type { Canvas } from "@/draw/canvas"
import { Color } from "@/draw/color"

/**
 * Paint horizontal CRT scanlines across a canvas. A `skip` predicate masks out
 * cells (the globe demo skips the sphere's disc so the lines stay in the
 * background rather than banding the subject).
 *
 * @module
 */

/** Options for {@link drawScanlines}. */
export interface ScanlineOptions {
  /** Draw a scanline every `spacing` rows. Default 4. */
  spacing?: number
  /** Glyph painted on a scanline cell. Default "░". */
  character?: string
  /** Scanline colour. Default a dim cool grey. */
  color?: Color
  /** Return true for cells that should be left untouched (e.g. a foreground subject the scanlines should not slice through, or a border). */
  skip?: (x: number, y: number) => boolean
}

const DEFAULT_COLOR = Color.fromBytes(6, 16, 30)

/**
 * Paint horizontal CRT scanlines across `canvas`, every `spacing` rows. A `skip`
 * predicate masks out cells (the globe demo skips the sphere's disc so the lines
 * stay in the background rather than banding the subject).
 *
 * @param canvas - Target canvas.
 * @param options - Spacing, glyph, colour, and optional skip predicate.
 */
export function drawScanlines(canvas: Canvas, options: ScanlineOptions = {}): void {
  const spacing = options.spacing ?? 4
  const character = options.character ?? "░"
  const color = options.color ?? DEFAULT_COLOR
  const skip = options.skip
  for (let y = 0; y < canvas.height; y += spacing) {
    for (let x = 0; x < canvas.width; x++) {
      if (skip?.(x, y)) continue
      canvas.setCell(x, y, character, color, Color.BLACK)
    }
  }
}
