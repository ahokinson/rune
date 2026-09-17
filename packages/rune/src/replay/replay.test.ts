import { describe, expect, it } from "bun:test"
import { Random } from "@/math/random"
import { InputPlayback } from "@/replay/playback"
import { InputRecorder } from "@/replay/record"
import { hashState, loadState, saveState, serializeState } from "@/replay/snapshot"
import { Timeline } from "@/replay/timeline"

describe("input record + playback", () => {
  it("replays the recorded frames in order", () => {
    const recorder = new InputRecorder<number>(123)
    for (let i = 0; i < 5; i++) recorder.record(i * 2)
    const playback = new InputPlayback(recorder.build())
    expect(playback.seed).toBe(123)
    const replayed: number[] = []
    while (!playback.done) replayed.push(playback.next()!)
    expect(replayed).toEqual([0, 2, 4, 6, 8])
    expect(playback.next()).toBeUndefined()
  })

  it("reproduces a seeded simulation bit-for-bit", () => {
    // Inputs come from outside the sim (a "player"); the seeded Random drives the
    // sim only. Capturing the inputs + seed is enough to replay identically.
    const recorder = new InputRecorder<number>(42)
    const live = new Random(42)
    let liveState = 0
    for (let tick = 0; tick < 20; tick++) {
      const input = tick % 7 // external input, not drawn from the sim's Random
      recorder.record(input)
      liveState += input + Math.floor(live.float(0, 100))
    }
    // Replay with the same seed and recorded inputs.
    const playback = new InputPlayback(recorder.build())
    const replay = new Random(playback.seed)
    let replayState = 0
    while (!playback.done) {
      const input = playback.next()!
      replayState += input + Math.floor(replay.float(0, 100))
    }
    expect(replayState).toBe(liveState)
  })
})

describe("Timeline", () => {
  it("fires events as the clock reaches their time", () => {
    const fired: string[] = []
    const timeline = new Timeline<string>({ speed: 1, apply: (value) => fired.push(value) })
    timeline.append({ time: 0, value: "a" })
    timeline.append({ time: 1, value: "b" })
    timeline.append({ time: 2, value: "c" })
    timeline.update(0.5) // clock at 0.5 → only "a" (time 0)
    expect(fired).toEqual(["a"])
    timeline.update(1) // clock at 1.5 → "b"
    expect(fired).toEqual(["a", "b"])
    timeline.update(1) // clock at 2.5 → "c"
    expect(fired).toEqual(["a", "b", "c"])
    expect(timeline.done).toBe(true)
  })

  it("respects speed and restart", () => {
    let count = 0
    const timeline = new Timeline<number>({ speed: 10, apply: () => count++, onReset: () => (count = 0) })
    timeline.append({ time: 0, value: 0 })
    timeline.append({ time: 5, value: 1 })
    timeline.update(1) // clock advances by 10 → both events
    expect(count).toBe(2)
    timeline.restart()
    expect(count).toBe(0)
  })
})

describe("snapshot hashing", () => {
  it("is independent of object key order", () => {
    expect(serializeState({ b: 1, a: 2 })).toBe(serializeState({ a: 2, b: 1 }))
    expect(hashState({ b: 1, a: 2 })).toBe(hashState({ a: 2, b: 1 }))
  })

  it("differs when state differs", () => {
    expect(hashState({ x: 1 })).not.toBe(hashState({ x: 2 }))
  })

  it("round-trips through save/load", () => {
    const state = { score: 10, items: ["a", "b"], nested: { flag: true } }
    const restored = loadState(saveState(state))
    expect(restored).toEqual(state)
  })
})
