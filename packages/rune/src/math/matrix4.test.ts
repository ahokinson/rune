import { describe, expect, it } from "bun:test"
import { Matrix4 } from "@/math/matrix4"
import { Vector3 } from "@/math/vector3"

describe("Matrix4", () => {
  it("starts as the identity", () => {
    const m = new Matrix4()
    const out = new Vector3()
    m.transformPointInto(out, 3, -4, 5)
    expect(out.x).toBeCloseTo(3, 10)
    expect(out.y).toBeCloseTo(-4, 10)
    expect(out.z).toBeCloseTo(5, 10)
  })

  it("composes translation + scale and transforms a point", () => {
    const m = new Matrix4()
    m.composeInto(new Vector3(10, 20, 30), Vector3.zero, new Vector3(2, 3, 4))
    const out = new Vector3()
    m.transformPointInto(out, 1, 1, 1)
    expect(out.x).toBeCloseTo(12, 10)
    expect(out.y).toBeCloseTo(23, 10)
    expect(out.z).toBeCloseTo(34, 10)
  })

  it("rotates a basis vector about Y", () => {
    const m = new Matrix4()
    m.composeInto(Vector3.zero, new Vector3(0, Math.PI / 2, 0), Vector3.one)
    const out = new Vector3()
    // +X rotated +90° about Y (Rz·Ry·Rx convention) lands on -Z.
    m.transformPointInto(out, 1, 0, 0)
    expect(out.x).toBeCloseTo(0, 10)
    expect(out.y).toBeCloseTo(0, 10)
    expect(out.z).toBeCloseTo(-1, 10)
  })

  it("transformDirection ignores translation but applies rotation", () => {
    const m = new Matrix4()
    m.composeInto(new Vector3(100, 100, 100), new Vector3(0, 0, Math.PI / 2), Vector3.one)
    const out = new Vector3()
    // +X rotated +90° about Z lands on +Y; translation must not leak in.
    m.transformDirectionInto(out, 1, 0, 0)
    expect(out.x).toBeCloseTo(0, 10)
    expect(out.y).toBeCloseTo(1, 10)
    expect(out.z).toBeCloseTo(0, 10)
  })

  it("multiplyInto matches sequential point transforms", () => {
    const a = new Matrix4().composeInto(new Vector3(1, 2, 3), Vector3.zero, new Vector3(2, 2, 2))
    const b = new Matrix4().composeInto(Vector3.zero, new Vector3(0, Math.PI / 2, 0), Vector3.one)
    const ab = new Matrix4().multiplyInto(a, b)

    const viaProduct = new Vector3()
    ab.transformPointInto(viaProduct, 1, 0, 0)

    const viaSteps = new Vector3()
    b.transformPointInto(viaSteps, 1, 0, 0)
    a.transformPointInto(viaSteps, viaSteps.x, viaSteps.y, viaSteps.z)

    expect(viaProduct.x).toBeCloseTo(viaSteps.x, 10)
    expect(viaProduct.y).toBeCloseTo(viaSteps.y, 10)
    expect(viaProduct.z).toBeCloseTo(viaSteps.z, 10)
  })
})
