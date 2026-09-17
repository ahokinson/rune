import { describe, expect, it } from "bun:test"
import { RateCounter } from "@/core/rateCounter"

describe("RateCounter", () => {
  it("counts events within the window", () => {
    const counter = new RateCounter(10)
    counter.record(0)
    counter.record(2)
    counter.record(5)
    expect(counter.sample(5)).toBe(3)
  })

  it("prunes events older than the window", () => {
    const counter = new RateCounter(10)
    counter.record(0)
    counter.record(5)
    // at now=10, the event at 0 is exactly `window` old and drops out (>=).
    expect(counter.sample(10)).toBe(1)
    expect(counter.sample(16)).toBe(0)
  })

  it("exposes the last sampled count via current", () => {
    const counter = new RateCounter(5)
    counter.record(0)
    counter.record(1)
    counter.sample(2)
    expect(counter.current).toBe(2)
  })

  it("reset clears all recorded events", () => {
    const counter = new RateCounter(100)
    counter.record(1)
    counter.record(2)
    counter.reset()
    expect(counter.sample(3)).toBe(0)
    expect(counter.current).toBe(0)
  })
})
