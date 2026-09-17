# Audio

Rune's audio system has three layers: an [`AudioContext`](../api/Interface.AudioContext.md) abstraction for playback, a software synth for generating tones, and an offline [`Mixer`](../api/Class.Mixer.md) for layering sample buffers. Spatial audio is distance-volume only — terminals can't pan.

## Audio contexts

[`AudioContext`](../api/Interface.AudioContext.md) is the abstraction game code talks to. Three implementations ship:

| Context | What it does |
| --- | --- |
| [`SystemAudioContext`](../api/Class.SystemAudioContext.md) | Plays sounds by spawning the platform's audio player (`afplay` on macOS, `aplay`/`pw-play` on Linux) per sound. Load buffers with `audio.loadBuffer(name, wavBytes)` or files with `audio.load(name, path)`, then `audio.play(name)`. |
| [`AfplayAudioContext`](../api/Class.AfplayAudioContext.md) | macOS-only backend using `afplay` directly. |
| [`NullAudioContext`](../api/Class.NullAudioContext.md) | No-op. The default if you don't pass `audio` to `<Application>`. |

Pass a `SystemAudioContext` to `<Application>` to enable sound:

```tsx
import { Application, SystemAudioContext } from "@ahokinson/rune"

<Application ticksPerSecond={60} audio={new SystemAudioContext()}>
  {/* … */}
</Application>
```

Read it in a component with `useAudio()`:

```tsx
const audio = useAudio()
audio.play("jump")
```

### Loading sounds

```ts
// From a file on disk:
await audio.load("pickup", "assets/sounds/pickup.wav")

// From an in-memory WAV (e.g. synthesized at startup):
const wav = encodeWav(samples, 44100)
audio.loadBuffer("beep", wav)
```

[`encodeWav`](../api/Function.encodeWav.md) wraps a PCM sample buffer in a WAV header — use it with the synth below.

## Software synth

[`synthTone`](../api/Function.synthTone.md) / [`renderTone`](../api/Function.renderTone.md) generate PCM sample buffers for a single tone with an ADSR envelope:

```ts
import { Waveform, renderTone, renderSequence, encodeWav } from "@ahokinson/rune"

// A 0.3s square-wave beep at A4 (440 Hz):
const samples = renderTone({
  frequency: 440,
  duration: 0.3,
  waveform: Waveform.Square,
  envelope: { attack: 0.01, decay: 0.05, sustain: 0.6, release: 0.1 },
  sampleRate: 44100,
})

const wav = encodeWav(samples, 44100)
audio.loadBuffer("beep", wav)
audio.play("beep")
```

[`renderSequence`](../api/Function.renderSequence.md) chains multiple tones (with optional delay between them) into one sample buffer — use it for arpeggios and melodies:

```ts
const samples = renderSequence([
  { frequency: 440, duration: 0.1, waveform: Waveform.Square },
  { frequency: 554, duration: 0.1, waveform: Waveform.Square, delay: 0.02 },
  { frequency: 659, duration: 0.15, waveform: Waveform.Square, delay: 0.02 },
])
audio.loadBuffer("arpeggio", encodeWav(samples, 44100))
```

See `examples/tamagotui/sounds.ts` for a full runtime synth-audio setup (no `.wav` files — all beeps are generated at startup).

### `Waveform`

| Member | Shape |
| --- | --- |
| `Sine` | Pure sine. |
| `Square` | Square wave — buzzy, chiptune. |
| `Sawtooth` | Sawtooth — bright, harsh. |
| `Triangle` | Triangle — soft. |
| `Noise` | White noise — percussion, static. |

## Mixer

[`Mixer`](../api/Class.Mixer.md) is an offline layer-mixing utility. Add sample layers with gains, then mix into one buffer:

```ts
import { Mixer } from "@ahokinson/rune"

const mixer = new Mixer({ sampleRate: 44100 })
mixer.addLayer({ samples: kickSamples, gain: 0.8 })
mixer.addLayer({ samples: snareSamples, gain: 0.4, startSeconds: 0.5 })
const mixed = mixer.mix()
```

Use it to bake layered sounds (e.g. drum kits, ambient beds) at startup.

## Spatial audio

Terminals can't pan, so spatial audio is distance-volume only. [`playSpatial`](../api/Function.playSpatial.md) attenuates a sound by the distance from a listener to a source:

```ts
import { playSpatial, Vector2 } from "@ahokinson/rune"

playSpatial(audio, "explosion", {
  listener: player.position,
  source: explosion.position,
  range: 12,  // beyond this distance, silent
})
```

For the raw gain (without playing), use [`attenuation`](../api/Function.attenuation.md):

```ts
const gain = attenuation(listenerPos, sourcePos, range)  // 0..1
```

## See also

- [`AudioContext` interface](../api/Interface.AudioContext.md)
- [`SystemAudioContext` class](../api/Class.SystemAudioContext.md)
- [`Waveform` enum](../api/Enumeration.Waveform.md)
- [`renderTone` / `renderSequence`](../api/Function.renderTone.md)
- [`Mixer` class](../api/Class.Mixer.md)
- [`playSpatial` function](../api/Function.playSpatial.md)
- [Application & loop](application-and-loop.md) — passing `audio` to `<Application>`.
