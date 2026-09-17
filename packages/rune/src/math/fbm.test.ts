import { describe, expect, it } from "bun:test"
import { domainWarp, fbm, ridged } from "@/math/fbm"
import { Noise2D } from "@/math/noise2d"

describe("fbm helpers", () => {
  it("fbm of value noise stays within the sampler's [0, 1) range", () => {
    const noise = new Noise2D(4)
    const sampler = (x: number, y: number) => noise.sample(x, y)
    for (let i = 0; i < 100; i++) {
      const value = fbm(sampler, i * 0.1, i * 0.2, { octaves: 5 })
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it("matches a hand-rolled two-octave sum", () => {
    const noise = new Noise2D(8)
    const sampler = (x: number, y: number) => noise.sample(x, y)
    const expected = (sampler(1.5, 2.5) * 1 + sampler(3, 5) * 0.5) / 1.5
    expect(fbm(sampler, 1.5, 2.5, { octaves: 2, gain: 0.5, lacunarity: 2 })).toBeCloseTo(expected, 10)
  })

  it("ridged output is in [0, 1]", () => {
    const noise = new Noise2D(6)
    const sampler = (x: number, y: number) => noise.perlin(x, y)
    for (let i = 0; i < 100; i++) {
      const value = ridged(sampler, i * 0.15, i * 0.05)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it("domain warp is deterministic and finite", () => {
    const noise = new Noise2D(12)
    const field = (x: number, y: number) => noise.sample(x, y)
    const warp = (x: number, y: number) => noise.perlin(x, y)
    const a = domainWarp(field, warp, 2.5, 3.5, { strength: 2 })
    const b = domainWarp(field, warp, 2.5, 3.5, { strength: 2 })
    expect(a).toBe(b)
    expect(Number.isFinite(a)).toBe(true)
  })
})
