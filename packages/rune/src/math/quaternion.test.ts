import { describe, expect, it } from "bun:test"
import { Matrix4 } from "@/math/matrix4"
import { Quaternion } from "@/math/quaternion"
import { Vector3 } from "@/math/vector3"

// Rotate (x,y,z) by a quaternion and return the result components.
function rotate(q: Quaternion, x: number, y: number, z: number): Vector3 {
  return q.rotateVectorInto(new Vector3(), new Vector3(x, y, z))
}

describe("Quaternion", () => {
  it("identity leaves a vector unchanged", () => {
    const out = rotate(new Quaternion(), 3, -4, 5)
    expect(out.x).toBeCloseTo(3, 10)
    expect(out.y).toBeCloseTo(-4, 10)
    expect(out.z).toBeCloseTo(5, 10)
  })

  it("rotates +X by +90° about Y onto -Z (matching composeInto)", () => {
    const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    const out = rotate(q, 1, 0, 0)
    expect(out.x).toBeCloseTo(0, 10)
    expect(out.y).toBeCloseTo(0, 10)
    expect(out.z).toBeCloseTo(-1, 10)
  })

  it("setFromEuler agrees with Matrix4.composeInto for arbitrary angles", () => {
    const euler = new Vector3(0.6, -1.1, 0.35)
    const matrix = new Matrix4().composeInto(Vector3.zero, euler, Vector3.one)
    const q = new Quaternion().setFromEuler(euler.x, euler.y, euler.z)

    const expected = new Vector3()
    for (const [x, y, z] of [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0.4, -0.7, 0.55],
    ] as const) {
      matrix.transformDirectionInto(expected, x, y, z)
      const got = rotate(q, x, y, z)
      expect(got.x).toBeCloseTo(expected.x, 10)
      expect(got.y).toBeCloseTo(expected.y, 10)
      expect(got.z).toBeCloseTo(expected.z, 10)
    }
  })

  it("composeQuaternionInto matches composeInto for the same orientation", () => {
    const euler = new Vector3(-0.8, 0.5, 1.2)
    const fromEuler = new Matrix4().composeInto(new Vector3(2, -3, 4), euler, new Vector3(1, 1, 1))
    const q = new Quaternion().setFromEuler(euler.x, euler.y, euler.z)
    const fromQuat = new Matrix4().composeQuaternionInto(new Vector3(2, -3, 4), q, new Vector3(1, 1, 1))
    for (let i = 0; i < 16; i++) expect(fromQuat.elements[i]!).toBeCloseTo(fromEuler.elements[i]!, 10)
  })

  it("integrating a constant angular velocity matches a single axis-angle rotation", () => {
    const omega = new Vector3(0, 1.5, 0) // radians/sec about Y
    const seconds = 1.2
    const q = new Quaternion()
    const steps = 2000
    for (let i = 0; i < steps; i++) q.integrateInPlace(omega, seconds / steps)

    const reference = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 1.5 * seconds)
    const a = rotate(q, 1, 0, 0)
    const b = rotate(reference, 1, 0, 0)
    expect(a.x).toBeCloseTo(b.x, 4)
    expect(a.y).toBeCloseTo(b.y, 4)
    expect(a.z).toBeCloseTo(b.z, 4)
  })

  it("rotateVectorInverseInto undoes rotateVectorInto", () => {
    const q = new Quaternion().setFromEuler(0.3, -0.9, 1.4)
    const rotated = rotate(q, 0.5, -0.25, 0.75)
    const back = q.rotateVectorInverseInto(new Vector3(), rotated)
    expect(back.x).toBeCloseTo(0.5, 10)
    expect(back.y).toBeCloseTo(-0.25, 10)
    expect(back.z).toBeCloseTo(0.75, 10)
  })

  it("multiplyInto composes rotations (b applied first)", () => {
    const aboutY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    const aboutX = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
    const combined = new Quaternion().multiplyInto(aboutY, aboutX)

    // Apply aboutX first then aboutY to +Y, and compare to the combined rotation.
    const step = rotate(aboutX, 0, 1, 0)
    const viaSteps = rotate(aboutY, step.x, step.y, step.z)
    const viaCombined = rotate(combined, 0, 1, 0)
    expect(viaCombined.x).toBeCloseTo(viaSteps.x, 10)
    expect(viaCombined.y).toBeCloseTo(viaSteps.y, 10)
    expect(viaCombined.z).toBeCloseTo(viaSteps.z, 10)
  })

  it("normalizeInPlace yields a unit quaternion", () => {
    const q = new Quaternion(1, 2, 3, 4).normalizeInPlace()
    expect(Math.hypot(q.x, q.y, q.z, q.w)).toBeCloseTo(1, 12)
  })
})
