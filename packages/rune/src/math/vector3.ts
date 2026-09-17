import { lerp as lerpScalar } from "./scalar"

/**
 * 3D vector extending the `*Into`/`*InPlace` out-param idiom from
 * {@link Vector2}. Screen space is Y-down (origin top-left); +Z is forward.
 *
 * @module
 */

/**
 * Mutable 3D vector.
 *
 * @example
 * ```ts
 * const v = new Vector3(1, 2, 2)
 * v.length()              // 3
 * v.normalize().length()  // 1
 *
 * const out = new Vector3()
 * Vector3.lerpInto(out, new Vector3(0, 0, 0), new Vector3(3, 3, 3), 0.5)  // out = (1.5, 1.5, 1.5)
 * ```
 */
export class Vector3 {
  /** X component. */
  x: number
  /** Y component. */
  y: number
  /** Z component. */
  z: number

  /**
   * @param x - X component (default 0).
   * @param y - Y component (default 0).
   * @param z - Z component (default 0).
   */
  constructor(x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  /** Shortcut for `(0, 0, 0)`. */
  static readonly zero = new Vector3(0, 0, 0)
  /** Shortcut for `(1, 1, 1)`. */
  static readonly one = new Vector3(1, 1, 1)
  /** Shortcut for `(0, -1, 0)` — screen-up is negative Y. */
  static readonly up = new Vector3(0, -1, 0)
  /** Shortcut for `(0, 1, 0)` — screen-down is positive Y. */
  static readonly down = new Vector3(0, 1, 0)
  /** Shortcut for `(-1, 0, 0)`. */
  static readonly left = new Vector3(-1, 0, 0)
  /** Shortcut for `(1, 0, 0)`. */
  static readonly right = new Vector3(1, 0, 0)
  /** Shortcut for `(0, 0, 1)`. */
  static readonly forward = new Vector3(0, 0, 1)
  /** Shortcut for `(0, 0, -1)`. */
  static readonly back = new Vector3(0, 0, -1)

  /**
   * Linearly interpolate from `a` to `b` by `t`, writing the result into `out`.
   *
   * @param out - Target vector.
   * @param a - Start vector.
   * @param b - End vector.
   * @param t - Interpolation factor (0 = `a`, 1 = `b`).
   * @returns `out` for chaining.
   */
  static lerpInto(out: Vector3, a: Vector3, b: Vector3, t: number): Vector3 {
    out.x = a.x + (b.x - a.x) * t
    out.y = a.y + (b.y - a.y) * t
    out.z = a.z + (b.z - a.z) * t
    return out
  }

  /** Return a copy of this vector. */
  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z)
  }

  /**
   * Set all components and return `this` for chaining.
   *
   * @param x - New X.
   * @param y - New Y.
   * @param z - New Z.
   * @returns `this`.
   */
  set(x: number, y: number, z: number): this {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  /**
   * Copy components from `other` into `this`.
   *
   * @returns `this`.
   */
  copyFrom(other: Vector3): this {
    this.x = other.x
    this.y = other.y
    this.z = other.z
    return this
  }

  /**
   * Component-wise equality.
   *
   * @returns `true` if all components match.
   */
  equals(other: Vector3): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }

  /** Return `this + other` as a new vector. */
  add(other: Vector3): Vector3 {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  /** Add `other` into `this` and return `this`. */
  addInPlace(other: Vector3): this {
    this.x += other.x
    this.y += other.y
    this.z += other.z
    return this
  }

  /** Return `this - other` as a new vector. */
  subtract(other: Vector3): Vector3 {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  /** Subtract `other` from `this` in place and return `this`. */
  subtractInPlace(other: Vector3): this {
    this.x -= other.x
    this.y -= other.y
    this.z -= other.z
    return this
  }

  /** Return the component-wise product `this * other` as a new vector. */
  multiply(other: Vector3): Vector3 {
    return new Vector3(this.x * other.x, this.y * other.y, this.z * other.z)
  }

  /** Multiply `this` by `other` in place and return `this`. */
  multiplyInPlace(other: Vector3): this {
    this.x *= other.x
    this.y *= other.y
    this.z *= other.z
    return this
  }

  /** Return `this * factor` as a new vector. */
  scale(factor: number): Vector3 {
    return new Vector3(this.x * factor, this.y * factor, this.z * factor)
  }

  /** Scale `this` by `factor` in place and return `this`. */
  scaleInPlace(factor: number): this {
    this.x *= factor
    this.y *= factor
    this.z *= factor
    return this
  }

  /** Euclidean length (`sqrt(x² + y² + z²)`). */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  /** Squared length — cheaper than {@link length} when comparing distances. */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z
  }

  /** Return a unit-length copy. Returns `(0, 0, 0)` if the length is zero. */
  normalize(): Vector3 {
    const length = this.length()
    if (length === 0) return new Vector3(0, 0, 0)
    return new Vector3(this.x / length, this.y / length, this.z / length)
  }

  /** Dot product `this · other`. */
  dot(other: Vector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }

  /** Cross product `this × other` as a new vector. */
  cross(other: Vector3): Vector3 {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    )
  }

  /** Euclidean distance to `other`. */
  distanceTo(other: Vector3): number {
    const dx = this.x - other.x
    const dy = this.y - other.y
    const dz = this.z - other.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  /** Squared distance to `other` — cheaper for ordering comparisons. */
  distanceToSquared(other: Vector3): number {
    const dx = this.x - other.x
    const dy = this.y - other.y
    const dz = this.z - other.z
    return dx * dx + dy * dy + dz * dz
  }

  /**
   * Linearly interpolate toward `other` by `t`, returning a new vector.
   *
   * @param t - Interpolation factor (0 = `this`, 1 = `other`).
   */
  lerp(other: Vector3, t: number): Vector3 {
    return new Vector3(lerpScalar(this.x, other.x, t), lerpScalar(this.y, other.y, t), lerpScalar(this.z, other.z, t))
  }
}
