import { describe, expect, it } from "bun:test"
import { Rectangle } from "@/math/rectangle"
import { KinematicBody2D, type KinematicBody2DOptions } from "@/physics/kinematicBody2d"

const base: KinematicBody2DOptions = {
  gravity: 200,
  maxFall: 100,
  walkAccel: 100,
  friction: 100,
  maxWalk: 10,
  jumpVelocity: 50,
  coyoteMilliseconds: 100,
  jumpBufferMilliseconds: 100,
}

describe("KinematicBody2D", () => {
  it("falls under gravity and rests flush on a floor", () => {
    const body = new KinematicBody2D(base)
    const box = new Rectangle(0, 0, 1, 1)
    const floor = [new Rectangle(0, 5, 4, 1)]
    for (let i = 0; i < 60; i++) body.step(box, { move: 0, jump: false }, 16, floor)
    expect(body.grounded).toBe(true)
    expect(box.y).toBeCloseTo(4, 5)
    expect(body.velocity.y).toBe(0)
  })

  it("accelerates with input and decays with friction", () => {
    const body = new KinematicBody2D({ ...base, gravity: 0 })
    const box = new Rectangle(0, 0, 1, 1)
    body.step(box, { move: 1, jump: false }, 16, [])
    expect(body.velocity.x).toBeGreaterThan(0)
    const moving = body.velocity.x
    body.step(box, { move: 0, jump: false }, 16, [])
    expect(body.velocity.x).toBeLessThan(moving)
  })

  it("jumps from the ground", () => {
    const body = new KinematicBody2D(base)
    const box = new Rectangle(0, 0, 1, 1)
    const floor = [new Rectangle(0, 5, 4, 1)]
    for (let i = 0; i < 60; i++) body.step(box, { move: 0, jump: false }, 16, floor)
    expect(body.grounded).toBe(true)
    body.step(box, { move: 0, jump: true }, 16, floor)
    expect(body.velocity.y).toBeLessThan(0)
    expect(body.grounded).toBe(false)
  })

  it("still jumps within the coyote window after leaving the ground", () => {
    const body = new KinematicBody2D(base)
    const box = new Rectangle(0, 0, 1, 1)
    const floor = [new Rectangle(0, 5, 4, 1)]
    for (let i = 0; i < 60; i++) body.step(box, { move: 0, jump: false }, 16, floor)
    // One airborne step (no floor) — coyote (100ms) still open after 16ms.
    body.step(box, { move: 0, jump: false }, 16, [])
    expect(body.grounded).toBe(false)
    body.step(box, { move: 0, jump: true }, 16, [])
    expect(body.velocity.y).toBeLessThan(0)
  })

  it("does not coyote-jump once the window has elapsed", () => {
    const body = new KinematicBody2D({ ...base, coyoteMilliseconds: 20 })
    const box = new Rectangle(0, 0, 1, 1)
    const floor = [new Rectangle(0, 5, 4, 1)]
    for (let i = 0; i < 60; i++) body.step(box, { move: 0, jump: false }, 16, floor)
    for (let i = 0; i < 3; i++) body.step(box, { move: 0, jump: false }, 16, [])
    body.step(box, { move: 0, jump: true }, 16, [])
    expect(body.velocity.y).toBeGreaterThan(0) // still falling, jump didn't fire
  })

  it("stops flush against a wall and zeroes the blocked axis", () => {
    const body = new KinematicBody2D({ ...base, gravity: 0, walkAccel: 1000, maxWalk: 100, friction: 0 })
    const box = new Rectangle(0, 0, 1, 1)
    const wall = [new Rectangle(5, 0, 1, 1)]
    for (let i = 0; i < 60; i++) body.step(box, { move: 1, jump: false }, 16, wall)
    expect(box.x).toBeCloseTo(4, 5)
    expect(body.velocity.x).toBe(0)
  })
})
