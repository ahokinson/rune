/**
 * Seedable pseudo-random number generator (mulberry-style) for deterministic
 * gameplay and procedural generation.
 *
 * @module
 */

/**
 * Seedable pseudo-random number generator. Deterministic for a given seed, so
 * replays and procedural layouts reproduce exactly. State is a single 32-bit
 * integer mutated in place.
 *
 * @example
 * ```ts
 * const rng = new Random(1234)
 * rng.float(0, 1)    // deterministic in [0, 1)
 * rng.integer(1, 6)  // deterministic int in [1, 6]
 * rng.chance(0.25)   // true with probability 0.25
 * ```
 */
export class Random {
  private state: number

  /**
   * @param seed - Initial seed (default `Date.now()`); 0 is coerced to 1.
   */
  constructor(seed: number = Date.now()) {
    this.state = seed >>> 0
    if (this.state === 0) this.state = 1
  }

  /**
   * Reset the generator's seed.
   *
   * @param value - New seed; 0 is coerced to 1.
   */
  seed(value: number): void {
    this.state = value >>> 0
    if (this.state === 0) this.state = 1
  }

  /**
   * Advance the generator and return the next value.
   *
   * @returns A float in [0, 1).
   */
  next(): number {
    this.state += 0x6d2b79f5
    let t = this.state >>> 0
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /**
   * Uniform float in `[low, high)`.
   *
   * @param low - Inclusive lower bound (default 0).
   * @param high - Exclusive upper bound (default 1).
   * @returns A float in [low, high).
   */
  float(low = 0, high = 1): number {
    return low + this.next() * (high - low)
  }

  /**
   * Uniform integer in `[low, high]` (both inclusive).
   *
   * @param low - Inclusive lower bound.
   * @param high - Inclusive upper bound.
   * @returns An integer in [low, high].
   */
  integer(low: number, high: number): number {
    return Math.floor(this.float(low, high + 1))
  }

  /**
   * Bernoulli trial.
   *
   * @param probability - Probability of returning `true` in [0, 1].
   * @returns `true` with the given probability.
   */
  chance(probability: number): boolean {
    return this.next() < probability
  }

  /**
   * Pick a random element from `array`.
   *
   * @param array - Non-empty array to sample.
   * @returns A random element.
   * @throws if `array` is empty.
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error("Random.pick called on an empty array")
    }
    const index = Math.floor(this.next() * array.length)
    return array[index] as T
  }

  /**
   * Shuffle `array` in place (Fisher–Yates) and return it.
   *
   * @param array - Array to shuffle (mutated).
   * @returns The same array, shuffled.
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      const a = array[i] as T
      const b = array[j] as T
      array[i] = b
      array[j] = a
    }
    return array
  }
}
