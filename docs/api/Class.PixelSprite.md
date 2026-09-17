[**rune**](README.md)

***

[rune](README.md) / PixelSprite

# Class: PixelSprite

Defined in: draw/pixelSprite.ts:23

A pixel-art sprite where each cell is a full-color pixel (or transparent).
Rendered through `drawPixelBillboard`, two stacked pixels share one
terminal cell via the ▀/▄ half-block characters, doubling effective
vertical resolution compared to a [Sprite](Class.Sprite.md) of the same cell footprint.

`height` is measured in pixels — a 10-pixel-tall PixelSprite occupies 5
terminal rows on screen at 1:1 scale.

## Constructors

### Constructor

```ts
new PixelSprite(width, height): PixelSprite;
```

Defined in: draw/pixelSprite.ts:34

#### Parameters

##### width

`number`

Width in pixels (clamped to ≥ 0).

##### height

`number`

Height in pixels (clamped to ≥ 0).

#### Returns

`PixelSprite`

## Properties

### height

```ts
readonly height: number;
```

Defined in: draw/pixelSprite.ts:27

Height in pixels (two pixels share one terminal row when rendered).

***

### width

```ts
readonly width: number;
```

Defined in: draw/pixelSprite.ts:25

Width in pixels.

## Methods

### pixelAt()

```ts
pixelAt(x, y): Color | null;
```

Defined in: draw/pixelSprite.ts:68

Read the pixel at `(x, y)`.

#### Parameters

##### x

`number`

Pixel column.

##### y

`number`

Pixel row.

#### Returns

[`Color`](Class.Color.md) \| `null`

The colour, or `null` if transparent or out of bounds.

***

### setPixel()

```ts
setPixel(
   x, 
   y, 
   color
): void;
```

Defined in: draw/pixelSprite.ts:56

Set the pixel at `(x, y)`, or clear it with `null`. Out-of-bounds writes
are ignored.

#### Parameters

##### x

`number`

Pixel column.

##### y

`number`

Pixel row.

##### color

[`Color`](Class.Color.md) \| `null`

Colour to write, or `null` for transparent.

#### Returns

`void`

***

### fromString()

```ts
static fromString(source, legend): PixelSprite;
```

Defined in: draw/pixelSprite.ts:82

Build a PixelSprite from an ASCII-art string. Each character maps via
`legend` to a Color (opaque pixel) or null (transparent). Characters not
found in the legend, plus literal spaces, are treated as transparent.

#### Parameters

##### source

`string`

ASCII art (leading/trailing blank lines trimmed).

##### legend

`Record`\<`string`, [`Color`](Class.Color.md) \| `null`\>

Map from character to colour (or `null` for transparent).

#### Returns

`PixelSprite`

A new PixelSprite.
