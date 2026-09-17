import { clamp } from "@/math/scalar"
import type { PostEffect } from "./pipeline"

/**
 * Ordered (Bayer) dithering: quantise each colour channel to a small number of
 * levels, using a 4×4 threshold matrix to trade banding for a stable cross-hatch
 * of dots — the retro "limited palette" look. Operates in place on fg and bg.
 * `levels` is the number of steps per channel (2 = 1-bit per channel, etc.).
 *
 * @module
 */

/** Options for the {@link dither} post effect. */
export interface DitherOptions {
  /** Number of quantization steps per colour channel (≥2). Default 4. */
  levels?: number
}

// Normalised 4×4 Bayer matrix in [0, 1).
const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => v / 16))

/**
 * Build an ordered-dithering {@link PostEffect}.
 *
 * @param options - Dither parameters (all optional).
 * @returns A post-processing pass.
 */
export function dither(options: DitherOptions = {}): PostEffect {
  const levels = Math.max(2, Math.floor(options.levels ?? 4))
  const step = 255 / (levels - 1)

  const cell = { char: 32, fgR: 0, fgG: 0, fgB: 0, bgR: 0, bgG: 0, bgB: 0 }
  const quantize = (value: number, threshold: number): number => {
    // Bias by the cell's Bayer threshold before snapping to the nearest level, so
    // values between levels resolve to a dither pattern rather than a hard step.
    const biased = value + (threshold - 0.5) * step
    return clamp(Math.round(biased / step) * step, 0, 255)
  }
  return (canvas) => {
    const { width, height } = canvas
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const threshold = BAYER_4[y & 3]![x & 3]!
        canvas.readCell(x, y, cell)
        canvas.setCellBytes(
          x,
          y,
          String.fromCharCode(cell.char),
          quantize(cell.fgR, threshold),
          quantize(cell.fgG, threshold),
          quantize(cell.fgB, threshold),
          quantize(cell.bgR, threshold),
          quantize(cell.bgG, threshold),
          quantize(cell.bgB, threshold),
        )
      }
    }
  }
}
