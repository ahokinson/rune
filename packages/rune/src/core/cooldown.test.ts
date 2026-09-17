import { describe, expect, it } from "bun:test"
import { Cooldown } from "@/core/cooldown"

describe("Cooldown", () => {
  it("starts ready", () => {
    const cooldown = new Cooldown(500)
    expect(cooldown.isReady).toBe(true)
  })

  it("becomes not-ready after firing and ready again after duration elapses", () => {
    const cooldown = new Cooldown(500)
    expect(cooldown.fire()).toBe(true)
    expect(cooldown.isReady).toBe(false)
    cooldown.tick(499)
    expect(cooldown.isReady).toBe(false)
    cooldown.tick(1)
    expect(cooldown.isReady).toBe(true)
  })

  it("refuses to fire while still cooling down and returns false", () => {
    const cooldown = new Cooldown(200)
    cooldown.fire()
    expect(cooldown.fire()).toBe(false)
    cooldown.tick(100)
    expect(cooldown.fire()).toBe(false)
    cooldown.tick(100)
    expect(cooldown.fire()).toBe(true)
  })

  it("reset() makes the cooldown immediately ready", () => {
    const cooldown = new Cooldown(1000)
    cooldown.fire()
    expect(cooldown.isReady).toBe(false)
    cooldown.reset()
    expect(cooldown.isReady).toBe(true)
  })

  it("reports the remaining milliseconds, clamped to zero", () => {
    const cooldown = new Cooldown(300)
    cooldown.fire()
    expect(cooldown.remaining).toBe(300)
    cooldown.tick(100)
    expect(cooldown.remaining).toBeCloseTo(200, 10)
    cooldown.tick(500)
    expect(cooldown.remaining).toBe(0)
  })
})
