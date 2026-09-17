import { describe, expect, it } from "bun:test"
import { Noise2D } from "@/math/noise2d"

describe("Noise2D", () => {
  it("is deterministic for a given seed", () => {
    const a = new Noise2D(7)
    const b = new Noise2D(7)
    for (let i = 0; i < 20; i++) {
      const x = i * 0.37
      const y = i * 0.91
      expect(a.sample(x, y)).toBe(b.sample(x, y))
      expect(a.perlin(x, y)).toBe(b.perlin(x, y))
    }
  })

  it("value noise stays in [0, 1)", () => {
    const noise = new Noise2D(1)
    for (let i = 0; i < 200; i++) {
      const value = noise.sample(i * 0.13, i * 0.07)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it("perlin noise is zero on the integer lattice", () => {
    const noise = new Noise2D(3)
    for (let y = -3; y <= 3; y++) {
      for (let x = -3; x <= 3; x++) {
        expect(Math.abs(noise.perlin(x, y))).toBeLessThan(1e-9)
      }
    }
  })

  it("fbm stays in [0, 1)", () => {
    const noise = new Noise2D(9)
    for (let i = 0; i < 100; i++) {
      const value = noise.fbm(i * 0.2, i * 0.3, 5)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
