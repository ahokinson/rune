import { type FramePlanes, type PostEffect, snapshotFrame } from "./pipeline"

/**
 * Chromatic aberration: split the red and blue channels horizontally so colour
 * fringes appear, strongest toward the screen edges (as a real lens disperses).
 * Reads a snapshot of the frame so the shift samples undisturbed source pixels,
 * then rewrites fg and bg from the shifted channels. `amount` is the maximum
 * channel shift in cells at the edge; `edgeBias` 1 concentrates it at the edges,
 * 0 applies it uniformly.
 *
 * @module
 */

/** Options for the {@link chromaticAberration} post effect. */
export interface ChromaticAberrationOptions {
  /** Maximum channel shift in cells at the screen edge. Default 1. */
  amount?: number
  /** 1 concentrates the shift at the edges; 0 applies it uniformly. Default 1. */
  edgeBias?: number
}

/**
 * Build a chromatic-aberration {@link PostEffect}.
 *
 * @param options - Aberration parameters (all optional).
 * @returns A post-processing pass.
 */
export function chromaticAberration(options: ChromaticAberrationOptions = {}): PostEffect {
  const amount = options.amount ?? 1
  const edgeBias = options.edgeBias ?? 1
  let planes: FramePlanes | undefined

  return (canvas) => {
    planes = snapshotFrame(canvas, planes)
    const { width, height } = canvas
    const halfW = (width - 1) / 2 || 1
    // Sample one channel from the source at (sx, y), clamped to the row.
    const sample = (plane: Uint8Array, sx: number, y: number): number => {
      const cx = sx < 0 ? 0 : sx >= width ? width - 1 : sx
      return plane[y * width + cx]!
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        const dx = (x - halfW) / halfW
        // Shift grows toward the edges when edgeBias is high.
        const shift = Math.round(amount * (edgeBias * Math.abs(dx) + (1 - edgeBias)) * Math.sign(dx || 1))
        canvas.setCellBytes(
          x,
          y,
          String.fromCharCode(planes.chars[i]!),
          sample(planes.fgR, x + shift, y),
          planes.fgG[i]!,
          sample(planes.fgB, x - shift, y),
          sample(planes.bgR, x + shift, y),
          planes.bgG[i]!,
          sample(planes.bgB, x - shift, y),
        )
      }
    }
  }
}
