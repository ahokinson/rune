import { describe, expect, it } from "bun:test"
import { Rectangle } from "@/math/rectangle"
import { RigidBody2D } from "@/physics/rigidBody2d"

describe("RigidBody2D", () => {
  it("falls under gravity when unobstructed", () => {
    const body = new RigidBody2D({ x: 0, y: 0, width: 1, height: 1, gravity: 10 })
    body.step(0.1, [])
    expect(body.velocity.y).toBeGreaterThan(0)
    expect(body.box.y).toBeGreaterThan(0)
    expect(body.grounded).toBe(false)
  })

  it("lands on a floor and reports grounded", () => {
    const floor = new Rectangle(-5, 10, 20, 2)
    const body = new RigidBody2D({ x: 0, y: 0, width: 1, height: 1, gravity: 50 })
    for (let i = 0; i < 200; i++) body.step(1 / 60, [floor])
    expect(body.grounded).toBe(true)
    expect(body.box.bottom).toBeCloseTo(floor.top, 3)
    expect(body.velocity.y).toBe(0)
  })

  it("bounces with restitution", () => {
    const floor = new Rectangle(-5, 10, 20, 2)
    const body = new RigidBody2D({ x: 0, y: 8, width: 1, height: 1, gravity: 50, restitution: 0.8 })
    let sawUpward = false
    for (let i = 0; i < 60; i++) {
      body.step(1 / 60, [floor])
      if (body.velocity.y < 0) sawUpward = true
    }
    expect(sawUpward).toBe(true)
  })

  it("applies ground friction to horizontal speed", () => {
    const floor = new Rectangle(-50, 10, 100, 2)
    const body = new RigidBody2D({ x: 0, y: 9, width: 1, height: 1, gravity: 50, friction: 5 })
    body.velocity.x = 10
    // Settle onto the floor first.
    for (let i = 0; i < 30; i++) body.step(1 / 60, [floor])
    const before = Math.abs(body.velocity.x)
    for (let i = 0; i < 30; i++) body.step(1 / 60, [floor])
    expect(Math.abs(body.velocity.x)).toBeLessThan(before)
  })

  it("stops horizontal motion against a wall", () => {
    const wall = new Rectangle(5, -10, 2, 100)
    const body = new RigidBody2D({ x: 0, y: 0, width: 1, height: 1, gravity: 0 })
    body.velocity.x = 20
    for (let i = 0; i < 60; i++) body.step(1 / 60, [wall])
    expect(body.box.right).toBeLessThanOrEqual(wall.left + 1e-6)
    expect(body.velocity.x).toBe(0)
  })
})
