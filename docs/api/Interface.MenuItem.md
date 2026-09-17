[**rune**](README.md)

***

[rune](README.md) / MenuItem

# Interface: MenuItem\<T\>

Defined in: hud/menu.ts:25

One entry in a [Menu](Class.Menu.md).

## Type Parameters

### T

`T`

## Properties

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: hud/menu.ts:31

Whether the cursor may land here (default `true`). Disabled items are skipped and dimmed.

***

### label

```ts
label: string;
```

Defined in: hud/menu.ts:29

Display text.

***

### value

```ts
value: T;
```

Defined in: hud/menu.ts:27

The value selecting this entry yields.
