import { describe, expect, it } from "bun:test"
import { Color } from "@/draw/color"
import { burstEmitter } from "@/fx/particles"
import { Vector2 } from "@/math/vector2"

describe("burstEmitter", () => {
  const base = {
    characters: ["*", "·"],
    color: Color.WHITE,
    lifetimeMilliseconds: 400,
    speedRange: [10, 20] as [number, number],
    angleRange: [0, Math.PI] as [number, number],
  }

  it("builds a manual-emit emitter (rate 0) with a 64 default pool", () => {
    const particles = burstEmitter(base)
    expect(particles.ratePerSecond).toBe(0)
    expect(particles.activeCount).toBe(0)
    // Nothing spawns from the rate alone.
    particles.update(1000)
    expect(particles.activeCount).toBe(0)
    // Manual emit spawns immediately.
    particles.emit(5)
    expect(particles.activeCount).toBe(5)
  })

  it("caps the pool at maximumParticles", () => {
    const particles = burstEmitter({ ...base, maximumParticles: 3 })
    particles.emit(10)
    expect(particles.activeCount).toBe(3)
  })

  it("applies zIndex and origin when given", () => {
    const particles = burstEmitter({ ...base, zIndex: 42, origin: new Vector2(7, 9) })
    expect(particles.zIndex).toBe(42)
    expect(particles.origin.x).toBe(7)
    expect(particles.origin.y).toBe(9)
  })

  it("defaults the origin to (0, 0)", () => {
    const particles = burstEmitter(base)
    expect(particles.origin.x).toBe(0)
    expect(particles.origin.y).toBe(0)
  })
})
