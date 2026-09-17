# audio

Playback backends, a software synth, an offline mixer, and distance-based spatial audio. Terminals can't pan, so spatial audio is distance-volume only; otherwise this is a small, terminal-friendly audio stack that plays WAVs by spawning the platform's command-line player.

## Overview

[`AudioContext`](../api/Interface.AudioContext.md) is the abstraction game code talks to — `load`/`loadBuffer` to register sounds, `play` to play them, `stopAll` to silence. Three implementations ship: [`SystemAudioContext`](../api/Class.SystemAudioContext.md) (cross-platform; resolves `afplay`/`aplay`/`pw-play` per OS, loops by re-spawning on exit, and writes runtime-synthesised WAVs to a temp file so generated sounds play like loaded ones), [`AfplayAudioContext`](../api/Class.AfplayAudioContext.md) (macOS preset kept for back-compat), and [`NullAudioContext`](../api/Class.NullAudioContext.md) (no-op; the default if you don't pass `audio` to `<Application>`, and the test double for assertions about what a game "played"). `useAudio()` reads the context from a component.

The software synth generates PCM at startup so a game ships no `.wav` files. [`renderTone`](../api/Function.renderTone.md) renders one tone to mono float samples with an ADSR [`Envelope`](../api/Interface.Envelope.md); [`renderSequence`](../api/Function.renderSequence.md) chains tones (with optional delay) into one buffer for arpeggios/melodies; [`synthTone`](../api/Function.synthTone.md) is the one-liner that returns WAV bytes directly. [`encodeWav`](../api/Function.encodeWav.md) wraps a sample buffer in a 16-bit PCM WAV header. [`Mixer`](../api/Class.Mixer.md) is an offline layer-mixing utility for baking layered sounds (drum kits, ambient beds) at startup. [`playSpatial`](../api/Function.playSpatial.md) folds a distance gain (via [`attenuation`](../api/Function.attenuation.md)) into `play`, skipping playback entirely once a source is out of range.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `context.ts` | [`AudioContext`](../api/Interface.AudioContext.md), [`SystemAudioContext`](../api/Class.SystemAudioContext.md), [`AfplayAudioContext`](../api/Class.AfplayAudioContext.md), [`NullAudioContext`](../api/Class.NullAudioContext.md), [`resolvePlayerCommand`](../api/Function.resolvePlayerCommand.md) | Playback backends + platform resolver. |
| `synth.ts` | [`renderTone`](../api/Function.renderTone.md), [`renderSequence`](../api/Function.renderSequence.md), [`synthTone`](../api/Function.synthTone.md), [`encodeWav`](../api/Function.encodeWav.md), [`Waveform`](../api/Enumeration.Waveform.md) | Software synth + WAV encoder. |
| `mixer.ts` | [`Mixer`](../api/Class.Mixer.md) | Offline layer-mixing utility. |
| `spatial.ts` | [`playSpatial`](../api/Function.playSpatial.md), [`attenuation`](../api/Function.attenuation.md) | Distance-volume spatial playback. |

## Key types

### Playback backends
- [`AudioContext`](../api/Interface.AudioContext.md) — Minimal backend: `load`/`loadBuffer`/`play`/`stopAll`.
- [`SystemAudioContext`](../api/Class.SystemAudioContext.md) — Cross-platform backend spawning the OS audio player per sound.
- [`AfplayAudioContext`](../api/Class.AfplayAudioContext.md) — macOS preset of `SystemAudioContext`.
- [`NullAudioContext`](../api/Class.NullAudioContext.md) — No-op test double (records plays instead of making sound).
- [`AudioSource`](../api/Interface.AudioSource.md) / [`PlayOptions`](../api/Interface.PlayOptions.md) — Handle on a playing sound / per-play options.
- [`resolvePlayerCommand`](../api/Function.resolvePlayerCommand.md) — Pure platform-string resolver for the player argv (unit-testable).

### Software synth
- [`renderTone`](../api/Function.renderTone.md) — Render one tone to mono float samples in `[-1, 1]`.
- [`renderSequence`](../api/Function.renderSequence.md) — Render a melody (notes back-to-back) to one mono buffer.
- [`synthTone`](../api/Function.synthTone.md) — Render a tone straight to WAV bytes.
- [`encodeWav`](../api/Function.encodeWav.md) — Wrap float samples as a 16-bit PCM WAV buffer.
- [`Waveform`](../api/Enumeration.Waveform.md) — `Sine` / `Square` / `Sawtooth` / `Triangle` / `Noise`.
- [`ToneOptions`](../api/Interface.ToneOptions.md) / [`Envelope`](../api/Interface.Envelope.md) — Tone description + ADSR envelope.
- [`DEFAULT_SAMPLE_RATE`](../api/Variable.DEFAULT_SAMPLE_RATE.md) — 44.1 kHz CD audio.

### Mixer
- [`Mixer`](../api/Class.Mixer.md) — Sum [`MixLayer`](../api/Interface.MixLayer.md)s (samples + gain + pan + time offset) into a [`MixResult`](../api/Interface.MixResult.md).

### Spatial
- [`playSpatial`](../api/Function.playSpatial.md) — Play with volume scaled by listener↔source distance; skips when out of range.
- [`attenuation`](../api/Function.attenuation.md) — Linear distance falloff returning a 0–1 gain.
- [`SpatialPoint`](../api/Interface.SpatialPoint.md) / [`SpatialPlayOptions`](../api/Interface.SpatialPlayOptions.md) — `z`-optional world point / `PlayOptions` + listener/source/range.

## Usage

```ts
import { Waveform, encodeWav, renderTone, renderSequence, SystemAudioContext, playSpatial } from "@ahokinson/rune"

const audio = new SystemAudioContext()

// Synth a beep at startup — no .wav file shipped.
const beep = encodeWav(renderTone({
  frequency: 440,
  duration: 0.3,
  waveform: Waveform.Square,
  envelope: { attack: 0.01, decay: 0.05, sustain: 0.6, release: 0.1 },
}))
audio.loadBuffer("beep", beep)
audio.play("beep")

// Spatial: distance-volume only (terminals can't pan).
playSpatial(audio, "explosion", { listener: player.position, source: boom.position, range: 12 })
```

## See also

- [Audio](../concepts/audio.md) — backends, the synth, the mixer, spatial audio, passing `audio` to `<Application>`.
- [Application & loop](../concepts/application-and-loop.md) — `useAudio()`.
