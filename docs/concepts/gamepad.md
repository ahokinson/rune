# Gamepad

Rune's gamepad system mirrors the keyboard: a [`GamepadState`](../api/Class.GamepadState.md) maintains dual phase-scoped edge buffers (one for the fixed step, one for the frame step) so a single button press fires exactly once per phase, plus analog axes with a stick deadzone. The engine owns the *state model*; a host feeds it through a pluggable source. [`pollWebGamepads`](../api/Function.pollWebGamepads.md) is the ready-made source for environments that expose the browser Gamepad API, and `<Application>` calls it every frame — a no-op in a plain Bun terminal, so reading the gamepad is safe unconditionally.

## Gamepad state

[`GamepadState`](../api/Class.GamepadState.md) tracks held/pressed/released for every button and the latest value of every axis. It's the same dual-buffer scheme as [`KeyboardState`](../api/Class.KeyboardState.md): `wasPressed` on the fixed step fires on exactly one tick, even when a frame runs several substeps.

### Reading state

```ts
const gamepad = useGamepad()  // GamepadSnapshot

gamepad.connected                    // a controller is present and pushing updates
gamepad.isDown(GamepadButton.South)  // held right now
gamepad.wasPressed(GamepadButton.South)  // pressed since the last edge commit
gamepad.wasReleased(GamepadButton.South) // released since the last edge commit
gamepad.axis(GamepadAxis.LeftX)      // -1..1 (sticks deadzoned, rescaled)
```

`connected` is `false` until a source pushes a connected reading. In a plain Bun terminal it stays `false` and `wasPressed`/`isDown` always return `false`, so game code can branch on `connected` once or simply bind gamepad buttons alongside keyboard ones and let them no-op.

### `GamepadButton`

Face buttons are named by position so they read the same across Xbox and PlayStation layouts:

| Member | Position |
| --- | --- |
| `South` | Bottom face button (Xbox A / PlayStation Cross). |
| `East` | Right face button (Xbox B / PlayStation Circle). |
| `West` | Left face button (Xbox X / PlayStation Square). |
| `North` | Top face button (Xbox Y / PlayStation Triangle). |
| `LeftBumper` / `RightBumper` | Top shoulder buttons. |
| `LeftTrigger` / `RightTrigger` | Bottom shoulder triggers (digital press; analog value via `GamepadAxis`). |
| `Select` | Back / View / Share. |
| `Start` | Start / Menu / Options. |
| `LeftStick` / `RightStick` | Stick pressed in (L3 / R3). |
| `DpadUp` / `DpadDown` / `DpadLeft` / `DpadRight` | Directional pad. |
| `Guide` | Guide / Home / PS button. |

### `GamepadAxis`

| Member | Range | Notes |
| --- | --- | --- |
| `LeftX` / `LeftY` | `-1..1` | Left stick; deadzoned and rescaled. |
| `RightX` / `RightY` | `-1..1` | Right stick; deadzoned and rescaled. |
| `LeftTrigger` / `RightTrigger` | `0..1` | Analog trigger value; not deadzoned. |

The default stick deadzone is `0.1` (radial): a stick below the deadzone reads `0`, and the remaining range is rescaled so motion starts smoothly at the edge. Override it via `GamepadStateOptions.deadzone` (the engine's own `GamepadState` is constructed with the default).

## Sources

Reading a physical controller is host-specific — there's no built-in terminal gamepad reader. The engine owns the state model and feeds it through a pluggable source:

- [`pollWebGamepads`](../api/Function.pollWebGamepads.md) reads `navigator.getGamepads()` once and pushes the first (or `index`-th) connected controller into a `GamepadState`. It returns `false` where the Web Gamepad API is unavailable, so it's safe to call unconditionally every frame — which is exactly what `<Application>` does. Use it in a host that exposes the browser Gamepad API (e.g. an Electron-style wrapper, a web build).
- Push your own readings with `state.setButton(button, down)` / `state.setAxis(axis, value)` / `state.setConnected(bool)` if you have a different source (a custom SDL bridge, a networked controller, a test harness).

## Action mapping

Gamepad buttons join the same action map as keys and mouse buttons via the `"gamepad:<button>"` prefix. The `<button>` segment is a [`GamepadButton`](../api/Enumeration.GamepadButton.md) value (e.g. `"gamepad:south"`, `"gamepad:dpadUp"`). The `useActions` hook wires the application's keyboard, mouse, **and** gamepad together automatically, so a binding list mixing all three just works:

```ts
const controls = useActions({
  jump:   [Keys.Space, "w", "gamepad:south"],
  attack: ["mouse:left", Keys.Space, "gamepad:west"],
  cancel: [Keys.Escape, "gamepad:east"],
})
```

For analog movement, read `useGamepad().axis(GamepadAxis.LeftX)` directly — action bindings are for edge/hold state, not for axis values.

## Input timing

The same rule as keyboard input: **read all gameplay gamepad input in the fixed step** — `useFixedUpdate`, or an entity's `update()`. `wasPressed()` there never double-fires.

```tsx
useFixedUpdate(() => {
  if (controls.wasPressed("jump")) player.jump()
  if (gamepad.connected) {
    const lx = gamepad.axis(GamepadAxis.LeftX)
    if (Math.abs(lx) > 0) player.move(lx)
  }
})
```

`useUpdate` runs at render rate (variable, can fire several times between ticks). Use it only for visuals/interpolation, **never** for `wasPressed`/`isDown`.

## See also

- [`GamepadState` class](../api/Class.GamepadState.md)
- [`GamepadSnapshot` interface](../api/Interface.GamepadSnapshot.md)
- [`GamepadButton` enum](../api/Enumeration.GamepadButton.md)
- [`GamepadAxis` enum](../api/Enumeration.GamepadAxis.md)
- [`pollWebGamepads` function](../api/Function.pollWebGamepads.md)
- [`useGamepad` hook](../api/Function.useGamepad.md)
- [Input](input.md) — keyboard/mouse state, action mapping, the dual edge buffer.
- [Application & loop](application-and-loop.md) — how the loop commits edges each phase; `pollWebGamepads` is called from the frame callback.
