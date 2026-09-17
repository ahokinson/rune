[**rune**](README.md)

***

[rune](README.md) / MouseState

# Class: MouseState

Defined in: input/mouse.ts:49

Mutable mouse state implementing [MouseSnapshot](Interface.MouseSnapshot.md). Tracks cursor
position and per-frame movement delta plus two phase-scoped button edge
buffers mirroring [KeyboardState](Class.KeyboardState.md), so a click is observable exactly
once per fixed substep and once per frame.

## Implements

- [`MouseSnapshot`](Interface.MouseSnapshot.md)

## Constructors

### Constructor

```ts
new MouseState(): MouseState;
```

#### Returns

`MouseState`

## Properties

### deltaX

```ts
deltaX: number = 0;
```

Defined in: input/mouse.ts:55

Cursor X delta accumulated since the last [commitFrame](#commitframe).

#### Implementation of

[`MouseSnapshot`](Interface.MouseSnapshot.md).[`deltaX`](Interface.MouseSnapshot.md#deltax)

***

### deltaY

```ts
deltaY: number = 0;
```

Defined in: input/mouse.ts:57

Cursor Y delta accumulated since the last [commitFrame](#commitframe).

#### Implementation of

[`MouseSnapshot`](Interface.MouseSnapshot.md).[`deltaY`](Interface.MouseSnapshot.md#deltay)

***

### x

```ts
x: number = 0;
```

Defined in: input/mouse.ts:51

Current cursor X in screen pixels.

#### Implementation of

[`MouseSnapshot`](Interface.MouseSnapshot.md).[`x`](Interface.MouseSnapshot.md#x)

***

### y

```ts
y: number = 0;
```

Defined in: input/mouse.ts:53

Current cursor Y in screen pixels.

#### Implementation of

[`MouseSnapshot`](Interface.MouseSnapshot.md).[`y`](Interface.MouseSnapshot.md#y)

## Methods

### commitFixed()

```ts
commitFixed(): void;
```

Defined in: input/mouse.ts:128

Clear the fixed-step button edges (after the first substep of a frame).
Cursor delta is a per-frame quantity, so it is left untouched here.

#### Returns

`void`

***

### commitFrame()

```ts
commitFrame(): void;
```

Defined in: input/mouse.ts:137

Clear the per-frame button edges and re-anchor the cursor delta. Called at
frame end.

#### Returns

`void`

***

### commitStep()

```ts
commitStep(): void;
```

Defined in: input/mouse.ts:150

Clear both edge buffers and re-anchor the delta in one call. Convenient for
standalone/test use where there is no distinct fixed/frame split.

#### Returns

`void`

***

### isDown()

```ts
isDown(button): boolean;
```

Defined in: input/mouse.ts:170

#### Parameters

##### button

[`MouseButton`](Enumeration.MouseButton.md)

Button to test.

#### Returns

`boolean`

`true` if `button` is currently held.

#### Implementation of

[`MouseSnapshot`](Interface.MouseSnapshot.md).[`isDown`](Interface.MouseSnapshot.md#isdown)

***

### press()

```ts
press(button): void;
```

Defined in: input/mouse.ts:94

Record a press of `button`.

#### Parameters

##### button

[`MouseButton`](Enumeration.MouseButton.md)

Button that was pressed.

#### Returns

`void`

***

### release()

```ts
release(button): void;
```

Defined in: input/mouse.ts:107

Record a release of `button`.

#### Parameters

##### button

[`MouseButton`](Enumeration.MouseButton.md)

Button that was released.

#### Returns

`void`

***

### reset()

```ts
reset(): void;
```

Defined in: input/mouse.ts:156

Clear all held buttons, edge buffers, and cursor delta.

#### Returns

`void`

***

### setPhase()

```ts
setPhase(phase): void;
```

Defined in: input/mouse.ts:120

Select which phase's edge buffer the button-edge queries read from.

#### Parameters

##### phase

[`InputPhase`](Enumeration.InputPhase.md)

Phase to activate ([InputPhase.Fixed](Enumeration.InputPhase.md#fixed) or [InputPhase.Frame](Enumeration.InputPhase.md#frame)).

#### Returns

`void`

***

### setPosition()

```ts
setPosition(x, y): void;
```

Defined in: input/mouse.ts:77

Update the cursor position and refresh the per-frame delta. The first call
also seeds the delta anchor so the initial delta isn't a jump from (0, 0).

#### Parameters

##### x

`number`

New cursor X.

##### y

`number`

New cursor Y.

#### Returns

`void`

***

### wasPressed()

```ts
wasPressed(button): boolean;
```

Defined in: input/mouse.ts:178

#### Parameters

##### button

[`MouseButton`](Enumeration.MouseButton.md)

Button to test.

#### Returns

`boolean`

`true` if `button` transitioned up→down this phase.

#### Implementation of

[`MouseSnapshot`](Interface.MouseSnapshot.md).[`wasPressed`](Interface.MouseSnapshot.md#waspressed)

***

### wasReleased()

```ts
wasReleased(button): boolean;
```

Defined in: input/mouse.ts:187

#### Parameters

##### button

[`MouseButton`](Enumeration.MouseButton.md)

Button to test.

#### Returns

`boolean`

`true` if `button` transitioned down→up this phase.

#### Implementation of

[`MouseSnapshot`](Interface.MouseSnapshot.md).[`wasReleased`](Interface.MouseSnapshot.md#wasreleased)
