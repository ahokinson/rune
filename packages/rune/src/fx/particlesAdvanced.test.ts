import { describe, expect, it } from "bun:test"
import { Color } from "@/draw/color"
import { directionalForce } from "@/fx/forceField"
import { Particles } from "@/fx/particles"
import { Rectangle } from "@/math/rectangle"
import { Vector2 } from "@/math/vector2"

describe("Particles force fields", () => {
  it("a directional force accelerates particles and fires the expire hook", () => {
    let finalVelocityY = 0
    const particles = new Particles({
      origin: new Vector2(0, 0),
      lifetimeMilliseconds: 100,
      characters: ["*"],
      color: Color.WHITE,
      forces: [directionalForce(0, 50)],
      onExpire: (_position, velocity) => {
        finalVelocityY = velocity.y
      },
    })
    particles.emit(1)
    for (let i = 0; i < 10; i++) particles.update(16)
    expect(finalVelocityY).toBeGreaterThan(0)
  })
})

describe("Particles collision", () => {
  it("bounces a particle off an obstacle, reversing its velocity", () => {
    let finalVelocityX = 0
    const wall = new Rectangle(5, -10, 4, 100)
    const particles = new Particles({
      origin: new Vector2(0, 0),
      lifetimeMilliseconds: 250,
      characters: ["*"],
      speedRange: [100, 100],
      angleRange: [0, 0], // straight along +x
      collideWith: [wall],
      bounce: 1,
      onExpire: (_position, velocity) => {
        finalVelocityX = velocity.x
      },
    })
    particles.emit(1)
    for (let i = 0; i < 20; i++) particles.update(16)
    expect(finalVelocityX).toBeLessThan(0)
  })
})

describe("Particles sub-emitter", () => {
  it("onExpire fires once per expired particle", () => {
    let deaths = 0
    const particles = new Particles({
      origin: new Vector2(0, 0),
      lifetimeMilliseconds: 50,
      characters: ["*"],
      onExpire: () => {
        deaths++
      },
    })
    particles.emit(3)
    for (let i = 0; i < 5; i++) particles.update(16)
    expect(deaths).toBe(3)
  })
})
