import { lerp as lerpScalar } from "./scalar"

/**
 * Angle helpers working in radians. `normalize` folds into (−π, π] so
 * interpolation always takes the short way around a circle.
 *
 * @module
 */

const TAU = Math.PI * 2

/**
 * Radians/degrees conversion and shortest-arc interpolation helpers.
 *
 * All angles are in radians unless noted. `normalize` and `shortestDelta`
 * wrap into (−π, π], so `lerpShortest` always rotates the shorter way.
 */
export const Angle = {
  /**
   * Convert degrees to radians.
   *
   * @param degrees - Angle in degrees.
   * @returns The same angle in radians.
   */
  fromDegrees(degrees: number): number {
    return (degrees * Math.PI) / 180
  },

  /**
   * Convert radians to degrees.
   *
   * @param radians - Angle in radians.
   * @returns The same angle in degrees.
   */
  toDegrees(radians: number): number {
    return (radians * 180) / Math.PI
  },

  /**
   * Fold an angle (in radians) into the (−π, π] range.
   *
   * @param radians - Angle in radians, any magnitude.
   * @returns The equivalent angle in (−π, π].
   */
  normalize(radians: number): number {
    let result = radians % TAU
    if (result > Math.PI) result -= TAU
    else if (result < -Math.PI) result += TAU
    return result
  },

  /**
   * Smallest signed angular delta from `from` to `to`, in (−π, π].
   *
   * @param from - Start angle in radians.
   * @param to - End angle in radians.
   * @returns `normalize(to - from)`.
   */
  shortestDelta(from: number, to: number): number {
    return Angle.normalize(to - from)
  },

  /**
   * Interpolate from `from` to `to` along the shorter arc.
   *
   * @param from - Start angle in radians.
   * @param to - End angle in radians.
   * @param t - Interpolation factor (0 = `from`, 1 = `to`).
   * @returns The interpolated angle in (−π, π].
   */
  lerpShortest(from: number, to: number, t: number): number {
    return Angle.normalize(from + Angle.shortestDelta(from, to) * t)
  },

  /**
   * Plain linear interpolation between two angles (no wrapping).
   *
   * @param from - Start angle in radians.
   * @param to - End angle in radians.
   * @param t - Interpolation factor (0 = `from`, 1 = `to`).
   * @returns `from + (to - from) * t`.
   */
  lerp(from: number, to: number, t: number): number {
    return lerpScalar(from, to, t)
  },
}
