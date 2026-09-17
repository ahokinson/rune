import { DEFAULT_SAMPLE_RATE, encodeWav } from "./synth"

/**
 * An offline mixer: layer several sample buffers (synth tones, loaded samples)
 * at independent gains, stereo pans and time offsets into a single buffer, then
 * encode it to WAV. Use it to build a composite sound effect (a layered explosion:
 * boom + crackle + tail) or a short stinger, all generated at runtime. This is a
 * render-to-buffer mixer, not a live output bus — terminal playback spawns a
 * system player per sound (see {@link SystemAudioContext}), so mixing happens up
 * front.
 *
 * @module
 */

/** One layer in a mix: a sample buffer plus gain, pan and time offset. */
export interface MixLayer {
  /** Sample buffer to mix in. */
  samples: Float32Array
  /** Linear gain applied to this layer (default 1). */
  gain?: number
  /** Stereo pan, −1 (left) … 0 (centre) … 1 (right). Non-zero on any layer makes the mix stereo. Default 0. */
  pan?: number
  /** Start offset in samples, for layering sounds in time. Default 0. */
  offsetSamples?: number
}

/** Output of {@link Mixer.render}: interleaved samples and the channel count. */
export interface MixResult {
  /** Interleaved sample buffer (mono or L,R,L,R,…). */
  samples: Float32Array
  /** 1 for mono, 2 for stereo. */
  channels: 1 | 2
}

/** Offline mixer that sums {@link MixLayer}s into a single buffer. */
export class Mixer {
  private readonly layers: MixLayer[] = []

  /**
   * @param sampleRate - Samples per second; must match the layers (default 44100).
   */
  constructor(readonly sampleRate = DEFAULT_SAMPLE_RATE) {}

  /**
   * Append a layer.
   *
   * @param layer - The layer to add.
   * @returns `this` for chaining.
   */
  add(layer: MixLayer): this {
    this.layers.push(layer)
    return this
  }

  /**
   * Add a layer offset to begin `seconds` into the mix.
   *
   * @param samples - Sample buffer to mix in.
   * @param seconds - Time offset into the mix.
   * @param gain - Linear gain (default 1).
   * @param pan - Stereo pan, −1 … 1 (default 0).
   * @returns `this` for chaining.
   */
  addAt(samples: Float32Array, seconds: number, gain = 1, pan = 0): this {
    return this.add({ samples, gain, pan, offsetSamples: Math.round(seconds * this.sampleRate) })
  }

  /**
   * Sum the layers. Output is stereo if any layer is panned, else mono. Samples
   * are summed (not averaged) and left unclamped here; `encodeWav` clamps on write.
   *
   * @returns The mixed buffer and channel count.
   */
  render(): MixResult {
    const stereo = this.layers.some((layer) => (layer.pan ?? 0) !== 0)
    let frames = 0
    for (const layer of this.layers) frames = Math.max(frames, (layer.offsetSamples ?? 0) + layer.samples.length)
    const channels: 1 | 2 = stereo ? 2 : 1
    const out = new Float32Array(frames * channels)
    for (const layer of this.layers) {
      const gain = layer.gain ?? 1
      const offset = layer.offsetSamples ?? 0
      if (!stereo) {
        for (let i = 0; i < layer.samples.length; i++) out[offset + i]! += layer.samples[i]! * gain
        continue
      }
      // Equal-power-ish linear pan: left/right weights from the pan position.
      const pan = layer.pan ?? 0
      const leftGain = gain * (1 - Math.max(0, pan))
      const rightGain = gain * (1 + Math.min(0, pan))
      for (let i = 0; i < layer.samples.length; i++) {
        const frame = (offset + i) * 2
        out[frame]! += layer.samples[i]! * leftGain
        out[frame + 1]! += layer.samples[i]! * rightGain
      }
    }
    return { samples: out, channels }
  }

  /**
   * Render the mix straight to WAV bytes.
   *
   * @returns 16-bit PCM WAV byte buffer.
   */
  toWav(): Uint8Array {
    const { samples, channels } = this.render()
    return encodeWav(samples, this.sampleRate, channels)
  }
}
