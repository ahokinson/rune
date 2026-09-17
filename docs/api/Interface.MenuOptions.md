[**rune**](README.md)

***

[rune](README.md) / MenuOptions

# Interface: MenuOptions\<T\>

Defined in: hud/menu.ts:35

Options for constructing a [Menu](Class.Menu.md).

## Type Parameters

### T

`T`

## Properties

### cursor?

```ts
optional cursor?: number;
```

Defined in: hud/menu.ts:43

Initial cursor index (default the first enabled item).

***

### items

```ts
items: MenuItem<T>[];
```

Defined in: hud/menu.ts:37

The entries, in display order.

***

### orientation?

```ts
optional orientation?: MenuOrientation;
```

Defined in: hud/menu.ts:39

Layout direction (default [MenuOrientation.Vertical](Enumeration.MenuOrientation.md#vertical)).

***

### wrap?

```ts
optional wrap?: boolean;
```

Defined in: hud/menu.ts:41

Whether moving past an end wraps to the other end (default `true`).
