import { lerp as lerpScalar } from "./scalar"

/**
 * 2D vector with the `*Into` out-param idiom so render loops never allocate.
 *
 * Methods that return a new `Vector2` (`add`, `subtract`, `scale`, …) have an
 * `*InPlace` sibling that mutates `this` and a static `*Into` variant that
 * writes into a caller-supplied instance. Use the allocating forms for setup
 * and one-shots; use `*InPlace` or `*Into` inside per-frame hot paths.
 *
 * Screen space is Y-down (origin top-left), matching {@link Vector3}'s convention.
 *
 * @module
 */

/**
 * Mutable 2D vector.
 *
 * @example
 * ```ts
 * const v = new Vector2(3, 4)
 * v.length()              // 5
 * v.normalize().length()  // 1
 *
 * // Hot-path: reuse a scratch vector instead of allocating.
 * const scratch = new Vector2()
 * Vector2.fromAngleInto(scratch, 0)  // scratch = (1, 0)
 * ```
 */
export class Vector2 {
  /** X component. */
  x: number
  /** Y component. */
  y: number

  /**
   * @param x - X component (default 0).
   * @param y - Y component (default 0).
   */
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  /** Shortcut for `(0, 0)`. */
  static readonly zero = new Vector2(0, 0)
  /** Shortcut for `(1, 1)`. */
  static readonly one = new Vector2(1, 1)
  /** Shortcut for `(0, -1)` — screen-up is negative Y. */
  static readonly up = new Vector2(0, -1)
  /** Shortcut for `(0, 1)` — screen-down is positive Y. */
  static readonly down = new Vector2(0, 1)
  /** Shortcut for `(-1, 0)`. */
  static readonly left = new Vector2(-1, 0)
  /** Shortcut for `(1, 0)`. */
  static readonly right = new Vector2(1, 0)

  /**
   * Construct a unit vector at `angleRadians`, optionally scaled by `magnitude`.
   *
   * @param angleRadians - Direction in radians (0 = +X, π/2 = +Y).
   * @param magnitude - Length of the resulting vector (default 1).
   * @returns A new {@link Vector2}.
   */
  static fromAngle(angleRadians: number, magnitude = 1): Vector2 {
    return new Vector2(Math.cos(angleRadians) * magnitude, Math.sin(angleRadians) * magnitude)
  }

  /**
   * Write a unit vector at `angleRadians` into `out` (no allocation).
   *
   * @param out - Target vector to fill.
   * @param angleRadians - Direction in radians.
   * @param magnitude - Length (default 1).
   * @returns `out` for chaining.
   */
  static fromAngleInto(out: Vector2, angleRadians: number, magnitude = 1): Vector2 {
    out.x = Math.cos(angleRadians) * magnitude
    out.y = Math.sin(angleRadians) * magnitude
    return out
  }

  /**
   * Linearly interpolate from `a` to `b` by `t`, writing the result into `out`.
   *
   * @param out - Target vector.
   * @param a - Start vector.
   * @param b - End vector.
   * @param t - Interpolation factor (0 = `a`, 1 = `b`).
   * @returns `out` for chaining.
   */
  static lerpInto(out: Vector2, a: Vector2, b: Vector2, t: number): Vector2 {
    out.x = a.x + (b.x - a.x) * t
    out.y = a.y + (b.y - a.y) * t
    return out
  }

  /** Return a copy of this vector. */
  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  /**
   * Set both components and return `this` for chaining.
   *
   * @param x - New X.
   * @param y - New Y.
   * @returns `this`.
   */
  set(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  /**
   * Copy components from `other` into `this`.
   *
   * @returns `this`.
   */
  copyFrom(other: Vector2): this {
    this.x = other.x
    this.y = other.y
    return this
  }

  /**
   * Component-wise equality.
   *
   * @returns `true` if both `x` and `y` match.
   */
  equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y
  }

  /** Return `this + other` as a new vector. */
  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y)
  }

  /** Add `other` into `this` and return `this`. */
  addInPlace(other: Vector2): this {
    this.x += other.x
    this.y += other.y
    return this
  }

  /** Return `this - other` as a new vector. */
  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y)
  }

  /** Subtract `other` from `this` in place and return `this`. */
  subtractInPlace(other: Vector2): this {
    this.x -= other.x
    this.y -= other.y
    return this
  }

  /** Return the component-wise product `this * other` as a new vector. */
  multiply(other: Vector2): Vector2 {
    return new Vector2(this.x * other.x, this.y * other.y)
  }

  /** Multiply `this` by `other` in place and return `this`. */
  multiplyInPlace(other: Vector2): this {
    this.x *= other.x
    this.y *= other.y
    return this
  }

  /** Return `this * factor` as a new vector. */
  scale(factor: number): Vector2 {
    return new Vector2(this.x * factor, this.y * factor)
  }

  /** Scale `this` by `factor` in place and return `this`. */
  scaleInPlace(factor: number): this {
    this.x *= factor
    this.y *= factor
    return this
  }

  /** Euclidean length (`sqrt(x² + y²)`). */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /** Squared length — cheaper than {@link length} when comparing distances. */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  /** Return a unit-length copy. Returns `(0, 0)` if the length is zero. */
  normalize(): Vector2 {
    const length = this.length()
    if (length === 0) return new Vector2(0, 0)
    return new Vector2(this.x / length, this.y / length)
  }

  /** Dot product `this · other`. */
  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y
  }

  /** Euclidean distance to `other`. */
  distanceTo(other: Vector2): number {
    const dx = this.x - other.x
    const dy = this.y - other.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /** Squared distance to `other` — cheaper for ordering comparisons. */
  distanceToSquared(other: Vector2): number {
    const dx = this.x - other.x
    const dy = this.y - other.y
    return dx * dx + dy * dy
  }

  /**
   * Linearly interpolate toward `other` by `t`, returning a new vector.
   *
   * @param t - Interpolation factor (0 = `this`, 1 = `other`).
   */
  lerp(other: Vector2, t: number): Vector2 {
    return new Vector2(lerpScalar(this.x, other.x, t), lerpScalar(this.y, other.y, t))
  }

  /**
   * Return a copy rotated by `angleRadians` (counter-clockwise in standard
   * math space, clockwise in Y-down screen space).
   */
  rotate(angleRadians: number): Vector2 {
    const cosine = Math.cos(angleRadians)
    const sine = Math.sin(angleRadians)
    return new Vector2(this.x * cosine - this.y * sine, this.x * sine + this.y * cosine)
  }
}
