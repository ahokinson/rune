import { describe, expect, it } from "bun:test"
import { NullAudioContext } from "@/audio/context"

describe("NullAudioContext", () => {
  it("load marks the name as loaded", async () => {
    const audio = new NullAudioContext()
    await audio.load("shot", "/dev/null")
    expect(audio.isLoaded("shot")).toBe(true)
  })

  it("play records the call and returns a stoppable source", () => {
    const audio = new NullAudioContext()
    const source = audio.play("shot", { volume: 0.5 })
    expect(source).not.toBeNull()
    expect(source!.playing).toBe(true)
    source!.stop()
    expect(source!.playing).toBe(false)
    expect(audio.playLog).toEqual([{ name: "shot", options: { volume: 0.5 } }])
  })

  it("stopAll is a no-op", () => {
    const audio = new NullAudioContext()
    audio.play("a")
    audio.play("b")
    audio.stopAll()
    expect(audio.playLog.length).toBe(2)
  })
})
