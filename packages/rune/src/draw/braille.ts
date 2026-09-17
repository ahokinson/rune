/**
 * Braille sub-pixel rendering. Each terminal cell can pack a 2x4 grid of dots
 * (Unicode U+2800 + an 8-bit mask), giving 2x horizontal and 4x vertical
 * resolution over plain cells — one colour per glyph.
 *
 * @module
 */

/** Number of sub-pixel columns packed into one braille cell. */
export const BRAILLE_COLS = 2
/** Number of sub-pixel rows packed into one braille cell. */
export const BRAILLE_ROWS = 4

/** Dot bit for each [row][col] of the 2x4 grid, matching the U+2800 layout. */
export const BRAILLE_BITS: readonly (readonly number[])[] = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
]

/**
 * Glyph for a dot mask.
 *
 * @param bits - Dot mask in 0..255.
 * @returns The braille glyph for that mask.
 */
export function brailleGlyph(bits: number): string {
  return String.fromCharCode(0x2800 + bits)
}

/**
 * Rasterize one cell by sampling its 8 sub-pixels. `sample` is called with the
 * sub-pixel's centre in cell-space (e.g. cx + 0.25 ... cx + 0.75 horizontally)
 * and its dot bit; return true to light the dot. The caller can accumulate its
 * own per-sample state (lighting, depth, ...) inside `sample`.
 *
 * @param cx - Cell X coordinate.
 * @param cy - Cell Y coordinate.
 * @param sample - Predicate called per sub-pixel with its centre and dot bit; return `true` to light it.
 * @returns The accumulated dot mask — pass to {@link brailleGlyph}.
 */
export function rasterizeBrailleCell(
  cx: number,
  cy: number,
  sample: (sampleX: number, sampleY: number, bit: number) => boolean,
): number {
  let bits = 0
  for (let row = 0; row < BRAILLE_ROWS; row++) {
    for (let col = 0; col < BRAILLE_COLS; col++) {
      const bit = BRAILLE_BITS[row]![col]!
      const sampleX = cx + (col + 0.5) / BRAILLE_COLS
      const sampleY = cy + (row + 0.5) / BRAILLE_ROWS
      if (sample(sampleX, sampleY, bit)) bits |= bit
    }
  }
  return bits
}
