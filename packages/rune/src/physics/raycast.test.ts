import { describe, expect, it } from "bun:test"
import { Vector2 } from "@/math/vector2"
import { castRay } from "@/physics/raycast"

describe("castRay", () => {
  const wallAtFive = (column: number, _row: number) => column === 5

  it("hits a head-on wall at the expected distance", () => {
    const origin = new Vector2(0.5, 0.5)
    const direction = new Vector2(1, 0)
    const hit = castRay(origin, direction, wallAtFive, 20)
    expect(hit).not.toBeNull()
    expect(hit!.distance).toBeCloseTo(4.5, 6)
    expect(hit!.cellColumn).toBe(5)
    expect(hit!.side).toBe("x")
  })

  it("returns null when no wall lies within maxDistance", () => {
    const origin = new Vector2(0.5, 0.5)
    const direction = new Vector2(1, 0)
    const hit = castRay(origin, direction, wallAtFive, 1)
    expect(hit).toBeNull()
  })

  it("returns null on zero-direction ray", () => {
    const origin = new Vector2(0.5, 0.5)
    const direction = new Vector2(0, 0)
    const hit = castRay(origin, direction, () => true, 10)
    expect(hit).toBeNull()
  })

  it("detects y-side hit when ray travels mostly downward", () => {
    const wallAtRowFive = (_column: number, row: number) => row === 5
    const origin = new Vector2(0.5, 0.5)
    const direction = new Vector2(0, 1)
    const hit = castRay(origin, direction, wallAtRowFive, 20)
    expect(hit).not.toBeNull()
    expect(hit!.side).toBe("y")
    expect(hit!.cellRow).toBe(5)
    expect(hit!.distance).toBeCloseTo(4.5, 6)
  })

  it("computes wallU as a fraction in [0, 1)", () => {
    const wallAtTwo = (column: number, _row: number) => column === 2
    const origin = new Vector2(0.5, 0.5)
    const direction = new Vector2(1, 0.3).normalize()
    const hit = castRay(origin, direction, wallAtTwo, 10)
    expect(hit).not.toBeNull()
    expect(hit!.wallU).toBeGreaterThanOrEqual(0)
    expect(hit!.wallU).toBeLessThan(1)
  })

  it("hit point lies on the ray", () => {
    const wallAtFour = (column: number, _row: number) => column === 4
    const origin = new Vector2(0.5, 0.5)
    const direction = new Vector2(1, 0.2).normalize()
    const hit = castRay(origin, direction, wallAtFour, 20)
    expect(hit).not.toBeNull()
    const projected = new Vector2(origin.x + direction.x * hit!.distance, origin.y + direction.y * hit!.distance)
    expect(hit!.hitPoint.x).toBeCloseTo(projected.x, 6)
    expect(hit!.hitPoint.y).toBeCloseTo(projected.y, 6)
  })
})
