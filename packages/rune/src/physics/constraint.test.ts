import { describe, expect, it } from "bun:test"
import { Vector3 } from "@/math/vector3"
import { ConstraintSolver, DistanceConstraint, PinConstraint, PointMass } from "@/physics/constraint"

describe("constraint system", () => {
  it("a pinned particle never moves", () => {
    const solver = new ConstraintSolver({ gravity: new Vector3(0, 10, 0) })
    const fixed = solver.add(new PointMass(0, 0, 0, 0))
    for (let i = 0; i < 100; i++) solver.step(1 / 60)
    expect(fixed.position.x).toBe(0)
    expect(fixed.position.y).toBe(0)
  })

  it("a distance constraint pulls two particles toward the rest length", () => {
    const solver = new ConstraintSolver({ iterations: 20 })
    const a = solver.add(new PointMass(0, 0, 0, 1))
    const b = solver.add(new PointMass(10, 0, 0, 1))
    solver.addConstraint(new DistanceConstraint(a, b, 2))
    for (let i = 0; i < 50; i++) solver.step(1 / 60)
    const dx = b.position.x - a.position.x
    const dy = b.position.y - a.position.y
    const dz = b.position.z - a.position.z
    expect(Math.sqrt(dx * dx + dy * dy + dz * dz)).toBeCloseTo(2, 2)
  })

  it("a hanging chain settles below its pin under gravity", () => {
    const solver = new ConstraintSolver({ gravity: new Vector3(0, 10, 0), iterations: 30 })
    const anchor = solver.add(new PointMass(0, 0, 0, 0)) // pinned
    const links = [anchor]
    for (let i = 1; i <= 5; i++) {
      const link = solver.add(new PointMass(i, 0, 0, 1))
      solver.addConstraint(new DistanceConstraint(links[i - 1]!, link, 1))
      links.push(link)
    }
    for (let i = 0; i < 600; i++) solver.step(1 / 60)
    const tail = links[links.length - 1]!
    // The chain should hang downward (+Y), with the tail below the anchor.
    expect(tail.position.y).toBeGreaterThan(anchor.position.y)
    // Each link stays roughly its rest length from the next.
    for (let i = 1; i < links.length; i++) {
      const dx = links[i]!.position.x - links[i - 1]!.position.x
      const dy = links[i]!.position.y - links[i - 1]!.position.y
      const dz = links[i]!.position.z - links[i - 1]!.position.z
      expect(Math.sqrt(dx * dx + dy * dy + dz * dz)).toBeCloseTo(1, 1)
    }
  })

  it("a pin constraint locks a particle to a moving anchor", () => {
    const anchor = new Vector3(3, 4, 5)
    const solver = new ConstraintSolver({ gravity: new Vector3(0, 10, 0) })
    const particle = solver.add(new PointMass(0, 0, 0, 1))
    solver.addConstraint(new PinConstraint(particle, anchor))
    solver.step(1 / 60)
    expect(particle.position.x).toBe(3)
    expect(particle.position.y).toBe(4)
    expect(particle.position.z).toBe(5)
  })
})
