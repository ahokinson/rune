import { describe, expect, it } from "bun:test"
import { Mixer } from "@/audio/mixer"

describe("Mixer", () => {
  it("sums overlapping mono layers", () => {
    const mixer = new Mixer()
    mixer.add({ samples: new Float32Array([0.2, 0.2, 0.2]) })
    mixer.add({ samples: new Float32Array([0.1, 0.1]) })
    const { samples, channels } = mixer.render()
    expect(channels).toBe(1)
    expect(samples[0]).toBeCloseTo(0.3, 6)
    expect(samples[1]).toBeCloseTo(0.3, 6)
    expect(samples[2]).toBeCloseTo(0.2, 6)
  })

  it("applies gain", () => {
    const mixer = new Mixer()
    mixer.add({ samples: new Float32Array([1, 1]), gain: 0.5 })
    expect(mixer.render().samples[0]).toBeCloseTo(0.5, 6)
  })

  it("offsets a layer in time", () => {
    const mixer = new Mixer(1000) // 1000 samples/sec → 1 sample per ms
    mixer.add({ samples: new Float32Array([1]) })
    mixer.addAt(new Float32Array([1]), 0.003) // offset 3 samples
    const { samples } = mixer.render()
    expect(samples.length).toBe(4)
    expect(samples[0]).toBe(1)
    expect(samples[3]).toBe(1)
  })

  it("produces stereo output when a layer is panned", () => {
    const mixer = new Mixer()
    mixer.add({ samples: new Float32Array([1, 1]), pan: -1 }) // hard left
    const { samples, channels } = mixer.render()
    expect(channels).toBe(2)
    // Frame 0: left has signal, right is silent.
    expect(samples[0]).toBeCloseTo(1, 6)
    expect(samples[1]).toBeCloseTo(0, 6)
  })

  it("encodes to a WAV with the right channel count", () => {
    const mixer = new Mixer()
    mixer.add({ samples: new Float32Array([0.5, -0.5]), pan: 0.5 })
    const wav = mixer.toWav()
    const view = new DataView(wav.buffer)
    expect(view.getUint16(22, true)).toBe(2)
  })
})
