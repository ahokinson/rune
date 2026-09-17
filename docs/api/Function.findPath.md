[**rune**](README.md)

***

[rune](README.md) / findPath

# Function: findPath()

```ts
function findPath(
   start, 
   goal, 
   isPassable, 
   options?
): GridCell[] | null;
```

Defined in: ai/pathfind.ts:165

Find a path of grid cells from `start` to `goal` using A*.

## Parameters

### start

[`GridCell`](Interface.GridCell.md)

Start cell.

### goal

[`GridCell`](Interface.GridCell.md)

Goal cell.

### isPassable

[`CellPredicate`](TypeAlias.CellPredicate.md)

Predicate reporting whether a cell is walkable.

### options?

[`PathfindOptions`](Interface.PathfindOptions.md) = `{}`

Optional heuristic, diagonal, and iteration-cap configuration.

## Returns

[`GridCell`](Interface.GridCell.md)[] \| `null`

Cells from `start` to `goal` inclusive, or `null` if no route exists (or the goal is impassable, or the iteration cap is hit).
