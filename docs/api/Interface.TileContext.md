[**rune**](README.md)

***

[rune](README.md) / TileContext

# Interface: TileContext\<TCell\>

Defined in: draw/tileSet.ts:17

Passed to a neighbour-aware appearance so it can vary a tile by what surrounds
it (a pipe rim only where the tile above is open, ground edges, autotiling).

## Type Parameters

### TCell

`TCell`

## Properties

### column

```ts
column: number;
```

Defined in: draw/tileSet.ts:21

Column index of the cell.

***

### row

```ts
row: number;
```

Defined in: draw/tileSet.ts:23

Row index of the cell.

***

### tileMap

```ts
tileMap: TileMap<TCell>;
```

Defined in: draw/tileSet.ts:19

The tile map the cell lives in.
