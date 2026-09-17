[**rune**](README.md)

***

[rune](README.md) / Texture

# Class: Texture

Defined in: draw/texture.ts:17

A sampleable RGBA bitmap. Pixels are stored row-major in a flat
`Uint8ClampedArray` of `width * height * 4` bytes (r, g, b, a per pixel, each
0–255). Sampling is nearest-neighbour with wrapping, so a texture tiles
naturally across repeated surface cells — see [TextureSurfaceShader](Class.TextureSurfaceShader.md).

## Constructors

### Constructor

```ts
new Texture(
   width, 
   height, 
   data?
): Texture;
```

Defined in: draw/texture.ts:30

#### Parameters

##### width

`number`

Width in texels (clamped to ≥ 1).

##### height

`number`

Height in texels (clamped to ≥ 1).

##### data?

`Uint8ClampedArray`\<`ArrayBufferLike`\>

Pre-filled buffer; must be `width * height * 4` bytes. If omitted, a zeroed buffer is allocated.

#### Returns

`Texture`

## Properties

### data

```ts
readonly data: Uint8ClampedArray;
```

Defined in: draw/texture.ts:23

Flat row-major RGBA bytes (`width * height * 4`, each 0–255).

***

### height

```ts
readonly height: number;
```

Defined in: draw/texture.ts:21

Height in texels.

***

### width

```ts
readonly width: number;
```

Defined in: draw/texture.ts:19

Width in texels.

## Methods

### sampleAlpha()

```ts
sampleAlpha(u, v): number;
```

Defined in: draw/texture.ts:93

Alpha (0–255) of the texel nearest `(u, v)`, with wrapping.

#### Parameters

##### u

`number`

U coordinate (wraps into [0, 1)).

##### v

`number`

V coordinate (wraps into [0, 1)).

#### Returns

`number`

The alpha channel in 0–255.

***

### sampleInto()

```ts
sampleInto(
   u, 
   v, 
   out
): void;
```

Defined in: draw/texture.ts:108

Nearest-neighbour sample at texture coordinate `(u, v)`, writing RGB (0–255)
into `out`. Coordinates wrap into `[0, 1)` so values outside the unit square
tile the texture. Alpha is ignored; query [sampleAlpha](#samplealpha) for it.

#### Parameters

##### u

`number`

U coordinate (wraps into [0, 1)).

##### v

`number`

V coordinate (wraps into [0, 1)).

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

Target to fill with RGB bytes.

#### Returns

`void`

***

### setPixel()

```ts
setPixel(
   x, 
   y, 
   color
): void;
```

Defined in: draw/texture.ts:76

Write a texel's colour. Out-of-bounds writes are ignored.

#### Parameters

##### x

`number`

Texel column.

##### y

`number`

Texel row.

##### color

[`Color`](Class.Color.md)

Colour to write.

#### Returns

`void`

***

### fromPixelSprite()

```ts
static fromPixelSprite(sprite): Texture;
```

Defined in: draw/texture.ts:51

Build a Texture from a [PixelSprite](Class.PixelSprite.md). Opaque pixels become RGBA with
alpha 255; transparent (`null`) pixels become fully transparent black.

#### Parameters

##### sprite

[`PixelSprite`](Class.PixelSprite.md)

Source sprite.

#### Returns

`Texture`

A new Texture.
