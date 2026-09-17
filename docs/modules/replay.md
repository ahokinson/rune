# replay

Input record/playback, a clock-driven timeline, and stable state serialisation/hashing — the determinism and replay infrastructure. Because the [core](core.md) loop is fixed-step and [`Random`](../api/Class.Random.md) is seedable, recording the input stream plus the seed is enough to reproduce a run exactly.

## Overview

[`InputRecorder`](../api/Class.InputRecorder.md) collects one input frame per fixed tick into a [`Recording`](../api/Interface.Recording.md) — the input stream plus the seed needed to replay it. [`InputPlayback`](../api/Class.InputPlayback.md) is the frame-by-frame player that feeds that stream back to the input system, one tick at a time, so the same inputs against the same seed reproduce the same gameplay. Both are generic over the input shape so they're independent of the [`KeyboardState`](../api/Class.KeyboardState.md) / [`MouseState`](../api/Class.MouseState.md) representation.

For scripted sequences unrelated to input, [`Timeline`](../api/Class.Timeline.md) is a clock-driven player over a list of [`TimelineEvent`](../api/Interface.TimelineEvent.md)s — each fires its callback at its timestamp, advanced by `Timeline.advance(time)`.

State persistence is [`snapshot.ts`](../api/Function.serializeState.md): [`serializeState`](../api/Function.serializeState.md) produces **stable** JSON (identical for two structurally equal values regardless of key insertion order, throwing on cycles) — the save format. [`saveState`](../api/Function.saveState.md) / [`loadState`](../api/Function.loadState.md) encode and decode that snapshot. [`hashState`](../api/Function.hashState.md) is an FNV-1a 32-bit hash of the stable serialisation — a compact fingerprint for cheap equality checks in determinism tests. All operate on [`Serializable`](../api/TypeAlias.Serializable.md) (a JSON-like plain-data type).

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `record.ts` | [`InputRecorder`](../api/Class.InputRecorder.md), [`Recording`](../api/Interface.Recording.md) | Collect one input frame per fixed tick. |
| `playback.ts` | [`InputPlayback`](../api/Class.InputPlayback.md) | Frame-by-frame player for a recording. |
| `timeline.ts` | [`Timeline`](../api/Class.Timeline.md), [`TimelineEvent`](../api/Interface.TimelineEvent.md), [`TimelineOptions`](../api/Interface.TimelineOptions.md) | Clock-driven scripted event player. |
| `snapshot.ts` | [`serializeState`](../api/Function.serializeState.md), [`hashState`](../api/Function.hashState.md), [`saveState`](../api/Function.saveState.md), [`loadState`](../api/Function.loadState.md), [`Serializable`](../api/TypeAlias.Serializable.md) | Stable serialisation + hashing. |

## Key types

### Classes
- [`InputRecorder`](../api/Class.InputRecorder.md) — Collects one input frame per fixed tick into a [`Recording`](../api/Interface.Recording.md).
- [`InputPlayback`](../api/Class.InputPlayback.md) — Replays a recorded input stream one tick at a time.
- [`Timeline`](../api/Class.Timeline.md) — Clock-driven player over timestamped [`TimelineEvent`](../api/Interface.TimelineEvent.md)s.

### Functions
- [`serializeState`](../api/Function.serializeState.md) — Stable JSON serialisation (key-order independent, throws on cycles).
- [`saveState`](../api/Function.saveState.md) / [`loadState`](../api/Function.loadState.md) — Encode / decode a snapshot for persistence.
- [`hashState`](../api/Function.hashState.md) — FNV-1a 32-bit hash of the stable serialisation.

### Types & interfaces
- [`Recording`](../api/Interface.Recording.md) — Serialized input stream plus the seed needed to replay it.
- [`TimelineEvent`](../api/Interface.TimelineEvent.md) / [`TimelineOptions`](../api/Interface.TimelineOptions.md) — A timestamped event / timeline config.
- [`Serializable`](../api/TypeAlias.Serializable.md) — JSON-like plain data accepted by the snapshot helpers.

## Usage

```ts
import { InputRecorder, InputPlayback, serializeState, hashState } from "@ahokinson/rune"

// Record: capture one input frame per fixed tick + the seed.
const recorder = new InputRecorder({ seed: app.random.seed })
useFixedUpdate(() => recorder.record(app.keyboard, app.mouse))

// Replay: feed the recording back one tick at a time.
const playback = new InputPlayback(recorder.recording)
useFixedUpdate(() => playback.advance(app.tick)) // drives input for the current tick

// Determinism check: fingerprint the live state each tick.
const fp = hashState(serializeState(gameState))
if (fp !== expectedFingerprint) throw new Error("desync")
```

## See also

- [core](core.md) — the fixed-step loop that makes replays reproducible.
- [input](input.md) — [`KeyboardState`](../api/Class.KeyboardState.md) / [`MouseState`](../api/Class.MouseState.md) the recorder captures.
- [math](math.md) — [`Random`](../api/Class.Random.md) seed captured in a `Recording`.
- [Application & loop](../concepts/application-and-loop.md) — fixed update vs. frame update.
