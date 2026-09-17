# core

The engine's plumbing: the fixed-timestep loop accumulator, the scheduler, the event emitter, timers/cooldowns, and the object pools that keep churn-heavy allocations out of the hot path. `<Application>` wires these together; you usually reach for them through hooks (`useFixedUpdate`, `useTimer`, `useEvents`) rather than directly.

## Overview

[`loop.ts`](../api/Function.advanceLoop.md) is the heart of determinism: [`advanceLoop`](../api/Function.advanceLoop.md) drains wall-clock delta into fixed `stepMilliseconds` ticks, invoking `onTick` per substep and capping the accumulator to prevent the spiral of death. This is what decouples render rate from simulation rate and what makes replays reproducible. [`Scheduler`](../api/Class.Scheduler.md) is a timer registry advanced by an external time source — `after`/`every` schedule timers, `advance(delta)` fires due ones; pause-safe because nothing fires while `advance` isn't called. [`EventEmitter`](../api/Class.EventEmitter.md) is a type-safe pub/sub keyed by an event map, with O(1) add/remove/emit and listener snapshotting so a listener may safely remove itself mid-dispatch.

The allocation-conscious utilities exist because terminal games spawn a lot of short-lived objects. [`ObjectPool`](../api/Class.ObjectPool.md) recycles instances through `acquire`/`release` (with an optional `reset` hook); [`PooledSet`](../api/Class.PooledSet.md) is a pool-backed live set with a fast spawn/expire lifecycle using swap-pop removals. [`Cooldown`](../api/Class.Cooldown.md) gates an action to at most once per duration. [`RateCounter`](../api/Class.RateCounter.md) counts events over a trailing window (unit-agnostic), and [`FramesPerSecondCounter`](../api/Class.FramesPerSecondCounter.md) is the rolling FPS counter the application exposes via `app.framesPerSecond()`.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `loop.ts` | [`advanceLoop`](../api/Function.advanceLoop.md), [`createLoopState`](../api/Function.createLoopState.md), [`LoopState`](../api/Interface.LoopState.md) | Fixed-timestep accumulator. |
| `scheduler.ts` | [`Scheduler`](../api/Class.Scheduler.md), [`TimerId`](../api/TypeAlias.TimerId.md) | Timer registry advanced by an external clock. |
| `events.ts` | [`EventEmitter`](../api/Class.EventEmitter.md), [`EventListener`](../api/TypeAlias.EventListener.md) | Type-safe pub/sub emitter. |
| `cooldown.ts` | [`Cooldown`](../api/Class.Cooldown.md) | Per-duration action gate. |
| `objectPool.ts` | [`ObjectPool`](../api/Class.ObjectPool.md), [`ObjectPoolOptions`](../api/Interface.ObjectPoolOptions.md) | Reusable object pool. |
| `pooledSet.ts` | [`PooledSet`](../api/Class.PooledSet.md), [`PooledSetOptions`](../api/Interface.PooledSetOptions.md) | Pool-backed live set with spawn/expire. |
| `rateCounter.ts` | [`RateCounter`](../api/Class.RateCounter.md) | Trailing-window event counter. |
| `time.ts` | [`FramesPerSecondCounter`](../api/Class.FramesPerSecondCounter.md) | Rolling FPS counter. |

## Key types

### Classes
- [`Scheduler`](../api/Class.Scheduler.md) — One-shot (`after`) and repeating (`every`) timers; advanced by `advance(delta)`.
- [`EventEmitter`](../api/Class.EventEmitter.md) — Type-safe pub/sub keyed by an event map; listeners snapshotted before dispatch.
- [`Cooldown`](../api/Class.Cooldown.md) — `tick(delta)` each frame, then probe `isReady` / call `fire` when the gated action occurs.
- [`ObjectPool`](../api/Class.ObjectPool.md) — `acquire` returns a recycled instance or creates one; `release` returns it after the optional `reset` hook.
- [`PooledSet`](../api/Class.PooledSet.md) — Pool-backed live set; `expire` uses swap-pop so removals stay O(1).
- [`RateCounter`](../api/Class.RateCounter.md) — Counts events within a trailing `window` of a monotonic clock value.
- [`FramesPerSecondCounter`](../api/Class.FramesPerSecondCounter.md) — Rolling FPS counter; publishes a fresh value after ≥ 250 ms of accumulated time.

### Functions
- [`advanceLoop`](../api/Function.advanceLoop.md) — Drain wall-clock delta into fixed ticks (capped substeps); `onTick` per substep.
- [`createLoopState`](../api/Function.createLoopState.md) — Fresh `LoopState` with a zeroed accumulator and tick.

### Types & interfaces
- [`LoopState`](../api/Interface.LoopState.md) — `accumulator` + `tick` carried between frames.
- [`TimerId`](../api/TypeAlias.TimerId.md) — Opaque handle returned by `Scheduler.after`/`every`.
- [`EventListener`](../api/TypeAlias.EventListener.md) — Listener function for a payload `TPayload`.
- [`ObjectPoolOptions`](../api/Interface.ObjectPoolOptions.md) / [`PooledSetOptions`](../api/Interface.PooledSetOptions.md) — Pool construction options (factory, reset hook, capacity).

## Usage

```ts
import { Cooldown, EventEmitter, ObjectPool, Scheduler } from "@ahokinson/rune"

const scheduler = new Scheduler()
const id = scheduler.every(1000, () => console.log("tick"))
// each frame: scheduler.advance(deltaMilliseconds)

const bus = new EventEmitter<{ hit: { target: string } }>()
bus.on("hit", ({ target }) => console.log("hit", target))
bus.emit("hit", { target: "goomba" })

const fireCooldown = new Cooldown(0.25) // seconds
// each frame: fireCooldown.tick(deltaSeconds)
if (fireCooldown.isReady() && controls.wasPressed("fire")) {
  spawnBullet()
  fireCooldown.fire()
}

const bullets = new ObjectPool<Bullet>({
  create: () => new Bullet(),
  reset: (b) => b.reset(),
  capacity: 64,
})
const b = bullets.acquire()
// …later: bullets.release(b)
```

## See also

- [Application & loop](../concepts/application-and-loop.md) — how `<Application>` drives the loop, scheduler, and tweens; the `useFixedUpdate` / `useUpdate` / `useTimer` / `useEvents` hooks.
- [fx](fx.md) — [`Emitter`](../api/Class.Emitter.md) and [`Particles`](../api/Class.Particles.md) build on [`ObjectPool`](../api/Class.ObjectPool.md) / [`PooledSet`](../api/Class.PooledSet.md).
- [replay](replay.md) — determinism depends on the fixed-step loop.
