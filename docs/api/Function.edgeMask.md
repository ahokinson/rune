[**rune**](README.md)

***

[rune](README.md) / edgeMask

# Function: edgeMask()

```ts
function edgeMask<TCell>(
   context, 
   same, 
   edgesMatch?
): number;
```

Defined in: draw/autotile.ts:36

Compute the 4-bit edge mask for the context cell: a bit is set when the
neighbour on that side satisfies `same`. Out-of-bounds neighbours are treated
as matching by default (so a tile at the map edge reads as continuing off-map)
— pass `edgesMatch: false` to instead treat the void as a non-match.

## Type Parameters

### TCell

`TCell`

## Parameters

### context

[`TileContext`](Interface.TileContext.md)\<`TCell`\>

The cell to compute the mask for.

### same

(`cell`) => `boolean`

Predicate deciding whether a neighbour belongs to the same group.

### edgesMatch?

`boolean` = `true`

Whether out-of-bounds neighbours count as matching (default true).

## Returns

`number`

The packed edge mask (bitwise OR of [EdgeBit](Enumeration.EdgeBit.md) values).
