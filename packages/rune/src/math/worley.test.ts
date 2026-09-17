import { describe, expect, it } from "bun:test"
import { Worley2D, WorleyDistance } from "@/math/worley"

describe("Worley2D", () => {
  it("is deterministic for a given seed", () => {
    const a = new Worley2D(5)
    const b = new Worley2D(5)
    for (let i = 0; i < 20; i++) {
      expect(a.f1(i * 0.4, i * 0.6)).toBe(b.f1(i * 0.4, i * 0.6))
    }
  })

  it("f2 is never less than f1", () => {
    const noise = new Worley2D(11)
    for (let i = 0; i < 200; i++) {
      const { f1, f2 } = noise.sample(i * 0.17, i * 0.23)
      expect(f2).toBeGreaterThanOrEqual(f1)
    }
  })

  it("edges are non-negative", () => {
    const noise = new Worley2D(2)
    for (let i = 0; i < 100; i++) {
      expect(noise.edges(i * 0.31, i * 0.13)).toBeGreaterThanOrEqual(0)
    }
  })

  it("supports the Manhattan metric", () => {
    const noise = new Worley2D(2, WorleyDistance.Manhattan)
    expect(Number.isFinite(noise.f1(1.5, 2.5))).toBe(true)
  })
})
