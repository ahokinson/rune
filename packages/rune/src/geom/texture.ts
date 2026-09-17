/**
 * Equirectangular texture sampling: maps spherical coordinates to integer texel
 * addresses for a caller-owned buffer.
 *
 * @module
 */

const TAU = Math.PI * 2

/**
 * Map a spherical elevation/azimuth (radians, see sphere.ts for the theta/phi
 * convention) to nearest-neighbour integer texel coordinates of an
 * equirectangular texture: row 0 is the +y pole, column 0 is azimuth −π.
 * Azimuth wraps; elevation clamps at the poles. Storage-agnostic — the caller
 * indexes its own buffer at the returned (x, y).
 *
 * @param theta - Elevation from the equatorial plane in radians.
 * @param phi - Azimuth about the y axis in radians.
 * @param width - Texture width in texels.
 * @param height - Texture height in texels.
 * @returns Texel coordinates `{ x, y }`.
 */
export function equirectTexel(theta: number, phi: number, width: number, height: number): { x: number; y: number } {
  const u = (((((phi + Math.PI) % TAU) + TAU) % TAU) / TAU) * width
  const v = ((Math.PI / 2 - theta) / Math.PI) * height

  let x = Math.floor(u)
  x = ((x % width) + width) % width

  let y = Math.floor(v)
  y = y < 0 ? 0 : y >= height ? height - 1 : y

  return { x, y }
}
