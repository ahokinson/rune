[**rune**](README.md)

***

[rune](README.md) / SpriteCell

# Interface: SpriteCell

Defined in: draw/sprite.ts:14

A single cell of a [Sprite](Class.Sprite.md): glyph, colours, and transparency flag.

## Properties

### background

```ts
background: Color | null;
```

Defined in: draw/sprite.ts:20

Background colour, or `null` for a transparent background.

***

### character

```ts
character: string;
```

Defined in: draw/sprite.ts:16

Glyph to draw.

***

### foreground

```ts
foreground: Color;
```

Defined in: draw/sprite.ts:18

Foreground colour.

***

### transparent

```ts
transparent: boolean;
```

Defined in: draw/sprite.ts:22

If `true`, the cell is skipped when blitting.
