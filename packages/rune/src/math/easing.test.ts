import { describe, expect, it } from "bun:test"
import { Easing } from "@/math/easing"

const curves = [
  Easing.linear,
  Easing.quadraticIn,
  Easing.quadraticOut,
  Easing.quadraticInOut,
  Easing.cubicIn,
  Easing.cubicOut,
  Easing.cubicInOut,
  Easing.sineIn,
  Easing.sineOut,
  Easing.sineInOut,
  Easing.bounceIn,
  Easing.bounceOut,
  Easing.elasticIn,
  Easing.elasticOut,
]

describe("Easing", () => {
  it("every curve passes through 0 at t=0 and 1 at t=1", () => {
    for (const curve of curves) {
      expect(curve(0)).toBeCloseTo(0, 6)
      expect(curve(1)).toBeCloseTo(1, 6)
    }
  })

  it("linear is the identity", () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      expect(Easing.linear(t)).toBe(t)
    }
  })

  it("quadraticIn is below linear in the lower half", () => {
    expect(Easing.quadraticIn(0.5)).toBeLessThan(0.5)
  })

  it("quadraticOut is above linear in the lower half", () => {
    expect(Easing.quadraticOut(0.5)).toBeGreaterThan(0.5)
  })
})
