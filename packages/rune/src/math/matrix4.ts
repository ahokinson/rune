import type { Quaternion } from "./quaternion"
import type { Vector3 } from "./vector3"

/**
 * Column-major 4×4 model matrices for the triangle rasterizer, following the
 * `*Into(out)` no-alloc idiom so render loops never allocate.
 *
 * @module
 */

/**
 * A column-major 4×4 matrix, the model transform fed to the triangle rasterizer
 * (renderMesh). Storage is 16 contiguous numbers; element (row r, column c) lives
 * at index c * 4 + r, so columns 0–2 are the basis axes and column 3 is the
 * translation. Follows Vector3's `*Into(out)` idiom: every operation writes into
 * an existing matrix/vector so a render loop never allocates.
 *
 * @example
 * ```ts
 * const m = new Matrix4()
 * const t = new Vector3(1, 2, 3)
 * m.composeInto(t, new Vector3(0, 0, 0), new Vector3(1, 1, 1))
 * const out = new Vector3()
 * m.transformPointInto(out, 0, 0, 0)  // out = (1, 2, 3)
 * ```
 */
export class Matrix4 {
  /**
   * Column-major: [m00,m10,m20,m30, m01,m11,m21,m31, ...]. Float64 so chained
   * composes keep enough precision for tight test tolerances.
   */
  readonly elements: Float64Array

  /** Create a new identity matrix. */
  constructor() {
    this.elements = new Float64Array(16)
    this.identity()
  }

  /**
   * Reset to the identity matrix.
   *
   * @returns `this` for chaining.
   */
  identity(): this {
    const e = this.elements
    e[0] = 1
    e[1] = 0
    e[2] = 0
    e[3] = 0
    e[4] = 0
    e[5] = 1
    e[6] = 0
    e[7] = 0
    e[8] = 0
    e[9] = 0
    e[10] = 1
    e[11] = 0
    e[12] = 0
    e[13] = 0
    e[14] = 0
    e[15] = 1
    return this
  }

  /**
   * Copy `other`'s elements into `this`.
   *
   * @param other - Matrix to copy from.
   * @returns `this` for chaining.
   */
  copyFrom(other: Matrix4): this {
    this.elements.set(other.elements)
    return this
  }

  /**
   * Set `this = a · b` (column-major). Safe to alias `this` with `a` or `b`; the
   * 16 products are read out of locals before any write-back.
   *
   * @param a - Left operand.
   * @param b - Right operand.
   * @returns `this` for chaining.
   */
  multiplyInto(a: Matrix4, b: Matrix4): this {
    const ae = a.elements
    const be = b.elements
    const a00 = ae[0]!,
      a10 = ae[1]!,
      a20 = ae[2]!,
      a30 = ae[3]!
    const a01 = ae[4]!,
      a11 = ae[5]!,
      a21 = ae[6]!,
      a31 = ae[7]!
    const a02 = ae[8]!,
      a12 = ae[9]!,
      a22 = ae[10]!,
      a32 = ae[11]!
    const a03 = ae[12]!,
      a13 = ae[13]!,
      a23 = ae[14]!,
      a33 = ae[15]!

    const e = this.elements
    for (let c = 0; c < 4; c++) {
      const b0 = be[c * 4]!
      const b1 = be[c * 4 + 1]!
      const b2 = be[c * 4 + 2]!
      const b3 = be[c * 4 + 3]!
      e[c * 4] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3
      e[c * 4 + 1] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3
      e[c * 4 + 2] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3
      e[c * 4 + 3] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3
    }
    return this
  }

  /**
   * Build T · R · S from a translation, an XYZ Euler rotation (radians, applied
   * X then Y then Z), and a per-axis scale. The rotation columns are scaled in
   * place, so the result transforms a point as translate(rotate(scale(p))).
   *
   * @param translation - Translation component (column 3).
   * @param rotationEuler - XYZ Euler rotation in radians (X then Y then Z).
   * @param scale - Per-axis scale.
   * @returns `this` for chaining.
   */
  composeInto(translation: Vector3, rotationEuler: Vector3, scale: Vector3): this {
    const cx = Math.cos(rotationEuler.x)
    const sx = Math.sin(rotationEuler.x)
    const cy = Math.cos(rotationEuler.y)
    const sy = Math.sin(rotationEuler.y)
    const cz = Math.cos(rotationEuler.z)
    const sz = Math.sin(rotationEuler.z)

    // R = Rz · Ry · Rx, stored column-major.
    const r00 = cz * cy
    const r10 = sz * cy
    const r20 = -sy
    const r01 = cz * sy * sx - sz * cx
    const r11 = sz * sy * sx + cz * cx
    const r21 = cy * sx
    const r02 = cz * sy * cx + sz * sx
    const r12 = sz * sy * cx - cz * sx
    const r22 = cy * cx

    const e = this.elements
    e[0] = r00 * scale.x
    e[1] = r10 * scale.x
    e[2] = r20 * scale.x
    e[3] = 0
    e[4] = r01 * scale.y
    e[5] = r11 * scale.y
    e[6] = r21 * scale.y
    e[7] = 0
    e[8] = r02 * scale.z
    e[9] = r12 * scale.z
    e[10] = r22 * scale.z
    e[11] = 0
    e[12] = translation.x
    e[13] = translation.y
    e[14] = translation.z
    e[15] = 1
    return this
  }

  /**
   * Build T · R · S from a translation, a (unit) quaternion orientation, and a
   * per-axis scale — the quaternion counterpart of composeInto, for transforms
   * that track orientation as a quaternion rather than Euler angles.
   *
   * @param translation - Translation component (column 3).
   * @param rotation - Unit quaternion orientation.
   * @param scale - Per-axis scale.
   * @returns `this` for chaining.
   */
  composeQuaternionInto(translation: Vector3, rotation: Quaternion, scale: Vector3): this {
    const { x, y, z, w } = rotation
    const xx = x * x
    const yy = y * y
    const zz = z * z
    const xy = x * y
    const xz = x * z
    const yz = y * z
    const wx = w * x
    const wy = w * y
    const wz = w * z

    const e = this.elements
    e[0] = (1 - 2 * (yy + zz)) * scale.x
    e[1] = 2 * (xy + wz) * scale.x
    e[2] = 2 * (xz - wy) * scale.x
    e[3] = 0
    e[4] = 2 * (xy - wz) * scale.y
    e[5] = (1 - 2 * (xx + zz)) * scale.y
    e[6] = 2 * (yz + wx) * scale.y
    e[7] = 0
    e[8] = 2 * (xz + wy) * scale.z
    e[9] = 2 * (yz - wx) * scale.z
    e[10] = (1 - 2 * (xx + yy)) * scale.z
    e[11] = 0
    e[12] = translation.x
    e[13] = translation.y
    e[14] = translation.z
    e[15] = 1
    return this
  }

  /**
   * Transform a position (w = 1): rotation/scale columns plus the translation.
   *
   * @param out - Target vector to write.
   * @param x - Input X.
   * @param y - Input Y.
   * @param z - Input Z.
   * @returns `out` for chaining.
   */
  transformPointInto(out: Vector3, x: number, y: number, z: number): Vector3 {
    const e = this.elements
    out.set(
      e[0]! * x + e[4]! * y + e[8]! * z + e[12]!,
      e[1]! * x + e[5]! * y + e[9]! * z + e[13]!,
      e[2]! * x + e[6]! * y + e[10]! * z + e[14]!,
    )
    return out
  }

  /**
   * Transform a direction (w = 0): the 3×3 linear part only, so translation is
   * ignored. Note this is the plain upper-left block, correct for normals only
   * under rotation + uniform scale (the meshes here use uniform scale).
   *
   * @param out - Target vector to write.
   * @param x - Input X.
   * @param y - Input Y.
   * @param z - Input Z.
   * @returns `out` for chaining.
   */
  transformDirectionInto(out: Vector3, x: number, y: number, z: number): Vector3 {
    const e = this.elements
    out.set(e[0]! * x + e[4]! * y + e[8]! * z, e[1]! * x + e[5]! * y + e[9]! * z, e[2]! * x + e[6]! * y + e[10]! * z)
    return out
  }
}
