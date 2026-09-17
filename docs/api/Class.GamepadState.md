[**rune**](README.md)

***

[rune](README.md) / GamepadState

# Class: GamepadState

Defined in: input/gamepad.ts:125

Mutable gamepad state implementing [GamepadSnapshot](Interface.GamepadSnapshot.md). Maintains two edge
buffers per phase (fixed-step and per-frame) so a single press is observable
exactly once in each pass even when a frame runs multiple fixed substeps —
identical to [KeyboardState](Class.KeyboardState.md). A source (e.g. [pollWebGamepads](Function.pollWebGamepads.md))
pushes the live controller state each frame via [setButton](#setbutton)/[setAxis](#setaxis).

## Example

```ts
const gamepad = new GamepadState()
gamepad.setButton(GamepadButton.South, true)
gamepad.setPhase(InputPhase.Fixed)
gamepad.wasPressed(GamepadButton.South)  // true on the first substep
```

## Implements

- [`GamepadSnapshot`](Interface.GamepadSnapshot.md)

## Constructors

### Constructor

```ts
new GamepadState(options?): GamepadState;
```

Defined in: input/gamepad.ts:139

#### Parameters

##### options?

[`GamepadStateOptions`](Interface.GamepadStateOptions.md) = `{}`

Optional deadzone override.

#### Returns

`GamepadState`

## Accessors

### connected

#### Get Signature

```ts
get connected(): boolean;
```

Defined in: input/gamepad.ts:144

`true` while a controller is connected and pushing updates.

##### Returns

`boolean`

`true` while a controller is connected and pushing updates.

#### Implementation of

[`GamepadSnapshot`](Interface.GamepadSnapshot.md).[`connected`](Interface.GamepadSnapshot.md#connected)

## Methods

### axis()

```ts
axis(axis): number;
```

Defined in: input/gamepad.ts:261

#### Parameters

##### axis

[`GamepadAxis`](Enumeration.GamepadAxis.md)

Axis to read.

#### Returns

`number`

The axis value; stick axes below the deadzone read `0` and the
  remaining range is rescaled so motion starts smoothly at the deadzone edge.

#### Implementation of

[`GamepadSnapshot`](Interface.GamepadSnapshot.md).[`axis`](Interface.GamepadSnapshot.md#axis)

***

### commitFixed()

```ts
commitFixed(): void;
```

Defined in: input/gamepad.ts:202

Clear the fixed-step edges (after the first substep of a frame).

#### Returns

`void`

***

### commitFrame()

```ts
commitFrame(): void;
```

Defined in: input/gamepad.ts:208

Clear the per-frame edges (at frame end).

#### Returns

`void`

***

### commitStep()

```ts
commitStep(): void;
```

Defined in: input/gamepad.ts:214

Clear both edge buffers in one call (standalone/test use).

#### Returns

`void`

***

### isDown()

```ts
isDown(button): boolean;
```

Defined in: input/gamepad.ts:234

#### Parameters

##### button

[`GamepadButton`](Enumeration.GamepadButton.md)

Button to query.

#### Returns

`boolean`

`true` if `button` is currently held.

#### Implementation of

[`GamepadSnapshot`](Interface.GamepadSnapshot.md).[`isDown`](Interface.GamepadSnapshot.md#isdown)

***

### reset()

```ts
reset(): void;
```

Defined in: input/gamepad.ts:220

Clear all held buttons, edge buffers, and axes.

#### Returns

`void`

***

### setAxis()

```ts
setAxis(axis, value): void;
```

Defined in: input/gamepad.ts:187

Push the current value of an analog `axis`. Stick axes are stored raw and
deadzoned on read; triggers are stored as-is.

#### Parameters

##### axis

[`GamepadAxis`](Enumeration.GamepadAxis.md)

Axis to update.

##### value

`number`

Raw value (`-1..1` for sticks, `0..1` for triggers).

#### Returns

`void`

***

### setButton()

```ts
setButton(button, down): void;
```

Defined in: input/gamepad.ts:166

Push the current pressed-state of `button`, computing press/release edges.
Idempotent per state: calling with the same value across frames fires the
edge only on the transition.

#### Parameters

##### button

[`GamepadButton`](Enumeration.GamepadButton.md)

Button to update.

##### down

`boolean`

Whether it is currently pressed.

#### Returns

`void`

***

### setConnected()

```ts
setConnected(connected): void;
```

Defined in: input/gamepad.ts:154

Mark whether a controller is currently connected. Sources call this so
connected reflects live state.

#### Parameters

##### connected

`boolean`

Connection flag.

#### Returns

`void`

***

### setPhase()

```ts
setPhase(phase): void;
```

Defined in: input/gamepad.ts:197

Select which phase's edge buffer wasPressed/wasReleased read from. The
application sets this around the fixed-step and frame-update passes.

#### Parameters

##### phase

[`InputPhase`](Enumeration.InputPhase.md)

Phase to activate.

#### Returns

`void`

***

### wasPressed()

```ts
wasPressed(button): boolean;
```

Defined in: input/gamepad.ts:242

#### Parameters

##### button

[`GamepadButton`](Enumeration.GamepadButton.md)

Button to query.

#### Returns

`boolean`

`true` if `button` transitioned up→down this phase.

#### Implementation of

[`GamepadSnapshot`](Interface.GamepadSnapshot.md).[`wasPressed`](Interface.GamepadSnapshot.md#waspressed)

***

### wasReleased()

```ts
wasReleased(button): boolean;
```

Defined in: input/gamepad.ts:251

#### Parameters

##### button

[`GamepadButton`](Enumeration.GamepadButton.md)

Button to query.

#### Returns

`boolean`

`true` if `button` transitioned down→up this phase.

#### Implementation of

[`GamepadSnapshot`](Interface.GamepadSnapshot.md).[`wasReleased`](Interface.GamepadSnapshot.md#wasreleased)
