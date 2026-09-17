# Input

Rune's input system is built around two ideas: **dual edge buffers** (one for the fixed step, one for the frame step) so a press fires exactly once per phase, and **action mapping** so game code reads named actions (`"jump"`, `"confirm"`) instead of raw keys.

## Keyboard state

[`KeyboardState`](../api/Class.KeyboardState.md) tracks held/pressed/released for every key. It's designed for terminals that may omit key-release events — held keys are refreshed by an auto-repeat hold decay so `isDown` stays true while a key is held, even without repeat events.

### Reading state

```ts
const keyboard = useInput()  // KeyboardSnapshot

keyboard.isDown("w")         // held right now
keyboard.wasPressed("space") // pressed since the last edge commit
keyboard.wasReleased("q")    // released since the last edge commit
```

### The `Keys` constant

[`Keys`](../api/Variable.Keys.md) normalizes terminal key names across platforms. Use it instead of raw strings:

```ts
import { Keys } from "@ahokinson/rune"

keyboard.isDown(Keys.ArrowUp)
keyboard.wasPressed(Keys.Space)
keyboard.wasPressed(Keys.Escape)
```

## Mouse state

[`MouseState`](../api/Class.MouseState.md) tracks position, delta, and button edges with the same dual-buffer scheme as the keyboard.

```ts
const mouse = useMouse()  // MouseSnapshot

mouse.x            // current column
mouse.y            // current row
mouse.deltaX       // movement since last frame (for mouse-look)
mouse.deltaY
mouse.isDown(MouseButton.Left)
mouse.wasPressed(MouseButton.Right)
mouse.wasReleased(MouseButton.Middle)
```

[`MouseButton`](../api/Enumeration.MouseButton.md) is `Left` / `Middle` / `Right`.

Mouse events are wired by `<Canvas>` (it forwards `onMouseMove`/`onMouseDown`/`onMouseUp`/`onMouseDrag` from the OpenTUI renderable to `application.mouse`). For mouse-look (pointer lock), enable `enableMouseMovement: true` in your `render()` call in `main.tsx`.

## Gamepad

[`GamepadState`](../api/Class.GamepadState.md) mirrors the keyboard: dual phase-scoped edge buffers per button, plus analog axes with a stick deadzone. The engine owns the state model; a host pushes updates through a pluggable source — [`pollWebGamepads`](../api/Function.pollWebGamepads.md) is the ready-made one for the browser Gamepad API, and `<Application>` calls it every frame (a no-op in a plain Bun terminal, so `useGamepad()` is safe unconditionally).

```ts
const gamepad = useGamepad()  // GamepadSnapshot
gamepad.connected                      // a controller is present
gamepad.wasPressed(GamepadButton.South) // phase-scoped edge
gamepad.axis(GamepadAxis.LeftX)        // -1..1 (deadzoned, rescaled)
```

Gamepad buttons join the action map via the `"gamepad:<button>"` prefix (see below). See [Gamepad](gamepad.md) for the full model, button/axis enums, and source wiring.

## Input phases and the dual edge buffer

The engine maintains **two edge buffers** per input device: one for the fixed step, one for the frame step. Each frame:

1. The fixed pass runs (possibly several substeps). After the **first** substep, the fixed edges are committed — so `wasPressed` on the fixed step fires on exactly one tick, even when a frame runs several substeps.
2. The frame pass runs. Frame edges are committed at the end.

[`InputPhase`](../api/Enumeration.InputPhase.md) (`Fixed` / `Frame`) selects which buffer `wasPressed`/`wasReleased` read from. The phase is set automatically by the loop; you don't usually touch it directly.

### The rule

**Read all gameplay input in the fixed step** — `useFixedUpdate`, or an entity's `update()` (entities tick inside the fixed loop). `wasPressed()` there never double-fires.

`useUpdate` runs at render rate (variable, can fire several times between ticks). Use it only for visuals/interpolation, **never** for `wasPressed`/`isDown`.

```tsx
useFixedUpdate(() => {
  if (controls.wasPressed("confirm")) confirm()  // ✓ fires once
})

useUpdate(() => {
  if (controls.wasPressed("confirm")) confirm()  // ✗ may fire multiple times
})
```

## Action mapping

Game code should read named actions, not raw keys. [`createActionMap`](../api/Function.createActionMap.md) builds an [`ActionSnapshot`](../api/Interface.ActionSnapshot.md) from a bindings map:

```ts
import { type ActionBindings, createActionMap } from "@ahokinson/rune"
import { useApplication } from "@ahokinson/rune"

const bindings: ActionBindings<"move" | "jump" | "confirm"> = {
  move:    ["arrowleft", "arrowright", "a", "d"],
  jump:    ["space", "w", "arrowup", "gamepad:south"],
  confirm: ["enter", "space", "gamepad:start"],
}

// In a component:
const app = useApplication()
const controls = createActionMap(bindings, app.keyboard, app.mouse, app.gamepad)

useFixedUpdate(() => {
  if (controls.wasPressed("jump")) player.jump()
  if (controls.isDown("move")) player.move()
})
```

### Mouse bindings

Bindings can reference mouse buttons with the `mouse:` prefix:

```ts
const bindings = {
  fire:   ["mouse:left", "space"],
  aim:    ["mouse:right"],
  cancel: ["mouse:middle", "escape"],
}
```

### Gamepad bindings

Bindings can reference gamepad buttons with the `gamepad:` prefix — the suffix is a [`GamepadButton`](../api/Enumeration.GamepadButton.md) value (e.g. `"gamepad:south"`, `"gamepad:dpadUp"`):

```ts
const bindings = {
  jump:   ["space", "gamepad:south"],
  attack: ["mouse:left", "gamepad:west"],
  cancel: ["escape", "gamepad:east"],
}
```

For analog movement, read `useGamepad().axis(GamepadAxis.LeftX)` directly — bindings cover edge/hold state, not axis values. See [Gamepad](gamepad.md).

### `useActions`

The `useActions` hook is a shortcut that builds an `ActionSnapshot` from the application's keyboard, mouse, **and** gamepad state:

```tsx
const controls = useActions({
  move:    ["arrowleft", "arrowright", "a", "d"],
  jump:    ["space", "w", "arrowup", "gamepad:south"],
  confirm: ["enter"],
})
```

## See also

- [`KeyboardState` class](../api/Class.KeyboardState.md)
- [`MouseState` class](../api/Class.MouseState.md)
- [`Keys` constants](../api/Variable.Keys.md)
- [`MouseButton` enum](../api/Enumeration.MouseButton.md)
- [`InputPhase` enum](../api/Enumeration.InputPhase.md)
- [`createActionMap` function](../api/Function.createActionMap.md)
- [Gamepad](gamepad.md) — controller state, `"gamepad:"` bindings, analog axes.
- [Application & loop](application-and-loop.md) — how the edge buffers are committed.
