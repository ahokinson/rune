[**rune**](README.md)

***

[rune](README.md) / generateDungeon

# Function: generateDungeon()

```ts
function generateDungeon(options): DungeonResult;
```

Defined in: worldgen/dungeon.ts:60

Generate a room-and-corridor dungeon via BSP.

## Parameters

### options

[`DungeonOptions`](Interface.DungeonOptions.md)

Dimensions, seed, and sizing knobs.

## Returns

[`DungeonResult`](Interface.DungeonResult.md)

The tile map and the list of carved rooms.
