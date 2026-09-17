[**rune**](README.md)

***

[rune](README.md) / DungeonResult

# Interface: DungeonResult

Defined in: worldgen/dungeon.ts:29

Result of [generateDungeon](Function.generateDungeon.md): the tile map plus the carved rooms.

## Properties

### map

```ts
map: TileMap<Cell>;
```

Defined in: worldgen/dungeon.ts:31

Tile map of [Cell](Enumeration.Cell.md) values.

***

### rooms

```ts
rooms: DungeonRoom[];
```

Defined in: worldgen/dungeon.ts:33

Carved rooms (place player/stairs/loot at their centres).
