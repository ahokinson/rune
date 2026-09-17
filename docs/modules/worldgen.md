# worldgen

Procedural layout generation: mazes, room-and-corridor dungeons (BSP), and tiled wave-function collapse. Each generator is deterministic given a seed (via [math](math.md)'s [`Random`](../api/Class.Random.md)) so a layout reproduces exactly — useful for replays and shared seeds.

## Overview

Three generators with distinct shapes. [`generateMaze`](../api/Function.generateMaze.md) produces a perfect maze via the growing-tree algorithm, returning a [`TileMap`](../api/Class.TileMap.md) of [`Cell`](../api/Enumeration.Cell.md) (`Empty` / `Wall`). [`generateDungeon`](../api/Function.generateDungeon.md) carves a room-and-corridor dungeon via BSP, returning a [`DungeonResult`](../api/Interface.DungeonResult.md) — the tile map plus the carved [`DungeonRoom`](../api/Interface.DungeonRoom.md) rectangles so you can place doors, loot, and spawns per room. [`generateWaveCollapse`](../api/Function.generateWaveCollapse.md) solves a tiled wave-function-collapse from adjacency rules keyed by [`Direction`](../api/Enumeration.Direction.md), returning a [`WaveCollapseResult`](../api/Interface.WaveCollapseResult.md).

All three take an options object with width/height/seed and the generator-specific knobs. The outputs feed straight into [world](world.md)'s [`TileMap`](../api/Class.TileMap.md) for rendering through a [`TileLayer`](../api/Class.TileLayer.md).

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `cell.ts` | [`Cell`](../api/Enumeration.Cell.md) | Two-state tile enum (`Empty` / `Wall`). |
| `maze.ts` | [`generateMaze`](../api/Function.generateMaze.md), [`MazeOptions`](../api/Interface.MazeOptions.md) | Growing-tree perfect maze. |
| `dungeon.ts` | [`generateDungeon`](../api/Function.generateDungeon.md), [`DungeonOptions`](../api/Interface.DungeonOptions.md), [`DungeonResult`](../api/Interface.DungeonResult.md), [`DungeonRoom`](../api/Interface.DungeonRoom.md) | BSP room-and-corridor dungeon. |
| `waveCollapse.ts` | [`generateWaveCollapse`](../api/Function.generateWaveCollapse.md), [`WaveCollapseOptions`](../api/Interface.WaveCollapseOptions.md), [`WaveCollapseResult`](../api/Interface.WaveCollapseResult.md), [`Direction`](../api/Enumeration.Direction.md) | Tiled wave-function collapse. |

## Key types

### Functions
- [`generateMaze`](../api/Function.generateMaze.md) — Perfect maze via the growing-tree algorithm; returns a [`TileMap`](../api/Class.TileMap.md)<[`Cell`](../api/Enumeration.Cell.md)>.
- [`generateDungeon`](../api/Function.generateDungeon.md) — Room-and-corridor dungeon via BSP; returns the tile map plus carved rooms.
- [`generateWaveCollapse`](../api/Function.generateWaveCollapse.md) — Solve a tiled WFC from adjacency rules.

### Types & interfaces
- [`MazeOptions`](../api/Interface.MazeOptions.md) — Width, height, seed, and growing-tree bias.
- [`DungeonOptions`](../api/Interface.DungeonOptions.md) / [`DungeonResult`](../api/Interface.DungeonResult.md) / [`DungeonRoom`](../api/Interface.DungeonRoom.md) — Dungeon config + result (tile map + rooms) + a carved room rectangle.
- [`WaveCollapseOptions`](../api/Interface.WaveCollapseOptions.md) / [`WaveCollapseResult`](../api/Interface.WaveCollapseResult.md) — Adjacency rules + dimensions / solved tile grid.

### Enums
- [`Cell`](../api/Enumeration.Cell.md) — `Empty` / `Wall`, used by the maze and dungeon generators.
- [`Direction`](../api/Enumeration.Direction.md) — Cardinal direction indexing the WFC adjacency rules.

## Usage

```ts
import { generateDungeon, Random } from "@ahokinson/rune"

const random = new Random(12345)
const { tiles, rooms } = generateDungeon({
  width: 64,
  height: 32,
  seed: random.next(),
  minRoomSize: 4,
  maxRoomSize: 9,
})

// Place something in each carved room.
for (const room of rooms) {
  const cx = room.x + Math.floor(room.width / 2)
  const cy = room.y + Math.floor(room.height / 2)
  spawnEnemy(cx, cy)
}
```

## See also

- [world](world.md) — [`TileMap`](../api/Class.TileMap.md), [`TileMeta`](../api/Class.TileMeta.md), authored tile documents.
- [math](math.md) — [`Random`](../api/Class.Random.md) for deterministic seeds.
- [scene](scene.md) — [`TileLayer`](../api/Class.TileLayer.md) renders a `TileMap` through a [`TileSet`](../api/Class.TileSet.md).
