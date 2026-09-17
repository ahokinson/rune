import { describe, expect, it } from "bun:test"
import { advanceLoop, createLoopState } from "@/core/loop"

describe("advanceLoop", () => {
  it("does not tick before a full step has accumulated", () => {
    const state = createLoopState()
    let calls = 0
    advanceLoop(state, 50, 100, 5, () => calls++)
    expect(calls).toBe(0)
    expect(state.tick).toBe(0)
    expect(state.accumulator).toBe(50)
  })

  it("ticks exactly once per accumulated step", () => {
    const state = createLoopState()
    let calls = 0
    advanceLoop(state, 100, 100, 5, () => calls++)
    advanceLoop(state, 100, 100, 5, () => calls++)
    advanceLoop(state, 100, 100, 5, () => calls++)
    expect(calls).toBe(3)
    expect(state.tick).toBe(3)
    expect(state.accumulator).toBe(0)
  })

  it("invokes the callback with the constant step delta and increasing tick", () => {
    const state = createLoopState()
    const ticks: Array<{ deltaMilliseconds: number; tick: number }> = []
    advanceLoop(state, 250, 100, 5, (deltaMilliseconds, tick) => ticks.push({ deltaMilliseconds, tick }))
    expect(ticks).toEqual([
      { deltaMilliseconds: 100, tick: 1 },
      { deltaMilliseconds: 100, tick: 2 },
    ])
    expect(state.accumulator).toBeCloseTo(50, 10)
  })

  it("caps the number of sub-steps to prevent a death spiral", () => {
    const state = createLoopState()
    let calls = 0
    advanceLoop(state, 100_000, 16.6667, 5, () => calls++)
    expect(calls).toBe(5)
    expect(state.tick).toBe(5)
    expect(state.accumulator).toBeLessThanOrEqual(16.6667 * 5)
  })

  it("returns early when the step is non-positive", () => {
    const state = createLoopState()
    let calls = 0
    advanceLoop(state, 100, 0, 5, () => calls++)
    expect(calls).toBe(0)
    expect(state.accumulator).toBe(0)
  })
})
