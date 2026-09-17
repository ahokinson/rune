import { Vector3 } from "./vector3"

/**
 * Unit quaternions for 3D orientation, paired with Matrix4.composeQuaternionInto
 * to build model matrices.
 *
 * @module
 */

/**
 * A unit quaternion for 3D orientation. Preferred over Euler angles for anything
 * that accumulates rotation over time — it integrates angular velocity without
 * gimbal lock and stays numerically stable under renormalization. Pairs with
 * Matrix4.composeQuaternionInto to build a model matrix for rendering.
 *
 * @example
 * ```ts
 * const q = new Quaternion()
 * q.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)  // 90° about Y
 * const out = new Vector3()
 * q.rotateVectorInto(out, new Vector3(1, 0, 0))  // out ≈ (0, 0, -1)
 * ```
 */
export class Quaternion {
  /** X component of the vector part. */
  x: number
  /** Y component of the vector part. */
  y: number
  /** Z component of the vector part. */
  z: number
  /** Scalar (real) part. */
  w: number

  /**
   * @param x - X component (default 0).
   * @param y - Y component (default 0).
   * @param z - Z component (default 0).
   * @param w - Scalar part (default 1, the identity rotation).
   */
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }

  /** The identity rotation (no rotation). */
  static readonly identity = new Quaternion(0, 0, 0, 1)

  /** Return a copy of this quaternion. */
  clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w)
  }

  /**
   * Set all four components and return `this` for chaining.
   *
   * @param x - X component.
   * @param y - Y component.
   * @param z - Z component.
   * @param w - Scalar part.
   * @returns `this`.
   */
  set(x: number, y: number, z: number, w: number): this {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
    return this
  }

  /**
   * Copy components from `other` into `this`.
   *
   * @returns `this`.
   */
  copyFrom(other: Quaternion): this {
    this.x = other.x
    this.y = other.y
    this.z = other.z
    this.w = other.w
    return this
  }

  /**
   * Rotation of `radians` about a (not necessarily unit) axis.
   *
   * @param axis - Rotation axis (need not be unit length).
   * @param radians - Rotation angle in radians.
   * @returns `this`.
   */
  setFromAxisAngle(axis: Vector3, radians: number): this {
    const length = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z)
    if (length === 0) return this.set(0, 0, 0, 1)
    const half = radians * 0.5
    const s = Math.sin(half) / length
    return this.set(axis.x * s, axis.y * s, axis.z * s, Math.cos(half))
  }

  /**
   * XYZ Euler angles (radians), applied X then Y then Z — matching the rotation
   * order of Matrix4.composeInto, so the two agree for the same angles.
   *
   * @param x - Rotation about X in radians.
   * @param y - Rotation about Y in radians.
   * @param z - Rotation about Z in radians.
   * @returns `this`.
   */
  setFromEuler(x: number, y: number, z: number): this {
    const cx = Math.cos(x * 0.5)
    const sx = Math.sin(x * 0.5)
    const cy = Math.cos(y * 0.5)
    const sy = Math.sin(y * 0.5)
    const cz = Math.cos(z * 0.5)
    const sz = Math.sin(z * 0.5)
    return this.set(
      cz * cy * sx - sz * sy * cx,
      cz * sy * cx + sz * cy * sx,
      sz * cy * cx - cz * sy * sx,
      cz * cy * cx + sz * sy * sx,
    )
  }

  /**
   * Squared length — cheaper than `Math.sqrt` when only comparing magnitudes.
   *
   * @returns `x² + y² + z² + w²`.
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
  }

  /**
   * Hamilton product into `this = a ⊗ b`. Composing rotations: the result applies b
   * first, then a. Safe to alias (reads inputs before writing).
   *
   * @param a - Left operand.
   * @param b - Right operand.
   * @returns `this`.
   */
  multiplyInto(a: Quaternion, b: Quaternion): this {
    const ax = a.x
    const ay = a.y
    const az = a.z
    const aw = a.w
    const bx = b.x
    const by = b.y
    const bz = b.z
    const bw = b.w
    return this.set(
      aw * bx + ax * bw + ay * bz - az * by,
      aw * by - ax * bz + ay * bw + az * bx,
      aw * bz + ax * by - ay * bx + az * bw,
      aw * bw - ax * bx - ay * by - az * bz,
    )
  }

  /**
   * Scale to unit length. Returns the identity if the length is zero.
   *
   * @returns `this`.
   */
  normalizeInPlace(): this {
    const lengthSquared = this.lengthSquared()
    if (lengthSquared === 0) return this.set(0, 0, 0, 1)
    const inverse = 1 / Math.sqrt(lengthSquared)
    this.x *= inverse
    this.y *= inverse
    this.z *= inverse
    this.w *= inverse
    return this
  }

  /**
   * Advance the orientation by an angular velocity (world-frame, radians/sec)
   * over a time step, then renormalize. Uses q += 0.5·(ω as a pure quaternion)·q·Δt.
   *
   * @param angularVelocity - World-frame angular velocity in radians/sec.
   * @param deltaSeconds - Time step in seconds.
   * @returns `this` (renormalized).
   */
  integrateInPlace(angularVelocity: Vector3, deltaSeconds: number): this {
    const half = deltaSeconds * 0.5
    const wx = angularVelocity.x * half
    const wy = angularVelocity.y * half
    const wz = angularVelocity.z * half
    const { x, y, z, w } = this
    this.x += wx * w + wy * z - wz * y
    this.y += wy * w + wz * x - wx * z
    this.z += wz * w + wx * y - wy * x
    this.w += -wx * x - wy * y - wz * z
    return this.normalizeInPlace()
  }

  /**
   * Rotate a vector by this quaternion: out = q·v·q⁻¹. Out may alias the input.
   *
   * @param out - Target vector to write.
   * @param v - Vector to rotate.
   * @returns `out` for chaining.
   */
  rotateVectorInto(out: Vector3, v: Vector3): Vector3 {
    const { x, y, z, w } = this
    // t = 2·(q.xyz × v)
    const tx = 2 * (y * v.z - z * v.y)
    const ty = 2 * (z * v.x - x * v.z)
    const tz = 2 * (x * v.y - y * v.x)
    // out = v + w·t + q.xyz × t
    return out.set(v.x + w * tx + (y * tz - z * ty), v.y + w * ty + (z * tx - x * tz), v.z + w * tz + (x * ty - y * tx))
  }

  /**
   * Rotate a vector by the inverse orientation (the conjugate, since unit). Out
   * may alias the input.
   *
   * @param out - Target vector to write.
   * @param v - Vector to rotate.
   * @returns `out` for chaining.
   */
  rotateVectorInverseInto(out: Vector3, v: Vector3): Vector3 {
    const x = -this.x
    const y = -this.y
    const z = -this.z
    const w = this.w
    const tx = 2 * (y * v.z - z * v.y)
    const ty = 2 * (z * v.x - x * v.z)
    const tz = 2 * (x * v.y - y * v.x)
    return out.set(v.x + w * tx + (y * tz - z * ty), v.y + w * ty + (z * tx - x * tz), v.z + w * tz + (x * ty - y * tx))
  }

  /**
   * Set this quaternion to the rotation that takes `localAxis` (default +Y)
   * onto `dir` (assumed unit). Handles the parallel and anti-parallel cases.
   *
   * @param dir - Target direction (assumed unit length).
   * @param localAxis - Axis to align onto `dir` (default +Y).
   * @returns `this`.
   */
  setFromDirection(dir: Vector3, localAxis: Vector3 = UP): this {
    const dot = localAxis.x * dir.x + localAxis.y * dir.y + localAxis.z * dir.z
    if (dot > 0.99999) return this.set(0, 0, 0, 1)
    if (dot < -0.99999) return this.setFromAxisAngle(scratchAxis.set(1, 0, 0), Math.PI)
    scratchAxis.set(
      localAxis.y * dir.z - localAxis.z * dir.y,
      localAxis.z * dir.x - localAxis.x * dir.z,
      localAxis.x * dir.y - localAxis.y * dir.x,
    )
    const len = scratchAxis.length() || 1
    scratchAxis.scaleInPlace(1 / len)
    return this.setFromAxisAngle(scratchAxis, Math.acos(Math.max(-1, Math.min(1, dot))))
  }
}

const scratchAxis = new Vector3(0, 0, 0)
const UP = new Vector3(0, 1, 0)
