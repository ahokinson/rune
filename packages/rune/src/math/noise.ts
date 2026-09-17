/**
 * Seeded 3D value noise with FBM summation for seamless sphere wraps and
 * volumetric looks.
 *
 * @module
 */

/**
 * Seeded 3D value noise with fractal-brownian-motion summation. Value noise (a
 * hashed value per integer lattice corner, smootherstep-interpolated) rather
 * than gradient/Perlin noise: cheaper, no gradient tables, and the soft blobby
 * output suits volumetric looks like clouds or terrain masks. Sampling in 3D
 * lets callers feed a unit surface vector so a field wraps seamlessly over a
 * sphere — no equirectangular seam or pole pinch. Deterministic for a given seed.
 *
 * @example
 * ```ts
 * const n = new Noise3D(1234)
 * n.sample(1.5, 2.5, 3.5)   // [0, 1)
 * n.fbm(1.5, 2.5, 3.5, 4)   // layered detail, [0, 1)
 * ```
 */
export class Noise3D {
  private seed: number

  /**
   * @param seed - Seed for the lattice hash (default 0).
   */
  constructor(seed = 0) {
    this.seed = seed >>> 0
  }

  // Hash an integer lattice corner to a value in [0, 1). Same imul-mixing family
  // as Random.next so the distribution is well-scrambled across the 3 axes.
  private corner(ix: number, iy: number, iz: number): number {
    let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(iz, 2147483647) + this.seed) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
  }

  /**
   * Value noise at a point, trilinearly interpolated with a smootherstep fade
   * (t³(t(6t−15)+10)) so the field has continuous first and second derivatives.
   * Returns [0, 1).
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @returns Noise value in [0, 1).
   */
  sample(x: number, y: number, z: number): number {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const z0 = Math.floor(z)
    const fx = x - x0
    const fy = y - y0
    const fz = z - z0
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
    const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
    const uz = fz * fz * fz * (fz * (fz * 6 - 15) + 10)

    const c000 = this.corner(x0, y0, z0)
    const c100 = this.corner(x0 + 1, y0, z0)
    const c010 = this.corner(x0, y0 + 1, z0)
    const c110 = this.corner(x0 + 1, y0 + 1, z0)
    const c001 = this.corner(x0, y0, z0 + 1)
    const c101 = this.corner(x0 + 1, y0, z0 + 1)
    const c011 = this.corner(x0, y0 + 1, z0 + 1)
    const c111 = this.corner(x0 + 1, y0 + 1, z0 + 1)

    const x00 = c000 + (c100 - c000) * ux
    const x10 = c010 + (c110 - c010) * ux
    const x01 = c001 + (c101 - c001) * ux
    const x11 = c011 + (c111 - c011) * ux
    const y0i = x00 + (x10 - x00) * uy
    const y1i = x01 + (x11 - x01) * uy
    return y0i + (y1i - y0i) * uz
  }

  /**
   * Fractal brownian motion: sum `octaves` of sample at rising frequency
   * (×lacunarity) and falling amplitude (×gain), normalised back to [0, 1).
   * More octaves add finer detail; the default 4/2/0.5 is a balanced cloud-like
   * field.
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @param octaves - Number of octave passes (default 4).
   * @param lacunarity - Frequency multiplier per octave (default 2).
   * @param gain - Amplitude multiplier per octave (default 0.5).
   * @returns Amplitude-normalised fractal sum in [0, 1).
   */
  fbm(x: number, y: number, z: number, octaves = 4, lacunarity = 2, gain = 0.5): number {
    let sum = 0
    let amplitude = 1
    let total = 0
    let frequency = 1
    for (let i = 0; i < octaves; i++) {
      sum += this.sample(x * frequency, y * frequency, z * frequency) * amplitude
      total += amplitude
      amplitude *= gain
      frequency *= lacunarity
    }
    return sum / total
  }
}
