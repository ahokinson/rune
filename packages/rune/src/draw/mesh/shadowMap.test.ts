import { describe, expect, it } from "bun:test"
import type { Mesh } from "@/draw/mesh/rasterizer"
import { ShadowMap } from "@/draw/mesh/shadowMap"
import { Matrix4 } from "@/math/matrix4"

// A horizontal quad at y = 1 spanning x,z ∈ [-0.5, 0.5]. Both windings are
// emitted so the depth pass renders it whichever way it faces the light.
function makeOccluder(): Mesh {
  const positions = new Float32Array([-0.5, 1, -0.5, 0.5, 1, -0.5, 0.5, 1, 0.5, -0.5, 1, 0.5])
  const indices = new Uint32Array([0, 1, 2, 0, 2, 3, 0, 2, 1, 0, 3, 2])
  return { positions, indices }
}

describe("ShadowMap", () => {
  it("shadows a point occluded from the light and lights one beside it", () => {
    // Light straight overhead (+y); camera looks down −y.
    const shadow = new ShadowMap({ resolution: 256, light: { x: 0, y: 1, z: 0 }, extent: 2.2 })
    shadow.render([{ mesh: makeOccluder(), model: new Matrix4() }])

    // Directly under the quad at the ground: the quad (y=1) is nearer the light.
    expect(shadow.shadowAt(0, 0, 0, 1)).toBeLessThan(0.5)
    // Off to the side, clear of the quad: fully lit.
    expect(shadow.shadowAt(1.6, 0, 0, 1)).toBe(1)
    // Far outside the light frustum: treated as lit.
    expect(shadow.shadowAt(100, 0, 0, 1)).toBe(1)
  })

  it("does not self-shadow the caster surface (bias)", () => {
    const shadow = new ShadowMap({ resolution: 256, light: { x: 0, y: 1, z: 0 }, extent: 2.2 })
    shadow.render([{ mesh: makeOccluder(), model: new Matrix4() }])
    // A point on the occluder plane itself should read lit, not acne-shadowed.
    expect(shadow.shadowAt(0, 1, 0, 1)).toBe(1)
  })

  it("is a no-op query before anything is rendered", () => {
    const shadow = new ShadowMap({ resolution: 64, light: { x: 0, y: 1, z: 0 } })
    expect(shadow.shadowAt(0, 0, 0, 1)).toBe(1)
  })
})
