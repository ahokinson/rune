[**rune**](README.md)

***

[rune](README.md) / generateMaze

# Function: generateMaze()

```ts
function generateMaze(options): TileMap<Cell>;
```

Defined in: worldgen/maze.ts:45

Generate a perfect maze via the growing-tree algorithm.

## Parameters

### options

[`MazeOptions`](Interface.MazeOptions.md)

Dimensions, seed, and branchiness.

## Returns

[`TileMap`](Class.TileMap.md)\<[`Cell`](Enumeration.Cell.md)\>

A `TileMap<Cell>` of size `(2·width+1)×(2·height+1)` with walls
  ringing every carved cell.
