[**rune**](README.md)

***

[rune](README.md) / parsePixelSprite

# Function: parsePixelSprite()

```ts
function parsePixelSprite(art, legend): PixelSprite;
```

Defined in: assets/pixelSprite.ts:187

Parse a pixel-art string into a [PixelSprite](Class.PixelSprite.md) using a
character-to-`Color` legend.

## Parameters

### art

`string`

Multi-line ASCII art.

### legend

`Record`\<`string`, [`Color`](Class.Color.md) \| `null`\>

Character-to-`Color | null` mapping.

## Returns

[`PixelSprite`](Class.PixelSprite.md)

A new [PixelSprite](Class.PixelSprite.md).
