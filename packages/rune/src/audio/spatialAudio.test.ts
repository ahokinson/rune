import { describe, expect, it } from "bun:test"
import { NullAudioContext } from "@/audio/context"
import { attenuation, playSpatial } from "@/audio/spatial"

describe("attenuation", () => {
  it("is full at the listener and zero at range", () => {
    expect(attenuation({ x: 0, y: 0 }, { x: 0, y: 0 }, 10)).toBe(1)
    expect(attenuation({ x: 0, y: 0 }, { x: 10, y: 0 }, 10)).toBe(0)
    expect(attenuation({ x: 0, y: 0 }, { x: 5, y: 0 }, 10)).toBeCloseTo(0.5, 5)
  })

  it("uses 3D distance when z is present and clamps past range", () => {
    expect(attenuation({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 3 }, 6)).toBeCloseTo(0.5, 5)
    expect(attenuation({ x: 0, y: 0 }, { x: 100, y: 0 }, 10)).toBe(0)
  })
})

describe("playSpatial", () => {
  it("folds distance gain into the played volume", () => {
    const audio = new NullAudioContext()
    playSpatial(audio, "step", { listener: { x: 0, y: 0 }, source: { x: 5, y: 0 }, range: 10, volume: 0.8 })
    expect(audio.playLog).toHaveLength(1)
    expect(audio.playLog[0]!.options!.volume).toBeCloseTo(0.4, 5)
  })

  it("skips playback when the source is out of range", () => {
    const audio = new NullAudioContext()
    const source = playSpatial(audio, "step", { listener: { x: 0, y: 0 }, source: { x: 20, y: 0 }, range: 10 })
    expect(source).toBeNull()
    expect(audio.playLog).toHaveLength(0)
  })
})
