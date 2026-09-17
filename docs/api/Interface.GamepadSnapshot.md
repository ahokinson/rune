[**rune**](README.md)

***

[rune](README.md) / GamepadSnapshot

# Interface: GamepadSnapshot

Defined in: input/gamepad.ts:86

Read-only view of gamepad state used by action mapping and gameplay code.

## Properties

### connected

```ts
readonly connected: boolean;
```

Defined in: input/gamepad.ts:88

`true` while a controller is connected and pushing updates.

## Methods

### axis()

```ts
axis(axis): number;
```

Defined in: input/gamepad.ts:96

Current value of `axis` (deadzone-filtered for sticks).

#### Parameters

##### axis

[`GamepadAxis`](Enumeration.GamepadAxis.md)

#### Returns

`number`

***

### isDown()

```ts
isDown(button): boolean;
```

Defined in: input/gamepad.ts:90

`true` while `button` is currently held.

#### Parameters

##### button

[`GamepadButton`](Enumeration.GamepadButton.md)

#### Returns

`boolean`

***

### wasPressed()

```ts
wasPressed(button): boolean;
```

Defined in: input/gamepad.ts:92

`true` on the frame `button` transitioned from up to down (phase-scoped).

#### Parameters

##### button

[`GamepadButton`](Enumeration.GamepadButton.md)

#### Returns

`boolean`

***

### wasReleased()

```ts
wasReleased(button): boolean;
```

Defined in: input/gamepad.ts:94

`true` on the frame `button` transitioned from down to up (phase-scoped).

#### Parameters

##### button

[`GamepadButton`](Enumeration.GamepadButton.md)

#### Returns

`boolean`
