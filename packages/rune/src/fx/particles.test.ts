import { describe, expect, it } from "bun:test"
import { Particles } from "@/fx/particles"
import { Vector2 } from "@/math/vector2"

describe("Particles", () => {
  it("emit adds active particles", () => {
    const fx = new Particles({
      origin: new Vector2(0, 0),
      lifetimeMilliseconds: 1000,
      speedRange: [1, 1],
      angleRange: [0, 0],
      characters: ["*"],
    })
    fx.emit(5)
    expect(fx.activeCount).toBe(5)
  })

  it("particles expire after their lifetime elapses", () => {
    const fx = new Particles({
      origin: new Vector2(0, 0),
      lifetimeMilliseconds: 100,
      characters: ["*"],
    })
    fx.emit(3)
    fx.update(101)
    expect(fx.activeCount).toBe(0)
  })

  it("continuous emission via ratePerSecond", () => {
    const fx = new Particles({
      origin: new Vector2(0, 0),
      ratePerSecond: 10,
      lifetimeMilliseconds: 10_000,
      characters: ["*"],
    })
    fx.update(1000)
    expect(fx.activeCount).toBe(10)
  })

  it("gravity accelerates velocity over time", () => {
    const fx = new Particles({
      origin: new Vector2(0, 0),
      lifetimeMilliseconds: 10_000,
      speedRange: [0, 0],
      angleRange: [0, 0],
      gravity: new Vector2(0, 10),
      characters: ["*"],
    })
    fx.emit(1)
    fx.update(1000)
    // After 1 second of gravity (0, 10), y position should be ~5 (averaging from 0 to 10 m/s)
    expect(fx.activeCount).toBe(1)
  })

  it("respects maximumParticles cap", () => {
    const fx = new Particles({
      origin: new Vector2(0, 0),
      lifetimeMilliseconds: 1000,
      characters: ["*"],
      maximumParticles: 3,
    })
    fx.emit(10)
    expect(fx.activeCount).toBe(3)
  })
})
