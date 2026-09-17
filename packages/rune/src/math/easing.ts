/**
 * Parametric easing curves for mapping linear time to animated motion. Each
 * takes `t` in [0, 1] and returns an eased value (roughly in [0, 1]).
 *
 * @module
 */

/** A function mapping a normalized time `t` in [0, 1] to an eased value. */
export type EasingFunction = (t: number) => number

const PI = Math.PI
const HALF_PI = Math.PI / 2

/**
 * Collection of common easing functions.
 *
 * Pick `*In` to start slow, `*Out` to end slow, `*InOut` for ease at both
 * ends. `bounce*` and `elastic*` add overshoot for springy motion.
 *
 * @example
 * ```ts
 * const ease = Easing.cubicInOut
 * ease(0.5)  // 0.5
 * ```
 */
export const Easing = {
  /** Linear (no easing). */
  linear(t: number): number {
    return t
  },

  /** Quadratic ease-in: starts at zero velocity. */
  quadraticIn(t: number): number {
    return t * t
  },
  /** Quadratic ease-out: ends at zero velocity. */
  quadraticOut(t: number): number {
    return t * (2 - t)
  },
  /** Quadratic ease-in-out. */
  quadraticInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },

  /** Cubic ease-in: starts at zero velocity. */
  cubicIn(t: number): number {
    return t * t * t
  },
  /** Cubic ease-out: ends at zero velocity. */
  cubicOut(t: number): number {
    const u = t - 1
    return u * u * u + 1
  },
  /** Cubic ease-in-out. */
  cubicInOut(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 + 4 * (t - 1) * (t - 1) * (t - 1)
  },

  /** Sine ease-in. */
  sineIn(t: number): number {
    return 1 - Math.cos(t * HALF_PI)
  },
  /** Sine ease-out. */
  sineOut(t: number): number {
    return Math.sin(t * HALF_PI)
  },
  /** Sine ease-in-out. */
  sineInOut(t: number): number {
    return -(Math.cos(PI * t) - 1) / 2
  },

  /** Bouncing ease-out (ball-drops-then-bounces curve). */
  bounceOut(t: number): number {
    const n = 7.5625
    const d = 2.75
    if (t < 1 / d) {
      return n * t * t
    } else if (t < 2 / d) {
      const u = t - 1.5 / d
      return n * u * u + 0.75
    } else if (t < 2.5 / d) {
      const u = t - 2.25 / d
      return n * u * u + 0.9375
    } else {
      const u = t - 2.625 / d
      return n * u * u + 0.984375
    }
  },
  /** Bouncing ease-in (reverse of {@link bounceOut}). */
  bounceIn(t: number): number {
    return 1 - Easing.bounceOut(1 - t)
  },

  /** Elastic ease-out (springy overshoot toward 1). */
  elasticOut(t: number): number {
    if (t === 0) return 0
    if (t === 1) return 1
    const c4 = (2 * PI) / 3
    return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
  /** Elastic ease-in (springy overshoot from 0). */
  elasticIn(t: number): number {
    if (t === 0) return 0
    if (t === 1) return 1
    const c4 = (2 * PI) / 3
    return -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * c4)
  },
} as const
