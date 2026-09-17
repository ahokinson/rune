[**rune**](README.md)

***

[rune](README.md) / loadTileMap

# Function: loadTileMap()

```ts
function loadTileMap<TCell, TCellSpec, TMarkerSpec>(path, options): TileMapData<TCell, TMarkerSpec>;
```

Defined in: world/tileDocument.ts:186

Load and build a tile map from a YAML document on disk.

## Type Parameters

### TCell

`TCell`

Grid cell type.

### TCellSpec

`TCellSpec` = `unknown`

Game-defined terrain spec carried per legend symbol.

### TMarkerSpec

`TMarkerSpec` = `unknown`

Game-defined spawn spec carried per marker symbol.

## Parameters

### path

`string`

Path to the YAML file.

### options

[`BuildTileMapOptions`](Interface.BuildTileMapOptions.md)\<`TCell`, `TCellSpec`\>

Build callbacks and overrides.

## Returns

[`TileMapData`](Interface.TileMapData.md)\<`TCell`, `TMarkerSpec`\>

The built tile map, markers, meta, and dimensions.
