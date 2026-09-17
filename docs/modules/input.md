# input

Keyboard, mouse, gamepad, and action mapping — the input state the application reads each frame. The system is built around **dual edge buffers** (one per [`InputPhase`](../api/Enumeration.InputPhase.md)) so a single physical press fires exactly once in the fixed step and once in the frame step, and **action mapping** so game code reads named actions (`"jump"`) instead of raw keys.

## Overview

[`KeyboardState`](../api/Class.KeyboardState.md), [`MouseState`](../api/Class.MouseState.md), and [`GamepadState`](../api/Class.GamepadState.md) are the mutable state objects `<Application>` owns and exposes via `useInput()` / `useMouse()` / `useGamepad()`. Each maintains two edge buffers per phase (fixed + frame) and returns the one matching the active phase, so `wasPressed` on the fixed step never double-fires when a frame runs several substeps. Keyboard state is designed for terminals that may omit key-release events — `decayHeld` auto-releases keys whose terminal never sent a release, so `isDown` stays true while held. The [`Keys`](../api/Variable.Keys.md) constant normalises friendly aliases (`ArrowUp`, `Space`, `Escape`) to their `event.key` strings so renames stay in one place. Gamepad state is host-fed: the engine owns the model, [`pollWebGamepads`](../api/Function.pollWebGamepads.md) pushes the browser Gamepad API's readings each frame (a no-op in a plain Bun terminal), and `connected` stays `false` until a source reports a controller.

Action mapping decouples gameplay from raw keys. [`createActionMap`](../api/Function.createActionMap.md) builds an [`ActionSnapshot`](../api/Interface.ActionSnapshot.md) from a [`ActionBindings`](../api/TypeAlias.ActionBindings.md) map plus the current keyboard/mouse/gamepad snapshots; the snapshot mirrors the keyboard/mouse/gamepad API (`isDown`, `wasPressed`, `wasReleased`) but keyed by action name. Mouse buttons join the same map via the `"mouse:left"` / `"mouse:right"` / `"mouse:middle"` prefix, and gamepad buttons via `"gamepad:<button>"` (a [`GamepadButton`](../api/Enumeration.GamepadButton.md) value, e.g. `"gamepad:south"`). The `useActions` hook is the shortcut that wires a bindings map to the application's keyboard, mouse, and gamepad.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `phase.ts` | [`InputPhase`](../api/Enumeration.InputPhase.md) | Which pass (`Fixed` / `Frame`) is reading input. |
| `keyboard.ts` | [`KeyboardState`](../api/Class.KeyboardState.md), [`KeyboardSnapshot`](../api/Interface.KeyboardSnapshot.md) | Mutable keyboard state + read-only view. |
| `mouse.ts` | [`MouseState`](../api/Class.MouseState.md), [`MouseSnapshot`](../api/Interface.MouseSnapshot.md), [`MouseButton`](../api/Enumeration.MouseButton.md) | Mutable mouse state + read-only view + buttons. |
| `gamepad.ts` | [`GamepadState`](../api/Class.GamepadState.md), [`GamepadSnapshot`](../api/Interface.GamepadSnapshot.md), [`GamepadButton`](../api/Enumeration.GamepadButton.md), [`GamepadAxis`](../api/Enumeration.GamepadAxis.md), [`pollWebGamepads`](../api/Function.pollWebGamepads.md) | Mutable gamepad state + read-only view + axes + browser-API source. |
| `keys.ts` | [`Keys`](../api/Variable.Keys.md) | Friendly key-name → `event.key` aliases. |
| `actions.ts` | [`createActionMap`](../api/Function.createActionMap.md), [`ActionSnapshot`](../api/Interface.ActionSnapshot.md), [`ActionBindings`](../api/TypeAlias.ActionBindings.md) | Named-action mapping over keyboard + mouse + gamepad. |

## Key types

### Classes
- [`KeyboardState`](../api/Class.KeyboardState.md) — Held/pressed/released per key with dual phase-scoped edge buffers.
- [`MouseState`](../api/Class.MouseState.md) — Cursor position, per-frame delta, and phase-scoped button edges (mirrors `KeyboardState`).
- [`GamepadState`](../api/Class.GamepadState.md) — Held/pressed/released per button plus analog axes, mirroring `KeyboardState`'s dual-buffer scheme. Host-fed via `setButton`/`setAxis`; `<Application>` polls the Web Gamepad API each frame.

### Enums
- [`InputPhase`](../api/Enumeration.InputPhase.md) — `Fixed` / `Frame`; selects which edge buffer `wasPressed`/`wasReleased` read from.
- [`MouseButton`](../api/Enumeration.MouseButton.md) — `Left` / `Middle` / `Right` (values match `"mouse:*"` binding strings).
- [`GamepadButton`](../api/Enumeration.GamepadButton.md) — Standard-mapping buttons named by position (`South`/`East`/`West`/`North`, bumpers/triggers, D-pad, `Guide`, …); values match `"gamepad:*"` binding strings.
- [`GamepadAxis`](../api/Enumeration.GamepadAxis.md) — Analog axes (`LeftX`/`LeftY`/`RightX`/`RightY` deadzoned sticks, `LeftTrigger`/`RightTrigger` 0..1).

### Functions
- [`createActionMap`](../api/Function.createActionMap.md) — Build an [`ActionSnapshot`](../api/Interface.ActionSnapshot.md) from a bindings map plus keyboard and (optionally) mouse and gamepad snapshots.
- [`pollWebGamepads`](../api/Function.pollWebGamepads.md) — Read `navigator.getGamepads()` once and push the first (or `index`-th) connected controller into a `GamepadState`. No-op where the API is unavailable.

### Types & interfaces
- [`KeyboardSnapshot`](../api/Interface.KeyboardSnapshot.md) / [`MouseSnapshot`](../api/Interface.MouseSnapshot.md) / [`GamepadSnapshot`](../api/Interface.GamepadSnapshot.md) — Read-only views used by action mapping and gameplay code.
- [`ActionSnapshot`](../api/Interface.ActionSnapshot.md) — Read-only action state mirroring the keyboard/mouse/gamepad API, keyed by action name.
- [`ActionBindings`](../api/TypeAlias.ActionBindings.md) — Map of action name to the list of bindings (key strings, `"mouse:<button>"` strings, and/or `"gamepad:<button>"` strings).
- [`GamepadStateOptions`](../api/Interface.GamepadStateOptions.md) / [`PollWebGamepadsOptions`](../api/Interface.PollWebGamepadsOptions.md) — Construction (stick deadzone) / polling (controller slot) options.

### Constants
- [`Keys`](../api/Variable.Keys.md) — Friendly key aliases (`ArrowUp`, `Space`, `Enter`, `Escape`, …) to their `event.key` values.

## Usage

```ts
import { GamepadButton, Keys, createActionMap, useApplication } from "@ahokinson/rune"

const app = useApplication()
const controls = createActionMap(
  {
    move:    [Keys.ArrowLeft, Keys.ArrowRight, "a", "d", "gamepad:dpadLeft", "gamepad:dpadRight"],
    jump:    [Keys.Space, "w", Keys.ArrowUp, "gamepad:south"],
    confirm: [Keys.Enter, "gamepad:start"],
    fire:    ["mouse:left", Keys.Space, "gamepad:west"],
  },
  app.keyboard,
  app.mouse,
  app.gamepad,
)

useFixedUpdate(() => {
  if (controls.wasPressed("jump")) player.jump()
  if (controls.isDown("move")) player.move()
  if (controls.wasPressed("fire")) player.fire()
})
```

The `useActions(bindings)` hook is the one-liner shortcut for the same thing, wired to the application's keyboard, mouse, and gamepad with automatic unmount cleanup.

## See also

- [Input](../concepts/input.md) — the dual edge buffer, action mapping, `useInput`/`useMouse`/`useActions`.
- [Gamepad](../concepts/gamepad.md) — controller state model, `pollWebGamepads`, `"gamepad:"` bindings, analog axes.
- [Application & loop](../concepts/application-and-loop.md) — how the loop commits edges each phase.
- [replay](replay.md) — [`InputRecorder`](../api/Class.InputRecorder.md) / [`InputPlayback`](../api/Class.InputPlayback.md) capture and replay the fixed-step input stream.
