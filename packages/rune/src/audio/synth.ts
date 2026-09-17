/**
 * A tiny software synth: render short tones to PCM sample buffers and encode them
 * as WAV bytes, so a game can generate its blips, chimes and zaps at runtime
 * instead of shipping (and hand-authoring) .wav asset files. Pair with
 * {@link SystemAudioContext.loadBuffer} to play a generated sound without ever
 * touching disk. Waveforms are the classic chiptune set; an ADSR envelope shapes
 * the amplitude so notes don't click on/off.
 *
 * @module
 */

/** Classic chiptune waveforms plus a uniform white-noise option. */
export enum Waveform {
  /** Pure sine — smooth, flute-like. */
  Sine = "sine",
  /** Hard-clipped square — buzzy, NES lead. */
  Square = "square",
  /** Sawtooth — bright, brassy. */
  Sawtooth = "sawtooth",
  /** Triangle — softer than square, mellower than sine. */
  Triangle = "triangle",
  /** Uniform white noise — for percussion, wind, explosions. */
  Noise = "noise",
}

/**
 * Attack/Decay/Sustain/Release envelope, all times in seconds except `sustain`
 * which is the held amplitude (0–1). Defaults give a quick percussive blip.
 */
export interface Envelope {
  /** Attack time (rise from 0 to peak) in seconds. */
  attack?: number
  /** Decay time (fall from peak to sustain) in seconds. */
  decay?: number
  /** Sustained amplitude 0–1 held after decay. */
  sustain?: number
  /** Release time (fall from sustain to 0) in seconds. */
  release?: number
}

/** Options describing one tone to render. */
export interface ToneOptions {
  /** Waveform (default {@link Waveform.Square}). */
  waveform?: Waveform
  /** Frequency in Hz. */
  frequency: number
  /** Duration in seconds. */
  durationSeconds: number
  /** Peak amplitude, 0–1. */
  volume?: number
  /** Sample rate (default {@link DEFAULT_SAMPLE_RATE}). */
  sampleRate?: number
  /** Amplitude envelope (default quick percussive blip). */
  envelope?: Envelope
}

/** Default sample rate: 44.1 kHz CD audio. */
export const DEFAULT_SAMPLE_RATE = 44100

function waveSample(waveform: Waveform, phase: number, noise: () => number): number {
  // `phase` is in turns (0–1).
  switch (waveform) {
    case Waveform.Sine:
      return Math.sin(phase * Math.PI * 2)
    case Waveform.Square:
      return phase % 1 < 0.5 ? 1 : -1
    case Waveform.Sawtooth:
      return 2 * (phase % 1) - 1
    case Waveform.Triangle:
      return 4 * Math.abs((phase % 1) - 0.5) - 1
    default:
      return noise()
  }
}

// Evaluate the ADSR envelope at time `t` (seconds) for a note of `duration`.
function envelopeAt(envelope: Envelope, t: number, duration: number): number {
  const attack = envelope.attack ?? 0.005
  const decay = envelope.decay ?? 0.04
  const sustain = envelope.sustain ?? 0.6
  const release = envelope.release ?? 0.05
  const releaseStart = Math.max(0, duration - release)
  if (t < attack) return attack === 0 ? 1 : t / attack
  if (t < attack + decay) return decay === 0 ? sustain : 1 - (1 - sustain) * ((t - attack) / decay)
  if (t < releaseStart) return sustain
  return release === 0 ? 0 : sustain * Math.max(0, 1 - (t - releaseStart) / release)
}

/**
 * Render one tone to mono float samples in [-1, 1].
 *
 * @param options - Tone description.
 * @returns Monaural float sample buffer.
 */
export function renderTone(options: ToneOptions): Float32Array {
  const waveform = options.waveform ?? Waveform.Square
  const sampleRate = options.sampleRate ?? DEFAULT_SAMPLE_RATE
  const volume = options.volume ?? 0.25
  const envelope = options.envelope ?? {}
  const count = Math.max(0, Math.round(options.durationSeconds * sampleRate))
  const samples = new Float32Array(count)
  // Deterministic noise so a generated sound is identical between runs.
  let noiseState = 0x9e3779b9
  const noise = (): number => {
    noiseState = Math.imul(noiseState ^ (noiseState >>> 15), 0x2c1b3c6d) >>> 0 || 1
    return (noiseState / 0xffffffff) * 2 - 1
  }
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate
    const phase = options.frequency * t
    const amplitude = envelopeAt(envelope, t, options.durationSeconds) * volume
    samples[i] = waveSample(waveform, phase, noise) * amplitude
  }
  return samples
}

/**
 * Render a melody (notes played back-to-back) to one mono buffer.
 *
 * @param notes - Tones to concatenate.
 * @returns Monaural float sample buffer of the whole sequence.
 */
export function renderSequence(notes: ToneOptions[]): Float32Array {
  const buffers = notes.map(renderTone)
  const total = buffers.reduce((sum, buffer) => sum + buffer.length, 0)
  const out = new Float32Array(total)
  let offset = 0
  for (const buffer of buffers) {
    out.set(buffer, offset)
    offset += buffer.length
  }
  return out
}

/**
 * Encode mono or interleaved-stereo float samples as a 16-bit PCM WAV byte buffer.
 *
 * @param samples - Float samples in [-1, 1]; stereo assumed interleaved L,R,L,R,…
 * @param sampleRate - Samples per second (default {@link DEFAULT_SAMPLE_RATE}).
 * @param channels - 1 for mono, 2 for interleaved stereo (default 1).
 * @returns WAV file bytes ready to write or play.
 */
export function encodeWav(samples: Float32Array, sampleRate = DEFAULT_SAMPLE_RATE, channels = 1): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2)
  const view = new DataView(bytes.buffer)
  const writeString = (at: number, text: string): void => {
    for (let i = 0; i < text.length; i++) view.setUint8(at + i, text.charCodeAt(i))
  }
  const byteRate = sampleRate * channels * 2
  writeString(0, "RIFF")
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true) // PCM chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, channels * 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, "data")
  view.setUint32(40, samples.length * 2, true)
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]!))
    view.setInt16(44 + i * 2, clamped * 0x7fff, true)
  }
  return bytes
}

/**
 * Render a tone straight to WAV bytes — the one-liner for "make me a beep".
 *
 * @param options - Tone description.
 * @returns WAV file bytes.
 */
export function synthTone(options: ToneOptions): Uint8Array {
  return encodeWav(renderTone(options), options.sampleRate ?? DEFAULT_SAMPLE_RATE)
}
