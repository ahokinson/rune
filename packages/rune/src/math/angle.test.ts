import { describe, expect, it } from "bun:test"
import { Angle } from "@/math/angle"

describe("Angle", () => {
  it("converts between degrees and radians", () => {
    expect(Angle.fromDegrees(180)).toBeCloseTo(Math.PI, 10)
    expect(Angle.toDegrees(Math.PI)).toBeCloseTo(180, 10)
    expect(Angle.fromDegrees(0)).toBe(0)
  })

  it("normalises radians into [-π, π]", () => {
    expect(Angle.normalize(0)).toBe(0)
    expect(Angle.normalize(Math.PI)).toBeCloseTo(Math.PI, 10)
    expect(Angle.normalize(-Math.PI)).toBeCloseTo(-Math.PI, 10)
    expect(Angle.normalize(Math.PI * 3)).toBeCloseTo(Math.PI, 10)
    expect(Angle.normalize(-Math.PI * 3)).toBeCloseTo(-Math.PI, 10)
    expect(Angle.normalize(Math.PI * 2.25)).toBeCloseTo(Math.PI * 0.25, 10)
  })

  it("shortestDelta picks the closer direction", () => {
    expect(Angle.shortestDelta(0, Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10)
    expect(Angle.shortestDelta(Math.PI / 2, 0)).toBeCloseTo(-Math.PI / 2, 10)
    expect(Angle.shortestDelta(-Math.PI + 0.1, Math.PI - 0.1)).toBeCloseTo(-0.2, 10)
  })

  it("lerpShortest interpolates the shorter way around", () => {
    const halfway = Angle.lerpShortest(-Math.PI + 0.1, Math.PI - 0.1, 0.5)
    expect(Math.abs(halfway)).toBeCloseTo(Math.PI, 6)
  })

  it("lerpShortest stays inside the smaller arc", () => {
    const quarter = Angle.lerpShortest(0, Math.PI / 2, 0.5)
    expect(quarter).toBeCloseTo(Math.PI / 4, 10)
  })

  it("lerp interpolates linearly without wrapping", () => {
    expect(Angle.lerp(0, Math.PI, 0.5)).toBeCloseTo(Math.PI / 2, 10)
  })
})
