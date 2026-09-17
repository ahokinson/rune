[**rune**](README.md)

***

[rune](README.md) / FocusRing

# Class: FocusRing\<T\>

Defined in: hud/focus.ts:29

An ordered, wrapping focus cursor over a list of controls. Generic over the
control type; pair an `isEnabled` predicate (e.g. reading [Button.enabled](Class.Button.md#enabled))
so traversal skips controls that can't take focus.

## Type Parameters

### T

`T`

## Constructors

### Constructor

```ts
new FocusRing<T>(options): FocusRing<T>;
```

Defined in: hud/focus.ts:40

#### Parameters

##### options

[`FocusRingOptions`](Interface.FocusRingOptions.md)\<`T`\>

Items and traversal behaviour.

#### Returns

`FocusRing`\<`T`\>

## Properties

### index

```ts
index: number;
```

Defined in: hud/focus.ts:33

Index of the focused control, or `-1` when nothing is focusable.

***

### items

```ts
items: T[];
```

Defined in: hud/focus.ts:31

The controls, in focus order.

## Accessors

### focused

#### Get Signature

```ts
get focused(): T | undefined;
```

Defined in: hud/focus.ts:48

The focused control, or `undefined` when nothing is focusable.

##### Returns

`T` \| `undefined`

## Methods

### focus()

```ts
focus(item): boolean;
```

Defined in: hud/focus.ts:87

Focus `item` if it is present and enabled.

#### Parameters

##### item

`T`

The control to focus.

#### Returns

`boolean`

`true` if focus moved to it.

***

### focusNext()

```ts
focusNext(): void;
```

Defined in: hud/focus.ts:72

Advance focus to the next enabled control (wrapping when configured).

#### Returns

`void`

***

### focusPrevious()

```ts
focusPrevious(): void;
```

Defined in: hud/focus.ts:77

Move focus to the previous enabled control (wrapping when configured).

#### Returns

`void`
