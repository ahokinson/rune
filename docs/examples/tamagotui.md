# tamagotui

A virtual-pet life-sim in a DMG-LCD look. An egg hatches into a pet that wanders, seeks food/toy/bed by need, sleeps through the night, poops, gets sick, and evolves through life stages — down a good or bad branch decided once at the teen transition by how well you cared for it. Stats decay in real time and a full life plays out across a couple of hours.

## Run it

```sh
# From the repo root:
bun run example:tamagotui

# Or from the example directory:
cd examples/tamagotui
bun run dev
```

## What it showcases

Pixel sprites and AI. All art is authored in code with [`PixelSprite.fromString`](../api/Class.PixelSprite.md) + `setPixel` (no image assets): `scene/sprites.ts` stamps a mood face and shuffled feet onto each body silhouette per frame, packs them into [`AnimationClip`](../api/Interface.AnimationClip.md)s, and plays them through an [`AnimatedSprite`](../api/Class.AnimatedSprite.md). The pet's behaviour is a [`StateMachine`](../api/Class.StateMachine.md) (`wander`/`seekFood`/`seekToy`/`goSleep`/`alert`/`dead`): `decide()` picks the state that fits the current stats each frame, each state's `onUpdate` steers `offsetCells` toward a target X, and the machine no-ops a transition to the current state (`scene/Pet.ts`). Mood particles — hearts, zzz, stink, sweat, sparkles — are five [`Particles`](../api/Class.Particles.md) emitters parented to the pet, toggled by `setMood` and burst on care/evolve events (`scene/fx.ts`).

The loop and the synth. [`useFixedUpdate`](../api/Function.useFixedUpdate.md) reads all gameplay input (menu navigation, reset, the minigame's confirm) — the canonical place for `wasPressed`, where each press lands on exactly one tick. [`useUpdate`](../api/Function.useUpdate.md) runs the continuous sim: stat decay, the compressed day/night clock, evolution, poop/sickness/death. Beeps are synthesised at runtime with the engine's software synth — [`renderSequence`](../api/Function.renderSequence.md) renders a list of [`ToneOptions`](../api/Interface.ToneOptions.md) (square-wave arpeggios with percussive envelopes), [`encodeWav`](../api/Function.encodeWav.md) wraps them, and [`SystemAudioContext.loadBuffer`](../api/Class.SystemAudioContext.md) registers each from memory — so no `.wav` files ship (`sounds.ts`). Evolution and the day/night palette live in `scene/state.ts` + `scene/sky.ts`: `decideBranch` picks the good/bad line at the teen transition, `lifeStageFor` resolves the stage, and `isNightPhase` drives both the pet's sleep and the inverted palette.

Post-FX and reveals. The LCD look is a soft corner vignette applied as an opentui renderer post-process pass (`scene/LcdPostFx.tsx`) — it deliberately uses `@opentui/core`'s `VignetteEffect` through `useRenderer().addPostProcessFn` rather than the engine's [`PostProcessPipeline`](../api/Class.PostProcessPipeline.md), because the vignette must ride on top of the whole composited frame, not a per-entity canvas. The evolution moment (`scene/EvolveReveal.ts`) is a short three-layer reveal — a screen flash, sine-shifted tear bands, and a two-tone ASCII-font banner with a shimmer sweep — built on the shared `drawBigText`/`measureBigText` overlay widgets.

| Engine feature | Where in the example |
| --- | --- |
| [`PixelSprite`](../api/Class.PixelSprite.md) / [`AnimatedSprite`](../api/Class.AnimatedSprite.md) / [`AnimationClip`](../api/Interface.AnimationClip.md) | `scene/sprites.ts` — `PixelSprite.fromString` + `setPixel` authoring, clip packing, `drawPixelSprite` rendering. |
| [`StateMachine`](../api/Class.StateMachine.md) | `scene/Pet.ts` — the `wander`/`seekFood`/`seekToy`/`goSleep`/`alert`/`dead` autonomous AI. |
| [`Particles`](../api/Class.Particles.md) | `scene/fx.ts` — `MoodFx`: hearts/zzz/stink/sweat/sparkles parented to the pet. |
| [`renderSequence`](../api/Function.renderSequence.md) / [`encodeWav`](../api/Function.encodeWav.md) / [`Waveform`](../api/Enumeration.Waveform.md) | `sounds.ts` — runtime square-wave synth, no audio assets. |
| [`SystemAudioContext`](../api/Class.SystemAudioContext.md) / [`AudioContext`](../api/Interface.AudioContext.md) | `App.tsx` + `sounds.ts` — `loadBuffer` registers synthesised wavs; `audio.play` for each blip. |
| [`useFixedUpdate`](../api/Function.useFixedUpdate.md) / [`useUpdate`](../api/Function.useUpdate.md) | `scene/World.tsx` — input on the fixed step; stat decay/clock/evolution on the frame step. |
| [`Random`](../api/Class.Random.md) | `scene/Pet.ts` + `scene/Background.ts` — wander targets and star field. |
| [`Entity2D`](../api/Class.Entity2D.md) | `scene/Pet.ts`, `scene/Background.ts`, `scene/Hud.ts`, `scene/EvolveReveal.ts`, `scene/Minigame.ts` — the entity everything builds on. |

## Key files

| File | What it demonstrates |
| --- | --- |
| `App.tsx` | Bootstrap + the `LcdPostFx` mounted above the canvas. |
| `scene/World.tsx` | The sim: input in the fixed step, stat decay/evolution/death in `useUpdate`, action handling, poop/sickness. |
| `scene/Pet.ts` | The state-machine behaviour, sprite rebuild on evolve, mood-driven clip selection. |
| `scene/sprites.ts` | Pixel-art authoring — body silhouettes, mood faces, feet, `AnimationClip` packing. |
| `scene/fx.ts` | `MoodFx` — the five mood particle emitters and their toggle/burst API. |
| `scene/EvolveReveal.ts` | The evolution reveal: flash + tear bands + shimmering ASCII banner. |
| `scene/LcdPostFx.tsx` | The LCD vignette as an opentui renderer post-process pass. |
| `sounds.ts` | `renderSequence` + `encodeWav` + `loadBuffer` runtime synth. |

## See also

- [Application & loop](../concepts/application-and-loop.md) — the fixed step vs. the frame step, and where `wasPressed` belongs.
- [Audio](../concepts/audio.md) — the software synth, the mixer, `AudioContext` backends.
- [ai](../modules/ai.md) — state machines and steering.
