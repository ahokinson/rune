/**
 * Composable fractal helpers over any 2D noise function. Noise2D and Worley2D
 * expose their own tuned fbm, but these free functions let you layer fractal
 * detail or domain-warp an arbitrary sampler — e.g. fbm over Perlin, or warping
 * a Worley field by a Perlin field for organic, swirled cell walls. Keeping the
 * sampler abstract is the "one right way" to combine fields without each noise
 * class re-implementing octave summation.
 *
 * @module
 */

/** A 2D noise sampler: maps `(x, y)` to a scalar value. */
export type NoiseSampler2D = (x: number, y: number) => number

/** Options shared by the fractal helpers. */
export interface FbmOptions {
  /** Number of octave passes to sum (default 4). */
  octaves?: number
  /** Frequency multiplier per octave (default 2). */
  lacunarity?: number
  /** Amplitude multiplier per octave (default 0.5). */
  gain?: number
  /** Base frequency applied before the first octave (default 1). */
  frequency?: number
}

/**
 * Sum `octaves` of `sampler` at rising frequency and falling amplitude. The
 * result is normalised by total amplitude, so its range matches the sampler's
 * own range (e.g. [0, 1) value noise stays [0, 1); [-1, 1] Perlin stays [-1, 1]).
 *
 * @param sampler - Source noise to layer.
 * @param x - X coordinate to sample.
 * @param y - Y coordinate to sample.
 * @param options - Octave/lacunarity/gain/frequency controls.
 * @returns Amplitude-normalised fractal sum.
 */
export function fbm(sampler: NoiseSampler2D, x: number, y: number, options: FbmOptions = {}): number {
  const octaves = options.octaves ?? 4
  const lacunarity = options.lacunarity ?? 2
  const gain = options.gain ?? 0.5
  let frequency = options.frequency ?? 1
  let amplitude = 1
  let sum = 0
  let total = 0
  for (let i = 0; i < octaves; i++) {
    sum += sampler(x * frequency, y * frequency) * amplitude
    total += amplitude
    amplitude *= gain
    frequency *= lacunarity
  }
  return total === 0 ? 0 : sum / total
}

/**
 * Ridged multifractal: 1 − |sampler| folded each octave, biased toward sharp
 * ridges. Best fed a signed sampler (Perlin); produces eroded mountain ridges
 * and canyon networks. Returns [0, 1).
 *
 * @param sampler - Source noise to layer (ideally signed, e.g. Perlin).
 * @param x - X coordinate to sample.
 * @param y - Y coordinate to sample.
 * @param options - Octave/lacunarity/gain/frequency controls.
 * @returns Ridged fractal value in [0, 1).
 */
export function ridged(sampler: NoiseSampler2D, x: number, y: number, options: FbmOptions = {}): number {
  const octaves = options.octaves ?? 4
  const lacunarity = options.lacunarity ?? 2
  const gain = options.gain ?? 0.5
  let frequency = options.frequency ?? 1
  let amplitude = 1
  let sum = 0
  let total = 0
  for (let i = 0; i < octaves; i++) {
    const ridge = 1 - Math.abs(sampler(x * frequency, y * frequency))
    sum += ridge * ridge * amplitude
    total += amplitude
    amplitude *= gain
    frequency *= lacunarity
  }
  return total === 0 ? 0 : sum / total
}

/**
 * Options for {@link domainWarp}, extending {@link FbmOptions} with a warp
 * strength.
 */
export interface DomainWarpOptions extends FbmOptions {
  /**
   * How far (in sample units) the warp field displaces the lookup. Larger values
   * give more turbulent, swirled output.
   */
  strength?: number
}

/**
 * Domain warping: offset the lookup into `sampler` by an fbm of `warp`. The
 * classic two-pass swirl — feed the same noise as both `sampler` and `warp` for
 * a self-similar marbled field, or different noises for layered turbulence.
 *
 * @param sampler - The field to read the warped value from.
 * @param warp - The field whose fbm drives the displacement.
 * @param x - X coordinate to sample.
 * @param y - Y coordinate to sample.
 * @param options - Warp strength plus the shared octave controls.
 * @returns `sampler` sampled at the warped coordinate.
 */
export function domainWarp(
  sampler: NoiseSampler2D,
  warp: NoiseSampler2D,
  x: number,
  y: number,
  options: DomainWarpOptions = {},
): number {
  const strength = options.strength ?? 1
  const offsetX = fbm(warp, x, y, options)
  // Decorrelate the y-offset by sampling the warp field at a shifted origin.
  const offsetY = fbm(warp, x + 5.2, y + 1.3, options)
  return sampler(x + offsetX * strength, y + offsetY * strength)
}
