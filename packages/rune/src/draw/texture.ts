/**
 * Sampleable RGBA bitmaps for textured surfaces: nearest-neighbour sampling with
 * wrapping, plus conversions from {@link PixelSprite}. See {@link Texture}.
 *
 * @module
 */

import type { Color, SurfaceColor } from "./color"
import type { PixelSprite } from "./pixelSprite"

/**
 * A sampleable RGBA bitmap. Pixels are stored row-major in a flat
 * `Uint8ClampedArray` of `width * height * 4` bytes (r, g, b, a per pixel, each
 * 0–255). Sampling is nearest-neighbour with wrapping, so a texture tiles
 * naturally across repeated surface cells — see {@link TextureSurfaceShader}.
 */
export class Texture {
  /** Width in texels. */
  readonly width: number
  /** Height in texels. */
  readonly height: number
  /** Flat row-major RGBA bytes (`width * height * 4`, each 0–255). */
  readonly data: Uint8ClampedArray

  /**
   * @param width - Width in texels (clamped to ≥ 1).
   * @param height - Height in texels (clamped to ≥ 1).
   * @param data - Pre-filled buffer; must be `width * height * 4` bytes. If omitted, a zeroed buffer is allocated.
   */
  constructor(width: number, height: number, data?: Uint8ClampedArray) {
    this.width = Math.max(1, Math.floor(width))
    this.height = Math.max(1, Math.floor(height))
    const length = this.width * this.height * 4
    if (data) {
      if (data.length !== length) {
        throw new Error(`Texture: data length ${data.length} does not match ${this.width}x${this.height} (${length})`)
      }
      this.data = data
    } else {
      this.data = new Uint8ClampedArray(length)
    }
  }

  /**
   * Build a Texture from a {@link PixelSprite}. Opaque pixels become RGBA with
   * alpha 255; transparent (`null`) pixels become fully transparent black.
   *
   * @param sprite - Source sprite.
   * @returns A new {@link Texture}.
   */
  static fromPixelSprite(sprite: PixelSprite): Texture {
    const texture = new Texture(sprite.width, sprite.height)
    const data = texture.data
    for (let y = 0; y < sprite.height; y++) {
      for (let x = 0; x < sprite.width; x++) {
        const color = sprite.pixelAt(x, y)
        const offset = (y * sprite.width + x) * 4
        if (!color) continue
        const bytes = color.toBytes()
        data[offset] = bytes.red
        data[offset + 1] = bytes.green
        data[offset + 2] = bytes.blue
        data[offset + 3] = bytes.alpha
      }
    }
    return texture
  }

  /**
   * Write a texel's colour. Out-of-bounds writes are ignored.
   *
   * @param x - Texel column.
   * @param y - Texel row.
   * @param color - Colour to write.
   */
  setPixel(x: number, y: number, color: Color): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
    const bytes = color.toBytes()
    const offset = (y * this.width + x) * 4
    this.data[offset] = bytes.red
    this.data[offset + 1] = bytes.green
    this.data[offset + 2] = bytes.blue
    this.data[offset + 3] = bytes.alpha
  }

  /**
   * Alpha (0–255) of the texel nearest `(u, v)`, with wrapping.
   *
   * @param u - U coordinate (wraps into [0, 1)).
   * @param v - V coordinate (wraps into [0, 1)).
   * @returns The alpha channel in 0–255.
   */
  sampleAlpha(u: number, v: number): number {
    const x = wrapToTexel(u, this.width)
    const y = wrapToTexel(v, this.height)
    return this.data[(y * this.width + x) * 4 + 3] ?? 0
  }

  /**
   * Nearest-neighbour sample at texture coordinate `(u, v)`, writing RGB (0–255)
   * into `out`. Coordinates wrap into `[0, 1)` so values outside the unit square
   * tile the texture. Alpha is ignored; query {@link sampleAlpha} for it.
   *
   * @param u - U coordinate (wraps into [0, 1)).
   * @param v - V coordinate (wraps into [0, 1)).
   * @param out - Target to fill with RGB bytes.
   */
  sampleInto(u: number, v: number, out: SurfaceColor): void {
    const x = wrapToTexel(u, this.width)
    const y = wrapToTexel(v, this.height)
    const offset = (y * this.width + x) * 4
    out.r = this.data[offset] ?? 0
    out.g = this.data[offset + 1] ?? 0
    out.b = this.data[offset + 2] ?? 0
  }
}

function wrapToTexel(coordinate: number, size: number): number {
  const wrapped = coordinate - Math.floor(coordinate)
  const texel = Math.floor(wrapped * size)
  return texel >= size ? size - 1 : texel
}
