[**rune**](README.md)

***

[rune](README.md) / Sprite

# Class: Sprite

Defined in: draw/sprite.ts:45

A 2D grid of optionally transparent, coloured glyphs that can be blitted onto
a canvas.

## Example

```ts
const sprite = Sprite.fromString("##\n##", Color.RED)
drawSprite(canvas, sprite, 10, 5)
```

## Constructors

### Constructor

```ts
new Sprite(width, height): Sprite;
```

Defined in: draw/sprite.ts:56

#### Parameters

##### width

`number`

Width in cells (clamped to ≥ 0).

##### height

`number`

Height in cells (clamped to ≥ 0).

#### Returns

`Sprite`

## Properties

### height

```ts
readonly height: number;
```

Defined in: draw/sprite.ts:49

Height in cells.

***

### width

```ts
readonly width: number;
```

Defined in: draw/sprite.ts:47

Width in cells.

## Methods

### cellAt()

```ts
cellAt(x, y): SpriteCell | null;
```

Defined in: draw/sprite.ts:111

Read the cell at `(x, y)`.

#### Parameters

##### x

`number`

Column.

##### y

`number`

Row.

#### Returns

[`SpriteCell`](Interface.SpriteCell.md) \| `null`

The cell, or `null` if out of bounds.

***

### setCell()

```ts
setCell(
   x, 
   y, 
   character, 
   foreground?, 
   background?
): void;
```

Defined in: draw/sprite.ts:88

Set a cell's glyph and colours; marks it non-transparent. Out-of-bounds
writes are ignored.

#### Parameters

##### x

`number`

Column.

##### y

`number`

Row.

##### character

`string`

Glyph to write.

##### foreground?

[`Color`](Class.Color.md) = `Color.WHITE`

Glyph colour (default white).

##### background?

[`Color`](Class.Color.md) \| `null`

Cell background, or `null` for transparent (default `null`).

#### Returns

`void`

***

### fromLegend()

```ts
static fromLegend(source, legend): Sprite;
```

Defined in: draw/sprite.ts:125

Build a sprite from ASCII art plus a legend mapping each character to a
colour and optional glyph. Spaces and characters missing from the legend
are left transparent.

#### Parameters

##### source

`string`

ASCII art (leading/trailing blank lines trimmed).

##### legend

`Record`\<`string`, [`SpriteLegendEntry`](Interface.SpriteLegendEntry.md)\>

Map from character to [SpriteLegendEntry](Interface.SpriteLegendEntry.md).

#### Returns

`Sprite`

A new Sprite.

***

### fromString()

```ts
static fromString(source, foreground?): Sprite;
```

Defined in: draw/sprite.ts:155

Build a sprite from ASCII art in a single foreground colour. Spaces and
`.` are treated as transparent.

#### Parameters

##### source

`string`

ASCII art (leading/trailing blank lines trimmed).

##### foreground?

[`Color`](Class.Color.md) = `Color.WHITE`

Glyph colour (default white).

#### Returns

`Sprite`

A new Sprite.
