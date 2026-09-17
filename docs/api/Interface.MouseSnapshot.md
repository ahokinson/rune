[**rune**](README.md)

***

[rune](README.md) / MouseSnapshot

# Interface: MouseSnapshot

Defined in: input/mouse.ts:26

Read-only view of mouse state used by action mapping and gameplay code.

## Properties

### deltaX

```ts
readonly deltaX: number;
```

Defined in: input/mouse.ts:32

Cursor X delta accumulated since the last [MouseState.commitFrame](Class.MouseState.md#commitframe).

***

### deltaY

```ts
readonly deltaY: number;
```

Defined in: input/mouse.ts:34

Cursor Y delta accumulated since the last [MouseState.commitFrame](Class.MouseState.md#commitframe).

***

### x

```ts
readonly x: number;
```

Defined in: input/mouse.ts:28

Current cursor X in screen pixels.

***

### y

```ts
readonly y: number;
```

Defined in: input/mouse.ts:30

Current cursor Y in screen pixels.

## Methods

### isDown()

```ts
isDown(button): boolean;
```

Defined in: input/mouse.ts:36

`true` while `button` is currently held.

#### Parameters

##### button

[`MouseButton`](Enumeration.MouseButton.md)

#### Returns

`boolean`

***

### wasPressed()

```ts
wasPressed(button): boolean;
```

Defined in: input/mouse.ts:38

`true` on the frame `button` transitioned from up to down (phase-scoped).

#### Parameters

##### button

[`MouseButton`](Enumeration.MouseButton.md)

#### Returns

`boolean`

***

### wasReleased()

```ts
wasReleased(button): boolean;
```

Defined in: input/mouse.ts:40

`true` on the frame `button` transitioned from down to up (phase-scoped).

#### Parameters

##### button

[`MouseButton`](Enumeration.MouseButton.md)

#### Returns

`boolean`
