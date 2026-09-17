/**
 * Seeded 2D noise in two flavours: value noise (`sample`, [0, 1)) for masks and
 * heightfields, and gradient noise (`perlin`, ~[-1, 1]) for flow/warp fields.
 *
 * @module
 */

/**
 * Seeded 2D noise. Two flavours share one lattice hash: `sample` is value noise
 * (a hashed value per integer corner, smootherstep-interpolated) in [0, 1),
 * matching Noise3D's cheap blobby look; `perlin` is gradient noise (Perlin's
 * dot-of-gradient construction) in roughly [-1, 1], which has no directional
 * bias and reads as flowing rather than blobby. Pick value noise for masks and
 * terrain heightfields, Perlin for flow/warp fields. Deterministic for a seed.
 *
 * @example
 * ```ts
 * const n = new Noise2D(1234)
 * n.sample(1.5, 2.5)   // [0, 1)
 * n.perlin(1.5, 2.5)   // ~[-1, 1]
 * ```
 */
export class Noise2D {
  private seed: number

  /**
   * @param seed - Seed for the lattice hash (default 0).
   */
  constructor(seed = 0) {
    this.seed = seed >>> 0
  }

  // Hash an integer lattice corner to a scrambled 32-bit value. Same imul-mixing
  // family as Random.next / Noise3D.corner so the spread is even across axes.
  private hash(ix: number, iy: number): number {
    let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + this.seed) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return (h ^ (h >>> 16)) >>> 0
  }

  // Lattice corner as a value in [0, 1).
  private corner(ix: number, iy: number): number {
    return this.hash(ix, iy) / 4294967296
  }

  // Dot the corner's gradient with the offset (fx, fy) to that corner. The
  // gradient is one of 8 directions on the unit circle (cardinals + diagonals),
  // chosen by the low hash bits — enough to kill axis alignment while staying
  // table-free.
  private gradient(ix: number, iy: number, fx: number, fy: number): number {
    const d = Math.SQRT1_2
    switch (this.hash(ix, iy) & 7) {
      case 0:
        return fx
      case 1:
        return -fx
      case 2:
        return fy
      case 3:
        return -fy
      case 4:
        return d * (fx + fy)
      case 5:
        return d * (-fx + fy)
      case 6:
        return d * (fx - fy)
      default:
        return d * (-fx - fy)
    }
  }

  // Smootherstep fade t³(t(6t−15)+10): continuous first and second derivatives,
  // so neither value nor Perlin noise shows lattice creases.
  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  /**
   * Value noise at a point, bilinearly interpolated. Returns [0, 1).
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns Noise value in [0, 1).
   */
  sample(x: number, y: number): number {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = x - x0
    const fy = y - y0
    const ux = Noise2D.fade(fx)
    const uy = Noise2D.fade(fy)
    const c00 = this.corner(x0, y0)
    const c10 = this.corner(x0 + 1, y0)
    const c01 = this.corner(x0, y0 + 1)
    const c11 = this.corner(x0 + 1, y0 + 1)
    const top = c00 + (c10 - c00) * ux
    const bottom = c01 + (c11 - c01) * ux
    return top + (bottom - top) * uy
  }

  /**
   * Gradient (Perlin) noise at a point, in roughly [-1, 1]. Each corner gradient
   * is dotted with the offset to that corner, then bilinearly faded.
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns Noise value in roughly [-1, 1].
   */
  perlin(x: number, y: number): number {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = x - x0
    const fy = y - y0
    const ux = Noise2D.fade(fx)
    const uy = Noise2D.fade(fy)
    const g00 = this.gradient(x0, y0, fx, fy)
    const g10 = this.gradient(x0 + 1, y0, fx - 1, fy)
    const g01 = this.gradient(x0, y0 + 1, fx, fy - 1)
    const g11 = this.gradient(x0 + 1, y0 + 1, fx - 1, fy - 1)
    const top = g00 + (g10 - g00) * ux
    const bottom = g01 + (g11 - g01) * ux
    return top + (bottom - top) * uy
  }

  /**
   * Fractal brownian motion over the value-noise `sample`: sum `octaves` at rising
   * frequency (×lacunarity) and falling amplitude (×gain), normalised to [0, 1).
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param octaves - Number of octave passes (default 4).
   * @param lacunarity - Frequency multiplier per octave (default 2).
   * @param gain - Amplitude multiplier per octave (default 0.5).
   * @returns Amplitude-normalised fractal sum in [0, 1).
   */
  fbm(x: number, y: number, octaves = 4, lacunarity = 2, gain = 0.5): number {
    let sum = 0
    let amplitude = 1
    let total = 0
    let frequency = 1
    for (let i = 0; i < octaves; i++) {
      sum += this.sample(x * frequency, y * frequency) * amplitude
      total += amplitude
      amplitude *= gain
      frequency *= lacunarity
    }
    return sum / total
  }
}
