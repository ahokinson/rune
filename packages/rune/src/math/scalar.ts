/**
 * Small scalar helpers: interpolation, clamping, range mapping, wrapping, and
 * sign with a zero state.
 *
 * @module
 */

/**
 * Linearly interpolate between `a` and `b`.
 *
 * @param a - Start value.
 * @param b - End value.
 * @param t - Interpolation factor (0 = `a`, 1 = `b`).
 * @returns `a + (b - a) * t`.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Clamp `value` to `[low, high]`.
 *
 * @param value - Value to clamp.
 * @param low - Lower bound.
 * @param high - Upper bound.
 * @returns `value` if in range, else the nearest bound.
 */
export function clamp(value: number, low: number, high: number): number {
  if (value < low) return low
  if (value > high) return high
  return value
}

/**
 * Remap `value` from an input range to an output range. If the input range is
 * zero-width, returns `outputLow`.
 *
 * @param value - Value to remap.
 * @param inputLow - Lower bound of the input range.
 * @param inputHigh - Upper bound of the input range.
 * @param outputLow - Lower bound of the output range.
 * @param outputHigh - Upper bound of the output range.
 * @returns `value` mapped into the output range.
 */
export function mapRange(
  value: number,
  inputLow: number,
  inputHigh: number,
  outputLow: number,
  outputHigh: number,
): number {
  const inputRange = inputHigh - inputLow
  if (inputRange === 0) return outputLow
  const t = (value - inputLow) / inputRange
  return outputLow + (outputHigh - outputLow) * t
}

/**
 * Wrap `value` into `[minimum, maximum)`. If the range is non-positive, returns
 * `minimum`.
 *
 * @param value - Value to wrap.
 * @param minimum - Lower bound (inclusive).
 * @param maximum - Upper bound (exclusive).
 * @returns `value` wrapped into [minimum, maximum).
 */
export function wrap(value: number, minimum: number, maximum: number): number {
  const range = maximum - minimum
  if (range <= 0) return minimum
  let result = (value - minimum) % range
  if (result < 0) result += range
  return result + minimum
}

/**
 * Sign of `value`, distinguishing zero.
 *
 * @param value - Value to test.
 * @returns `-1`, `0`, or `1`.
 */
export function sign(value: number): -1 | 0 | 1 {
  if (value > 0) return 1
  if (value < 0) return -1
  return 0
}
