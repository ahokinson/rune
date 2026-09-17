/**
 * The render target for the 3D mesh pass: a persistent RGB + depth buffer at
 * twice the terminal's vertical resolution, resolved to the canvas via the ▀
 * half block.
 *
 * @module
 */

import type { Canvas } from "../canvas"
import type { Color } from "../color"

const UPPER_HALF_BLOCK = "▀"

/**
 * A persistent RGB + depth buffer at twice the terminal's vertical resolution,
 * the render target for {@link renderMesh}. Each terminal cell maps to two
 * stacked subpixels — row `2y` is the upper half, `2y+1` the lower — so a frame
 * is resolved to the canvas through the ▀ half block (foreground = upper colour,
 * background = lower). Allocate once per viewport and reuse: `clear` each frame,
 * `resolveTo` to blit. Depth follows LARGER = NEARER (it stores 1/zv), matching
 * the renderer's perspective-correct depth test.
 */
export class SubpixelTarget {
  /** Subpixel width (terminal columns). */
  readonly width: number
  /** Subpixel rows = 2 × terminal rows. */
  readonly height: number
  /** Terminal rows this target resolves onto. */
  readonly cellRows: number
  /** RGB per subpixel, row-major: `(y * width + x) * 3`. */
  readonly color: Uint8ClampedArray
  /** Depth (1/zv) per subpixel; cleared to 0 (infinitely far) each frame. */
  readonly depth: Float32Array

  private clearR = 0
  private clearG = 0
  private clearB = 0

  /**
   * @param width - Subpixel width (terminal columns).
   * @param cellRows - Terminal rows; subpixel height is `cellRows * 2`.
   */
  constructor(width: number, cellRows: number) {
    this.width = Math.max(1, Math.floor(width))
    this.cellRows = Math.max(1, Math.floor(cellRows))
    this.height = this.cellRows * 2
    const subpixels = this.width * this.height
    this.color = new Uint8ClampedArray(subpixels * 3)
    this.depth = new Float32Array(subpixels)
  }

  /**
   * Reset every subpixel to the background colour and clear depth. Call once at
   * the start of a frame before drawing.
   *
   * @param background - Clear colour.
   */
  clear(background: Color): void {
    const bytes = background.toBytes()
    this.clearR = bytes.red
    this.clearG = bytes.green
    this.clearB = bytes.blue
    const color = this.color
    for (let i = 0; i < color.length; i += 3) {
      color[i] = this.clearR
      color[i + 1] = this.clearG
      color[i + 2] = this.clearB
    }
    this.depth.fill(0)
  }

  /**
   * Write an opaque RGB subpixel without bounds or depth checks. The caller owns
   * clipping and the depth test (renderMesh does both before calling this).
   *
   * @param x - Subpixel column.
   * @param y - Subpixel row.
   * @param r - Red (0–255).
   * @param g - Green (0–255).
   * @param b - Blue (0–255).
   */
  setUnsafe(x: number, y: number, r: number, g: number, b: number): void {
    const offset = (y * this.width + x) * 3
    this.color[offset] = r
    this.color[offset + 1] = g
    this.color[offset + 2] = b
  }

  /**
   * Pack each upper/lower subpixel pair into one ▀ cell on `canvas`. The canvas
   * must be at least `width × cellRows`.
   *
   * @param canvas - Target canvas.
   */
  resolveTo(canvas: Canvas): void {
    const color = this.color
    const width = this.width
    for (let cy = 0; cy < this.cellRows; cy++) {
      const upperRow = cy * 2 * width
      const lowerRow = (cy * 2 + 1) * width
      for (let x = 0; x < width; x++) {
        const u = (upperRow + x) * 3
        const l = (lowerRow + x) * 3
        canvas.setCellBytesUnsafe(
          x,
          cy,
          UPPER_HALF_BLOCK,
          color[u]!,
          color[u + 1]!,
          color[u + 2]!,
          color[l]!,
          color[l + 1]!,
          color[l + 2]!,
        )
      }
    }
  }
}
