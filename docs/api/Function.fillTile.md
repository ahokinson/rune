[**rune**](README.md)

***

[rune](README.md) / fillTile

# Function: fillTile()

```ts
function fillTile(
   size, 
   character, 
   color
): Sprite;
```

Defined in: draw/tileSet.ts:131

Build a solid `size`×`size` sprite filled with one character/colour — the tile
equivalent of a painted block, instead of hand-setting every cell.

## Parameters

### size

`number`

Edge length in cells.

### character

`string`

Glyph to fill with.

### color

[`Color`](Class.Color.md)

Glyph colour.

## Returns

[`Sprite`](Class.Sprite.md)

A new [Sprite](Class.Sprite.md).
