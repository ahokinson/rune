[**rune**](README.md)

***

[rune](README.md) / cellAt

# Function: cellAt()

```ts
function cellAt(point, cellSize): GridCell;
```

Defined in: physics/grid.ts:25

Map a world-space point to its containing grid cell.

## Parameters

### point

[`Vector2`](Class.Vector2.md)

World-space position.

### cellSize

`number`

Width of one cell (`0` is treated as `1`).

## Returns

[`GridCell`](Interface.GridCell.md)

The cell the point falls within.
