import type { InMemoryCanvas } from "@/draw/canvas"

/**
 * A composable post-processing pipeline: an ordered list of full-frame passes run
 * against the composited {@link InMemoryCanvas} after the scene is drawn. Where
 * {@link ScreenEffect} (see ./screen) hooks individual draw calls, a
 * {@link PostEffect} reads and rewrites the finished frame — the right model for
 * image-space looks (CRT curvature, dithering, chromatic aberration, bloom).
 * Build the chain once and call `apply` each frame.
 *
 * @module
 */

/**
 * A full-frame post-processing pass run against the composited canvas. Passes
 * that need undisturbed neighbours snapshot the frame themselves.
 *
 * @param canvas - The composited frame to read and rewrite.
 * @param tick - Optional current tick number.
 */
export type PostEffect = (canvas: InMemoryCanvas, tick?: number) => void

/** Ordered chain of {@link PostEffect}s applied to a finished frame. */
export class PostProcessPipeline {
  private readonly passes: PostEffect[] = []

  /**
   * Append a pass to the chain.
   *
   * @param effect - The post-processing pass.
   * @returns `this` for chaining.
   */
  add(effect: PostEffect): this {
    this.passes.push(effect)
    return this
  }

  /** Number of passes in the chain. */
  get length(): number {
    return this.passes.length
  }

  /**
   * Run every pass in order. Passes that read neighbouring cells snapshot the frame
   * themselves, so ordering composes cleanly (each sees the previous pass's output).
   *
   * @param canvas - The composited frame.
   * @param tick - Current tick number (default 0).
   */
  apply(canvas: InMemoryCanvas, tick = 0): void {
    for (const pass of this.passes) pass(canvas, tick)
  }
}

/**
 * A read-only copy of a frame's colour planes, taken before a pass writes back, so
 * neighbour-sampling effects (aberration, bloom) read undisturbed source pixels.
 */
export interface FramePlanes {
  /** Frame width in cells. */
  width: number
  /** Frame height in cells. */
  height: number
  /** Glyph code per cell. */
  chars: Uint16Array
  /** Foreground red plane (0–255 per cell). */
  fgR: Uint8Array
  /** Foreground green plane (0–255 per cell). */
  fgG: Uint8Array
  /** Foreground blue plane (0–255 per cell). */
  fgB: Uint8Array
  /** Background red plane (0–255 per cell). */
  bgR: Uint8Array
  /** Background green plane (0–255 per cell). */
  bgG: Uint8Array
  /** Background blue plane (0–255 per cell). */
  bgB: Uint8Array
}

const scratchCell = { char: 32, fgR: 0, fgG: 0, fgB: 0, bgR: 0, bgG: 0, bgB: 0 }

/**
 * Snapshot the canvas's glyphs and fg/bg bytes into typed-array planes. Reuses
 * `into` when its dimensions match, so a per-frame pass allocates nothing.
 *
 * @param canvas - Source canvas.
 * @param into - Existing planes to reuse when dimensions match.
 * @returns The populated planes (same reference as `into` when reused).
 */
export function snapshotFrame(canvas: InMemoryCanvas, into?: FramePlanes): FramePlanes {
  const { width, height } = canvas
  const size = width * height
  const planes: FramePlanes =
    into && into.width === width && into.height === height
      ? into
      : {
          width,
          height,
          chars: new Uint16Array(size),
          fgR: new Uint8Array(size),
          fgG: new Uint8Array(size),
          fgB: new Uint8Array(size),
          bgR: new Uint8Array(size),
          bgG: new Uint8Array(size),
          bgB: new Uint8Array(size),
        }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      canvas.readCell(x, y, scratchCell)
      planes.chars[i] = scratchCell.char
      planes.fgR[i] = scratchCell.fgR
      planes.fgG[i] = scratchCell.fgG
      planes.fgB[i] = scratchCell.fgB
      planes.bgR[i] = scratchCell.bgR
      planes.bgG[i] = scratchCell.bgG
      planes.bgB[i] = scratchCell.bgB
    }
  }
  return planes
}
