# Architecture

This page covers the engine's shape: the package layout, the public API barrel, the Solid component layer, the fixed-timestep loop, the render pipeline, and how inspection is wired in.

## Package layout

```
packages/rune/   the engine
  src/           re-exported from src/index.ts
  cli/           the `rune` CLI (new / add / dev / build)
  templates/     project templates that `rune new` scaffolds from
  test/          bun:test suites (one per module area)
examples/        standalone games that depend on the engine via workspace:*
  shared/        reusable game-level code shared across examples
```

The engine is a single package (`packages/rune`) consumed via `"@ahokinson/rune"`. Games depend on it through the workspace (`workspace:*` inside this repo, a published version range elsewhere). The CLI is a separate binary entry (`packages/rune/cli/index.ts`).

## The public API barrel

Every engine export is re-exported from [`packages/rune/src/index.ts`](api/README.md). Game code imports exclusively from `"@ahokinson/rune"` — never from internal paths.

Two naming collisions are resolved at re-export time:

- The `Canvas` **interface** from `draw/canvas` is re-exported as `CanvasSurface`, so it doesn't shadow the `<Canvas>` Solid **component**.
- The `Scene` **class** from `scene/scene` is re-exported as `SceneInstance`, so it doesn't shadow the `<Scene>` Solid **component**.

If you need the low-level types, import the alias: `import { type CanvasSurface, type SceneInstance } from "@ahokinson/rune"`.

## The Solid layer

The engine exposes a small set of Solid components and hooks that bind the simulation to a component lifetime. They live in the top-level `.tsx` files and `hooks.ts` under `src/`.

### Components

| Component | Purpose |
| --- | --- |
| [`<Application>`](api/Function.Application.md) | Root component. Owns the renderer, the fixed-step loop, input state, scene stack, scheduler, tweens, and audio. Provides `ApplicationContext`. |
| [`<FullscreenCanvas>`](api/Function.FullscreenCanvas.md) | A `<Canvas>` sized to fill the terminal. The canonical entry for a full-screen game. Supports a render-prop form receiving `{ width, height }`. |
| [`<Canvas>`](api/Function.Canvas.md) | Mounts an OpenTUI `FrameBufferRenderable`, wraps it in a `FrameDiffCanvas` that only flushes changed cells, and wires mouse events. Provides `CanvasContext`. |
| [`<Scene>`](api/Function.Scene.md) | Pushes a scene onto the application's scene stack on mount, pops on cleanup. Emits `scene:enter` / `scene:exit`. Provides `SceneContext`. |
| [`<SceneRenderer>`](api/Function.SceneRenderer.md) | Registers a `useUpdate` that clears the canvas and draws the active scene each frame. Renders nothing. |
| [`<SceneSwitch>`](api/Function.SceneSwitch.md) | Renders only the child matching a reactive `active()` key — for title/game/over/win style screen switching. |
| [`<DebugOverlay>`](api/Function.DebugOverlay.md) | Toggleable (default `` ` ``) FPS/TPS/tick/mouse/scene/entity overlay. |

### Hooks

| Hook | Returns | Notes |
| --- | --- | --- |
| `useApplication()` | `ApplicationHandle` | The context value; throws outside `<Application>`. |
| `useScene()` | `Scene` | Throws outside `<Scene>`. |
| `useSceneEntities(factory)` | `Entity2D[]` | Adds the factory's entities to the nearest `<Scene>` on mount, removes them on cleanup. |
| `useEntity(factory)` | `Entity2D` | Single-entity convenience over `useSceneEntities`. |
| `useCanvas()` | `Accessor<Canvas \| null>` | `null` before mount / after cleanup. |
| `useCamera()` | `Camera \| null` | `null` outside a `<Scene>` (does not throw). |
| `useTerminal()` | `Accessor<{ width, height }>` | Reactive terminal dimensions. |
| `useFixedUpdate(cb)` | `void` | Registers a per-tick callback; auto-unregisters on unmount. |
| `useUpdate(cb)` | `void` | Registers a per-frame callback; auto-unregisters on unmount. |
| `useInput()` | `KeyboardSnapshot` | Shortcut to `application.keyboard`. |
| `useAudio()` | `AudioContext` | Shortcut to `application.audio`. |
| `useMouse()` | `MouseSnapshot` | Shortcut to `application.mouse`. |
| `useGamepad()` | `GamepadSnapshot` | Shortcut to `application.gamepad`; `connected` is false until a source pushes a reading. |
| `useActions(bindings)` | `ActionSnapshot` | Resolved action state from key/mouse/gamepad bindings. |
| `useTimer()` | `ScopedTimer` | `after`/`every`/`clear`; auto-cleared on unmount. |
| `useTween(options)` | `Tween` | Registered with the app's `TweenManager`; cancelled on unmount. |
| `useEvents(emitter?)` | `ScopedEventBus` | Wraps the application event bus (or any emitter); auto-unsubscribes on unmount. |

See [the hooks API](modules/core.md) for full signatures.

### `ApplicationHandle`

The context value provided by `<Application>`. It exposes:

- Reactive signals: `tick`, `ticksPerSecond`, `framesPerSecond`, `paused`.
- Subsystems: `random`, `scenes`, `events`, `keyboard`, `mouse`, `gamepad`, `scheduler`, `tweens`, `audio`.
- `renderAlpha()` — how far the render frame is between the most recent fixed tick (0) and the next one (1). Read this during draw to interpolate between snapshotted and current positions for smooth motion at frame rates higher than the fixed-tick rate.
- `registerFixedUpdate(cb)` / `registerUpdate(cb)` — register callbacks; return an unsubscribe function.
- `pause()` / `resume()` / `quit()`.

See the [`ApplicationHandle` interface](api/Interface.ApplicationHandle.md) for the full surface.

## The fixed-timestep loop

The engine decouples the render rate from the simulation rate. `<Application>` owns a fixed-step accumulator ([`core/loop.ts`](api/Function.advanceLoop.md)) that advances the simulation at a fixed cadence (default 30 Hz; configure with `ticksPerSecond`), independent of how fast the terminal renders.

Each rendered frame:

1. **Input decay**: `keyboard.decayHeld()` refreshes auto-repeat held keys.
2. **Time bookkeeping**: the wall-clock delta is recorded for FPS; `tweens` and `scheduler` advance by the real delta.
3. **Fixed pass** (if not paused): the accumulator drains in substeps (capped at `maximumSubSteps`, default 5). Each substep:
   - Sets the input phase to `Fixed`.
   - Advances the tick counter, calls `activeScene.update(stepDelta)`, fires all `fixedUpdateCallbacks`, emits `"tick"`.
   - **After the first substep only**, commits the fixed input edges — so a single press fires on exactly one tick even when a frame runs several substeps (the common case).
4. **Frame pass**: sets the input phase to `Frame`, fires all `updateCallbacks`, commits frame edges.

### Fixed update vs. frame update

Put gameplay and physics on the fixed step (`useFixedUpdate`, or an entity's `update(deltaMilliseconds)` which the scene advances on the fixed tick): it runs at a deterministic rate, so movement, collision, and simulation stay reproducible (and replayable — see [`replay/`](modules/replay.md)).

Reserve `useUpdate` for render-frame-only work that must track the display rate: camera smoothing, interpolation, and visual effects. Rule of thumb: if it mutates game state, it belongs on the fixed step; if it only affects how the current frame looks, it belongs in `useUpdate`.

See [Application & loop](concepts/application-and-loop.md) for the canonical patterns.

## The render pipeline

```
<Application>           owns the renderer, starts it on mount
  <FullscreenCanvas>    mounts a FrameBufferRenderable, wraps it in FrameDiffCanvas
    <Scene>             pushes a scene onto the stack
      <SceneRenderer>   useUpdate: clear → scene.draw(canvas, renderAlpha) → flush
        entities        drawn by scene.draw() in zIndex order
```

- `FrameDiffCanvas` double-buffers cell bytes and only flushes cells that changed frame-to-frame, so partial redraws are cheap.
- `Scene.draw(canvas, renderAlpha)` draws its entity tree in `zIndex` order, passing `renderAlpha` so entities can interpolate between the previous and current fixed-tick positions.
- A `Scene3D` is drawn into a `WorldView3D` entity — a 2D entity that owns and ticks a 3D scene and composites it into the 2D scene at a viewport. This lets HUD and effect entities layer around the 3D view by `zIndex`. See [Scenes & entities](concepts/scenes-and-entities.md).

## Inspection

The engine ships a live inspection system used by `rune inspect` and `rune preview`. Both render through the same inspector TUI; the only differences are the data source (live socket vs. static scan) and whether edits are accepted.

- [`inspect/protocol.ts`](api/Interface.InspectorSnapshot.md) — the newline-delimited JSON wire protocol (snapshots, edits, commands).
- [`inspect/server.ts`](api/Class.InspectionServer.md) — a Unix-socket server that broadcasts snapshots and applies edits. Only constructed when `RUNE_INSPECT_SOCKET` is set.
- [`inspect/snapshot.ts`](api/Function.applyEdit.md) — walks the live app into an `InspectorSnapshot`; applies `InspectorEdit`s to live entities.

### Dead-code elimination in builds

`rune build` defines `process.env.RUNE_COMPILED = "1"`. The engine guards the inspection server with `process.env.RUNE_COMPILED !== "1"` and dynamically imports `./inspect/server`, so the entire inspection subsystem is dead-code-eliminated from shipped binaries. `rune dev` never sets this flag.

See [Inspection](concepts/inspection.md) for the full protocol and workflow.

## Environment variables

| Variable | Set by | Effect |
| --- | --- | --- |
| `RUNE_DEV=1` | `rune dev` | Marks a standalone dev run; `shutdown()` exits the process (because `bun --watch` keeps it alive). |
| `RUNE_INSPECT_SOCKET=<path>` | `rune dev` (unless `--no-inspect`) | Starts the inspection server on this socket. |
| `RUNE_COMPILED=1` | `rune build` (via `define`) | Dead-code-eliminates the inspection server; `shutdown()` exits the process. |
