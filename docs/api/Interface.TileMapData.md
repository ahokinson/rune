[**rune**](README.md)

***

[rune](README.md) / TileMapData

# Interface: TileMapData\<TCell, TMarkerSpec\>

Defined in: world/tileDocument.ts:67

Result of building a tile map from a [TileMapDocument](Interface.TileMapDocument.md).

## Type Parameters

### TCell

`TCell`

Grid cell type.

### TMarkerSpec

`TMarkerSpec` = `unknown`

Game-defined spawn spec carried per marker symbol.

## Properties

### height

```ts
height: number;
```

Defined in: world/tileDocument.ts:79

Dimensions in tiles.

***

### markers

```ts
markers: TileMarker<TMarkerSpec>[];
```

Defined in: world/tileDocument.ts:71

Scanned-out markers with world positions.

***

### meta

```ts
meta: TileMeta<unknown>;
```

Defined in: world/tileDocument.ts:73

A side-table the caller can populate from the legend/markers (e.g. block payloads). Empty unless `cell`/marker code writes to it via the build hook.

***

### tileMap

```ts
tileMap: TileMap<TCell>;
```

Defined in: world/tileDocument.ts:69

Terrain grid.

***

### tileSize

```ts
tileSize: number;
```

Defined in: world/tileDocument.ts:75

Tile span of one tile, in cells.

***

### width

```ts
width: number;
```

Defined in: world/tileDocument.ts:77

Dimensions in tiles.
