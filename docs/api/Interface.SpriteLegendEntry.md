[**rune**](README.md)

***

[rune](README.md) / SpriteLegendEntry

# Interface: SpriteLegendEntry

Defined in: draw/sprite.ts:26

A legend entry mapping an ASCII-art character to a [Sprite](Class.Sprite.md) cell spec.

## Properties

### background?

```ts
optional background?: Color | null;
```

Defined in: draw/sprite.ts:32

Background colour, or `null` for transparent (default `null`).

***

### character?

```ts
optional character?: string;
```

Defined in: draw/sprite.ts:28

Glyph to draw (defaults to the legend key character).

***

### foreground

```ts
foreground: Color;
```

Defined in: draw/sprite.ts:30

Foreground colour.
