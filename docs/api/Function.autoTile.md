[**rune**](README.md)

***

[rune](README.md) / autoTile

# Function: autoTile()

```ts
function autoTile<TCell>(
   tiles, 
   same, 
   edgesMatch?
): TileAppearance<TCell>;
```

Defined in: draw/autotile.ts:64

Build a neighbour-aware [TileAppearance](TypeAlias.TileAppearance.md) from a 16-entry sprite table
indexed by the edge mask. Drop the result straight into
`TileSet.define({ appearance })`.

## Type Parameters

### TCell

`TCell`

## Parameters

### tiles

readonly [`Sprite`](Class.Sprite.md)[]

16 sprites indexed by the 4-bit edge mask.

### same

(`cell`) => `boolean`

Predicate deciding whether a neighbour belongs to the same group.

### edgesMatch?

`boolean` = `true`

Whether out-of-bounds neighbours count as matching (default true).

## Returns

[`TileAppearance`](TypeAlias.TileAppearance.md)\<`TCell`\>

A function that picks a sprite from the surrounding cells.
