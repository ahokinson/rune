[**rune**](README.md)

***

[rune](README.md) / lineOfSight

# Function: lineOfSight()

```ts
function lineOfSight(
   from, 
   to, 
   isBlocking
): boolean;
```

Defined in: physics/grid.ts:45

Bresenham line-of-sight from `from` to `to`: walks the cells the line crosses
and returns `false` as soon as `isBlocking` rejects one.

## Parameters

### from

[`Vector2`](Class.Vector2.md)

Start point (its starting cell is never tested).

### to

[`Vector2`](Class.Vector2.md)

End point.

### isBlocking

[`CellPredicate`](TypeAlias.CellPredicate.md)

Returns `true` if the given cell blocks the line.

## Returns

`boolean`

`true` if no blocking cell lies between `from` and `to`.
