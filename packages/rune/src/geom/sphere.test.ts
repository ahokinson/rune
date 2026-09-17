import { describe, expect, it } from "bun:test"
import { greatCircleAngle, sampleGreatCircleArc, slerp, sphericalToVector3, vector3ToSpherical } from "@/geom/sphere"
import { Vector3 } from "@/math/vector3"

describe("sphere", () => {
  it("maps the equator/prime-meridian to +z", () => {
    const v = sphericalToVector3(0, 0)
    expect(v.x).toBeCloseTo(0, 10)
    expect(v.y).toBeCloseTo(0, 10)
    expect(v.z).toBeCloseTo(1, 10)
  })

  it("maps the +pole to -y (rune's up)", () => {
    const v = sphericalToVector3(Math.PI / 2, 0)
    expect(v.y).toBeCloseTo(-1, 10)
  })

  it("round-trips spherical <-> vector3", () => {
    for (const [theta, phi] of [
      [0.3, 1.2],
      [-0.9, -2.5],
      [0.0, Math.PI / 4],
    ] as const) {
      const back = vector3ToSpherical(sphericalToVector3(theta, phi))
      expect(back.theta).toBeCloseTo(theta, 10)
      expect(back.phi).toBeCloseTo(phi, 10)
    }
  })

  it("slerp returns the endpoints at t=0 and t=1", () => {
    const a = sphericalToVector3(0, 0)
    const b = sphericalToVector3(0, Math.PI / 2)
    const start = slerp(a, b, 0)
    const end = slerp(a, b, 1)
    expect(start.distanceTo(a)).toBeCloseTo(0, 10)
    expect(end.distanceTo(b)).toBeCloseTo(0, 10)
  })

  it("slerp midpoint stays on the unit sphere", () => {
    const a = sphericalToVector3(0, 0)
    const b = sphericalToVector3(0, Math.PI / 2)
    const mid = slerp(a, b, 0.5)
    expect(mid.length()).toBeCloseTo(1, 10)
  })

  it("slerp falls back to lerp for near-parallel endpoints", () => {
    const a = new Vector3(0, 0, 1)
    const b = new Vector3(0, 0, 1)
    const mid = slerp(a, b, 0.5)
    expect(mid.z).toBeCloseTo(1, 10)
  })

  it("greatCircleAngle is 0 for identical and pi/2 for orthogonal", () => {
    const a = new Vector3(1, 0, 0)
    const b = new Vector3(0, 0, 1)
    expect(greatCircleAngle(a, a)).toBeCloseTo(0, 10)
    expect(greatCircleAngle(a, b)).toBeCloseTo(Math.PI / 2, 10)
  })

  it("sampleGreatCircleArc yields steps+1 points with matching endpoints", () => {
    const a = sphericalToVector3(0, 0)
    const b = sphericalToVector3(0.5, 1.0)
    const points = sampleGreatCircleArc(a, b, 8)
    expect(points.length).toBe(9)
    expect(points[0]!.distanceTo(a)).toBeCloseTo(0, 10)
    expect(points[8]!.distanceTo(b)).toBeCloseTo(0, 10)
  })
})
