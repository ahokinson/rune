[**rune**](README.md)

***

[rune](README.md) / MazeOptions

# Interface: MazeOptions

Defined in: worldgen/maze.ts:20

Options for [generateMaze](Function.generateMaze.md).

## Properties

### branchiness?

```ts
optional branchiness?: number;
```

Defined in: worldgen/maze.ts:35

0 → always extend from the newest frontier cell (long corridors, default);
1 → always pick a random frontier cell (short branchy passages). Values
between blend the two.

***

### height

```ts
height: number;
```

Defined in: worldgen/maze.ts:27

Cell height (output is `2·height+1` tiles tall).

***

### seed?

```ts
optional seed?: number;
```

Defined in: worldgen/maze.ts:29

RNG seed (default 0).

***

### width

```ts
width: number;
```

Defined in: worldgen/maze.ts:25

Cell counts (not tile counts). The output TileMap is
`(2·width+1)×(2·height+1)` so every cell is ringed by walls.
