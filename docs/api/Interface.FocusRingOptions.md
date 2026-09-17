[**rune**](README.md)

***

[rune](README.md) / FocusRingOptions

# Interface: FocusRingOptions\<T\>

Defined in: hud/focus.ts:12

Options for constructing a [FocusRing](Class.FocusRing.md).

## Type Parameters

### T

`T`

## Properties

### isEnabled?

```ts
optional isEnabled?: (item) => boolean;
```

Defined in: hud/focus.ts:19

Whether a member can hold focus (default: always). Disabled members are
skipped by traversal.

#### Parameters

##### item

`T`

#### Returns

`boolean`

***

### items

```ts
items: T[];
```

Defined in: hud/focus.ts:14

The controls, in focus order.

***

### wrap?

```ts
optional wrap?: boolean;
```

Defined in: hud/focus.ts:21

Whether traversal wraps at the ends (default `true`).
