# Application & loop

`<Application>` is the root of every rune game. It owns the renderer, the fixed-step loop, input state, the scene stack, the scheduler, the tween manager, and the audio context. This page covers how it's configured, what the loop does, and how to read input and drive the simulation.

## `<Application>`

```tsx
import { Application } from "@ahokinson/rune"
import { SystemAudioContext } from "@ahokinson/rune"

export function App() {
  return (
    <Application
      ticksPerSecond={60}
      maximumSubSteps={5}
      randomSeed={12345}
      audio={new SystemAudioContext()}
    >
      <FullscreenCanvas>{/* … */}</FullscreenCanvas>
    </Application>
  )
}
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ticksPerSecond?` | `number` | `30` | Fixed-update rate in Hz. |
| `maximumSubSteps?` | `number` | `5` | Max substeps per frame to catch up. Prevents a spiral of death after a stall. |
| `randomSeed?` | `number` | `Date.now()` | Seed for the shared deterministic [`Random`](../api/Class.Random.md). |
| `audio?` | [`AudioContext`](../api/Interface.AudioContext.md) | `new NullAudioContext()` | Audio backend. Use [`SystemAudioContext`](../api/Class.SystemAudioContext.md) for real playback, [`NullAudioContext`](../api/Class.NullAudioContext.md) for silence. |
| `children?` | `JSX.Element` | — | Subtree running inside the context provider. |

### What it owns

On mount, `<Application>` starts the OpenTUI renderer, registers a per-frame callback, and constructs:

- A fixed-step [`LoopState`](../api/Interface.LoopState.md) accumulator.
- An [`EventEmitter<ApplicationEventMap>`](../api/Class.EventEmitter.md) for app-level events.
- [`KeyboardState`](../api/Class.KeyboardState.md), [`MouseState`](../api/Class.MouseState.md), and [`GamepadState`](../api/Class.GamepadState.md) with dual edge buffers (the gamepad is polled each frame via [`pollWebGamepads`](../api/Function.pollWebGamepads.md), a no-op where no controller API exists).
- A [`SceneManager`](../api/Class.SceneManager.md) stack.
- A [`Scheduler`](../api/Class.Scheduler.md) for timers.
- A [`TweenManager`](../api/Class.TweenManager.md).
- A [`Random`](../api/Class.Random.md) seeded from `randomSeed`.
- The `AudioContext` you passed in.
- A [`FramesPerSecondCounter`](../api/Class.FramesPerSecondCounter.md).

If `RUNE_INSPECT_SOCKET` is set (and `RUNE_COMPILED` is not `"1"`), it also dynamically imports and starts an [`InspectionServer`](../api/Class.InspectionServer.md) on that socket.

On cleanup, it stops the renderer, tears down the inspection server, clears the scheduler and tweens, and drops the renderer's live reference.

### Lifecycle

- **Escape** triggers `shutdown()`, which destroys the renderer and, if `RUNE_DEV` or `RUNE_COMPILED` is `"1"`, exits the process. In tests (where neither is set) the process stays alive.
- `handle.quit()` does the same — call it from a pause menu or a quit key.

## `ApplicationHandle`

The context value, accessed via `useApplication()`:

```tsx
const app = useApplication()
app.tick()              // current fixed tick (Accessor<number>)
app.framesPerSecond()   // measured FPS (Accessor<number>)
app.paused()            // whether the sim is paused (Accessor<boolean>)
app.random              // the shared Random
app.scenes              // the SceneManager
app.events              // the app EventEmitter
app.keyboard            // the KeyboardState
app.mouse               // the MouseState
app.gamepad             // the GamepadState (host-fed; safe to read unconditionally)
app.scheduler           // the Scheduler
app.tweens              // the TweenManager
app.audio               // the AudioContext
app.renderAlpha()       // 0..1 — how far between ticks the current frame is
app.pause()
app.resume()
app.quit()
```

See the [`ApplicationHandle` interface](../api/Interface.ApplicationHandle.md) for the full surface.

### `renderAlpha()`

> How far the render frame is between the most recent fixed-update tick (0) and the next one (1). Read this during draw to interpolate between snapshotted and current positions for smooth motion at frame rates higher than the fixed-tick rate.

If your fixed tick runs at 30 Hz but the terminal renders at 60 FPS, each render frame is halfway between two ticks. `renderAlpha()` gives you `0.5` — use it to lerp between the previous and current positions when drawing:

```ts
override draw(canvas: CanvasSurface, camera: Camera): void {
  const alpha = useApplication().renderAlpha()
  const x = lerp(this.prevX, this.position.x, alpha)
  // …draw at x…
}
```

[`Entity2D`](../api/Class.Entity2D.md) already interpolates its transform for you; this is mainly for custom draw code.

## The loop

Each rendered frame, in order:

1. **Input decay** — `keyboard.decayHeld()` refreshes auto-repeat held keys.
2. **Time bookkeeping** — the wall-clock delta is recorded for FPS; `tweens.advance(delta)` and `scheduler.advance(delta)` run on real time.
3. **Fixed pass** (skipped if paused) — the accumulator drains in substeps (capped at `maximumSubSteps`):
   - Input phase → `Fixed`.
   - Tick counter increments; `activeScene.update(stepDelta)` runs; all `fixedUpdateCallbacks` fire; `"tick"` is emitted.
   - **After the first substep only**, fixed input edges are committed — so a single press fires on exactly one tick even when a frame runs several substeps.
4. **Frame pass** — input phase → `Frame`; all `updateCallbacks` fire; frame edges are committed.

### Fixed update vs. frame update

| | Fixed step | Frame update |
| --- | --- | --- |
| **Runs at** | `ticksPerSecond` Hz (deterministic) | Render rate (variable) |
| **Use for** | Gameplay, physics, input (`wasPressed`/`isDown`), simulation | Camera smoothing, interpolation, visual effects |
| **Register with** | `useFixedUpdate(cb)` or entity `update(deltaMilliseconds)` | `useUpdate(cb)` |
| **Replayable?** | Yes — this is what [`replay/`](../modules/replay.md) captures | No |

Rule of thumb: if it mutates game state, it belongs on the fixed step; if it only affects how the current frame looks, it belongs in `useUpdate`.

```tsx
useFixedUpdate((deltaMilliseconds, tick) => {
  // gameplay: read input, move, resolve collisions
  if (controls.wasPressed("jump")) player.jump()
  player.step(deltaMilliseconds)
})

useUpdate((deltaMilliseconds) => {
  // visuals: smooth the camera toward the player
  camera.position.lerp(player.position, 0.1)
})
```

## Events

The application event bus (`app.events`) emits:

| Event | Payload | When |
| --- | --- | --- |
| `"tick"` | `{ tick, deltaMilliseconds }` | Every fixed substep. |
| `"scene:enter"` | `{ scene }` | A `<Scene>` mounts. |
| `"scene:exit"` | `{ scene }` | A `<Scene>` unmounts. |
| `"resize"` | `{ width, height }` | The terminal resizes. |

Use `useEvents()` to subscribe with automatic unmount cleanup:

```tsx
const bus = useEvents()
bus.on("tick", ({ tick }) => console.log("tick", tick))
```

## Pause and quit

- `app.pause()` stops the fixed pass (the simulation freezes); the frame pass continues so the screen still updates. Useful for a pause menu.
- `app.resume()` restarts the fixed pass.
- `app.quit()` destroys the renderer and (in standalone `rune dev` / `rune build` runs) exits the process.

`<DebugOverlay>` shows a `PAUSED` indicator when `app.paused()` is true.

## See also

- [`Application` component](../api/Function.Application.md)
- [`ApplicationHandle` interface](../api/Interface.ApplicationHandle.md)
- [Canvas & rendering](canvas-and-rendering.md)
- [Input](input.md)
- [`core/loop`](../modules/core.md) — the accumulator implementation.
