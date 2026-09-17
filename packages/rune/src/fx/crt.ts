import { clamp } from "@/math/scalar"
import type { PostEffect } from "./pipeline"

/**
 * CRT grade: a radial vignette that darkens toward the corners plus alternating
 * scanline darkening, evoking a curved phosphor tube. Operates in place, scaling
 * each cell's fg and bg brightness, so glyphs stay legible (both planes dim
 * together). Compose after colour effects as the final "tube" pass.
 *
 * @module
 */

/** Options for the {@link crt} post effect. */
export interface CrtOptions {
  /** Corner darkening strength, 0 (none) … 1 (corners go black). Default 0.35. */
  vignette?: number
  /** Brightness multiplier applied to every other scanline row. Default 0.7. */
  scanlineDarkness?: number
  /** Rows between darkened scanlines. Default 2 (every other row). */
  scanlineSpacing?: number
}

/**
 * Build a CRT vignette + scanline {@link PostEffect}.
 *
 * @param options - CRT grade parameters (all optional).
 * @returns A post-processing pass.
 */
export function crt(options: CrtOptions = {}): PostEffect {
  const vignette = options.vignette ?? 0.35
  const scanlineDarkness = options.scanlineDarkness ?? 0.7
  const scanlineSpacing = options.scanlineSpacing ?? 2

  const cell = { char: 32, fgR: 0, fgG: 0, fgB: 0, bgR: 0, bgG: 0, bgB: 0 }
  return (canvas) => {
    const { width, height } = canvas
    const halfW = (width - 1) / 2 || 1
    const halfH = (height - 1) / 2 || 1
    for (let y = 0; y < height; y++) {
      const scanline = y % scanlineSpacing === 0 ? scanlineDarkness : 1
      const dy = (y - halfH) / halfH
      for (let x = 0; x < width; x++) {
        const dx = (x - halfW) / halfW
        // Radial falloff: 1 at centre, dropping toward the corners.
        const radial = 1 - vignette * clamp(dx * dx + dy * dy, 0, 1)
        const scale = radial * scanline
        if (scale >= 1) continue
        canvas.readCell(x, y, cell)
        canvas.setCellBytes(
          x,
          y,
          String.fromCharCode(cell.char),
          cell.fgR * scale,
          cell.fgG * scale,
          cell.fgB * scale,
          cell.bgR * scale,
          cell.bgG * scale,
          cell.bgB * scale,
        )
      }
    }
  }
}
