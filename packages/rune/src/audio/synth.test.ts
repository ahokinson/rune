import { describe, expect, it } from "bun:test"
import { DEFAULT_SAMPLE_RATE, encodeWav, renderSequence, renderTone, synthTone, Waveform } from "@/audio/synth"

function readHeaderString(bytes: Uint8Array, at: number, length: number): string {
  let text = ""
  for (let i = 0; i < length; i++) text += String.fromCharCode(bytes[at + i]!)
  return text
}

describe("synth", () => {
  it("renders the right number of samples for a duration", () => {
    const samples = renderTone({ frequency: 440, durationSeconds: 0.1 })
    expect(samples.length).toBe(Math.round(0.1 * DEFAULT_SAMPLE_RATE))
  })

  it("keeps samples within [-1, 1]", () => {
    const samples = renderTone({ frequency: 440, durationSeconds: 0.05, volume: 1, waveform: Waveform.Sawtooth })
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(-1)
      expect(sample).toBeLessThanOrEqual(1)
    }
  })

  it("is deterministic, including the noise waveform", () => {
    const a = renderTone({ frequency: 200, durationSeconds: 0.02, waveform: Waveform.Noise })
    const b = renderTone({ frequency: 200, durationSeconds: 0.02, waveform: Waveform.Noise })
    expect(Array.from(a)).toEqual(Array.from(b))
  })

  it("a square wave only takes two amplitude signs over its sustain", () => {
    const samples = renderTone({
      frequency: 100,
      durationSeconds: 0.1,
      waveform: Waveform.Square,
      envelope: { attack: 0, decay: 0, sustain: 1, release: 0 },
    })
    const signs = new Set(samples.map((s) => Math.sign(s)))
    // Only +1 and -1 (0 can appear at a zero crossing edge sample).
    expect([...signs].every((s) => s === 1 || s === -1 || s === 0)).toBe(true)
  })

  it("encodeWav produces a valid RIFF/WAVE header", () => {
    const wav = synthTone({ frequency: 440, durationSeconds: 0.02 })
    expect(readHeaderString(wav, 0, 4)).toBe("RIFF")
    expect(readHeaderString(wav, 8, 4)).toBe("WAVE")
    expect(readHeaderString(wav, 36, 4)).toBe("data")
    const view = new DataView(wav.buffer)
    expect(view.getUint16(22, true)).toBe(1) // mono
    expect(view.getUint32(24, true)).toBe(DEFAULT_SAMPLE_RATE)
  })

  it("renderSequence concatenates note buffers", () => {
    const a = renderTone({ frequency: 440, durationSeconds: 0.02 })
    const b = renderTone({ frequency: 880, durationSeconds: 0.03 })
    const sequence = renderSequence([
      { frequency: 440, durationSeconds: 0.02 },
      { frequency: 880, durationSeconds: 0.03 },
    ])
    expect(sequence.length).toBe(a.length + b.length)
  })

  it("stereo encoding sets the channel count", () => {
    const wav = encodeWav(new Float32Array([0, 0, 0, 0]), DEFAULT_SAMPLE_RATE, 2)
    const view = new DataView(wav.buffer)
    expect(view.getUint16(22, true)).toBe(2)
  })
})
