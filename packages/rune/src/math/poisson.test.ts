import { describe, expect, it } from "bun:test"
import { poissonDisk } from "@/math/poisson"

describe("poissonDisk", () => {
  it("respects the minimum radius between all points", () => {
    const radius = 4
    const points = poissonDisk({ width: 80, height: 60, radius, seed: 1 })
    expect(points.length).toBeGreaterThan(0)
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i]!.x - points[j]!.x
        const dy = points[i]!.y - points[j]!.y
        expect(Math.sqrt(dx * dx + dy * dy)).toBeGreaterThanOrEqual(radius - 1e-9)
      }
    }
  })

  it("keeps every point inside the rectangle", () => {
    const points = poissonDisk({ width: 50, height: 40, radius: 3, seed: 2 })
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(0)
      expect(point.x).toBeLessThan(50)
      expect(point.y).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeLessThan(40)
    }
  })

  it("is deterministic for a seed", () => {
    const a = poissonDisk({ width: 30, height: 30, radius: 3, seed: 7 })
    const b = poissonDisk({ width: 30, height: 30, radius: 3, seed: 7 })
    expect(a.length).toBe(b.length)
    expect(a[0]!.x).toBe(b[0]!.x)
  })

  it("returns nothing for degenerate input", () => {
    expect(poissonDisk({ width: 0, height: 10, radius: 2 })).toEqual([])
    expect(poissonDisk({ width: 10, height: 10, radius: 0 })).toEqual([])
  })
})
