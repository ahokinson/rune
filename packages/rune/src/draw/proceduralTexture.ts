/**
 * Generated {@link Texture} bitmaps useful for checking that a mesh's uv layout
 * and lighting read correctly: a checkerboard and a uv-debug grid. Both fill a
 * fresh RGBA buffer procedurally — no asset to ship.
 *
 * @module
 */

import { Texture } from "./texture"

function write(data: Uint8ClampedArray, offset: number, r: number, g: number, b: number): void {
  data[offset] = r
  data[offset + 1] = g
  data[offset + 2] = b
  data[offset + 3] = 255
}

/**
 * A two-tone checkerboard of `cells × cells` squares. Reads how light wraps
 * around a surface at a glance.
 *
 * @param size - Texture edge length in pixels (default 64).
 * @param cells - Number of checker squares per axis (default 8).
 * @returns A new {@link Texture}.
 */
export function checkerTexture(size = 64, cells = 8): Texture {
  const data = new Uint8ClampedArray(size * size * 4)
  const cellPx = size / cells
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const on = ((Math.floor(x / cellPx) + Math.floor(y / cellPx)) & 1) === 0
      const v = on ? 225 : 70
      write(data, (y * size + x) * 4, v, v, on ? v : 78)
    }
  }
  return new Texture(size, size, data)
}

/**
 * The standard uv-debug map: coloured grid lines over a per-quadrant gradient,
 * so the mesh's uv layout is legible.
 *
 * @param size - Texture edge length in pixels (default 64).
 * @param gridPx - Grid line spacing in pixels (default 8).
 * @returns A new {@link Texture}.
 */
export function uvGridTexture(size = 64, gridPx = 8): Texture {
  const data = new Uint8ClampedArray(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const onLine = x % gridPx === 0 || y % gridPx === 0
      let r: number
      let g: number
      let b: number
      if (onLine) {
        r = 245
        g = 245
        b = 245
      } else {
        r = Math.round(40 + u * 200)
        g = Math.round(40 + v * 200)
        b = Math.round(220 - (u + v) * 90)
      }
      write(data, (y * size + x) * 4, r, g, b)
    }
  }
  return new Texture(size, size, data)
}
