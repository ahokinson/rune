[**rune**](README.md)

***

[rune](README.md) / DungeonOptions

# Interface: DungeonOptions

Defined in: worldgen/dungeon.ts:37

Options for [generateDungeon](Function.generateDungeon.md).

## Properties

### height

```ts
height: number;
```

Defined in: worldgen/dungeon.ts:41

Map height in cells.

***

### minLeafSize?

```ts
optional minLeafSize?: number;
```

Defined in: worldgen/dungeon.ts:45

Stop splitting a region once it is below this size; larger → fewer, bigger rooms.

***

### minRoomSize?

```ts
optional minRoomSize?: number;
```

Defined in: worldgen/dungeon.ts:47

Smallest room edge length.

***

### seed?

```ts
optional seed?: number;
```

Defined in: worldgen/dungeon.ts:43

RNG seed (default 0).

***

### width

```ts
width: number;
```

Defined in: worldgen/dungeon.ts:39

Map width in cells.
