import { describe, expect, it } from "bun:test"
import { alignment, arrive, type Boid, cohesion, flee, seek, separation, Wander } from "@/ai/steering"
import { Random } from "@/math/random"
import { Vector2 } from "@/math/vector2"

describe("seek / flee", () => {
  it("seek points toward the target", () => {
    const force = seek(new Vector2(0, 0), new Vector2(0, 0), new Vector2(10, 0), 5)
    expect(force.x).toBeGreaterThan(0)
    expect(Math.abs(force.y)).toBeLessThan(1e-9)
  })

  it("flee points away from the target", () => {
    const force = flee(new Vector2(0, 0), new Vector2(0, 0), new Vector2(10, 0), 5)
    expect(force.x).toBeLessThan(0)
  })
})

describe("arrive", () => {
  it("slows down within the slow radius", () => {
    const near = arrive(new Vector2(9, 0), new Vector2(0, 0), new Vector2(10, 0), 5, 4)
    const far = arrive(new Vector2(0, 0), new Vector2(0, 0), new Vector2(10, 0), 5, 4)
    // Desired speed near the target is lower than at full cruise.
    expect(near.length()).toBeLessThan(far.length())
  })
})

describe("Wander", () => {
  it("produces a finite, bounded steering force", () => {
    const wander = new Wander(2, 1, 0.5, new Random(1))
    const velocity = new Vector2(1, 0)
    for (let i = 0; i < 50; i++) {
      const force = wander.step(velocity, 3)
      expect(Number.isFinite(force.x)).toBe(true)
      expect(Number.isFinite(force.y)).toBe(true)
    }
  })
})

describe("flocking", () => {
  const flock: Boid[] = [
    { position: new Vector2(0, 0), velocity: new Vector2(1, 0) },
    { position: new Vector2(1, 0), velocity: new Vector2(1, 0) },
    { position: new Vector2(0, 1), velocity: new Vector2(0, 1) },
  ]

  it("separation pushes away from close neighbours", () => {
    const self = flock[0]!
    const force = separation(self, flock, 3)
    // Neighbours are to the +x/+y, so separation steers toward −x/−y.
    expect(force.x).toBeLessThanOrEqual(0)
    expect(force.y).toBeLessThanOrEqual(0)
  })

  it("cohesion steers toward the neighbours' centre", () => {
    // self at (0,0) with neighbours at +x/+y; the centre is up-right, so the
    // desired velocity gains a +y component (the +x is offset by current velocity).
    const self = flock[0]!
    const force = cohesion(self, flock, 3)
    expect(force.y).toBeGreaterThan(0)
  })

  it("alignment matches neighbour headings", () => {
    const self: Boid = { position: new Vector2(0, 0), velocity: new Vector2(0, 0) }
    const neighbours: Boid[] = [{ position: new Vector2(1, 0), velocity: new Vector2(2, 0) }]
    const force = alignment(self, [self, ...neighbours], 3)
    expect(force.x).toBeGreaterThan(0)
  })
})
