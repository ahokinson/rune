import { type FramePlanes, type PostEffect, snapshotFrame } from "./pipeline"

/**
 * Bloom: bright cells bleed light into their neighbours. A bright-pass keeps only
 * pixels above `threshold`, that buffer is box-blurred over `radius`, then added
 * back at `intensity` — the soft glow around highlights (neon, fire, sun). Reads a
 * frame snapshot and rewrites fg and bg with the original colour plus the spill.
 *
 * @module
 */

/** Options for the {@link bloom} post effect. */
export interface BloomOptions {
  /** Luminance (0–255) above which a cell contributes to the glow. Default 180. */
  threshold?: number
  /** How far the glow spreads, in cells. Default 2. */
  radius?: number
  /** How strongly the blurred glow is added back. Default 0.6. */
  intensity?: number
}

const LUMA_R = 0.2126
const LUMA_G = 0.7152
const LUMA_B = 0.0722

/**
 * Build a bloom {@link PostEffect}.
 *
 * @param options - Bloom parameters (all optional).
 * @returns A post-processing pass.
 */
export function bloom(options: BloomOptions = {}): PostEffect {
  const threshold = options.threshold ?? 180
  const radius = Math.max(1, Math.floor(options.radius ?? 2))
  const intensity = options.intensity ?? 0.6
  let planes: FramePlanes | undefined
  let glowR: Float32Array | undefined
  let glowG: Float32Array | undefined
  let glowB: Float32Array | undefined

  return (canvas) => {
    planes = snapshotFrame(canvas, planes)
    const { width, height } = canvas
    const size = width * height
    if (!glowR || glowR.length !== size) {
      glowR = new Float32Array(size)
      glowG = new Float32Array(size)
      glowB = new Float32Array(size)
    } else {
      glowR.fill(0)
      glowG!.fill(0)
      glowB!.fill(0)
    }

    // Bright-pass: take the brighter of fg/bg per cell (the glyph or its field).
    const brightR = new Float32Array(size)
    const brightG = new Float32Array(size)
    const brightB = new Float32Array(size)
    for (let i = 0; i < size; i++) {
      const fgLuma = LUMA_R * planes.fgR[i]! + LUMA_G * planes.fgG[i]! + LUMA_B * planes.fgB[i]!
      const bgLuma = LUMA_R * planes.bgR[i]! + LUMA_G * planes.bgG[i]! + LUMA_B * planes.bgB[i]!
      const useFg = fgLuma >= bgLuma
      const luma = useFg ? fgLuma : bgLuma
      if (luma <= threshold) continue
      brightR[i] = useFg ? planes.fgR[i]! : planes.bgR[i]!
      brightG[i] = useFg ? planes.fgG[i]! : planes.bgG[i]!
      brightB[i] = useFg ? planes.fgB[i]! : planes.bgB[i]!
    }

    // Separable box blur of the bright-pass into the glow buffers.
    const window = radius * 2 + 1
    const tmpR = new Float32Array(size)
    const tmpG = new Float32Array(size)
    const tmpB = new Float32Array(size)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sumR = 0
        let sumG = 0
        let sumB = 0
        for (let k = -radius; k <= radius; k++) {
          const cx = Math.min(width - 1, Math.max(0, x + k))
          const j = y * width + cx
          sumR += brightR[j]!
          sumG += brightG[j]!
          sumB += brightB[j]!
        }
        const i = y * width + x
        tmpR[i] = sumR / window
        tmpG[i] = sumG / window
        tmpB[i] = sumB / window
      }
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sumR = 0
        let sumG = 0
        let sumB = 0
        for (let k = -radius; k <= radius; k++) {
          const cy = Math.min(height - 1, Math.max(0, y + k))
          const j = cy * width + x
          sumR += tmpR[j]!
          sumG += tmpG[j]!
          sumB += tmpB[j]!
        }
        const i = y * width + x
        glowR![i] = (sumR / window) * intensity
        glowG![i] = (sumG / window) * intensity
        glowB![i] = (sumB / window) * intensity
      }
    }

    // Add the glow back onto the original frame, clamped.
    const add = (base: number, glow: number): number => Math.min(255, base + glow)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        canvas.setCellBytes(
          x,
          y,
          String.fromCharCode(planes.chars[i]!),
          add(planes.fgR[i]!, glowR![i]!),
          add(planes.fgG[i]!, glowG![i]!),
          add(planes.fgB[i]!, glowB![i]!),
          add(planes.bgR[i]!, glowR![i]!),
          add(planes.bgG[i]!, glowG![i]!),
          add(planes.bgB[i]!, glowB![i]!),
        )
      }
    }
  }
}
