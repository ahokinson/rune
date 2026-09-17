[**rune**](README.md)

***

[rune](README.md) / buildTileMap

# Function: buildTileMap()

```ts
function buildTileMap<TCell, TCellSpec, TMarkerSpec>(document, options): TileMapData<TCell, TMarkerSpec>;
```

Defined in: world/tileDocument.ts:132

Build a tile map from an authored document. The terrain grid comes from
`TileMap.fromString` over the legend; marker symbols are scanned out of the
same layout into world-positioned TileMarkers. This is the shared core both the
standalone loader and `TileMapAsset` delegate to.

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

### document

[`TileMapDocument`](Interface.TileMapDocument.md)\<`TCellSpec`, `TMarkerSpec`\>

The authored map shape.

### options

[`BuildTileMapOptions`](Interface.BuildTileMapOptions.md)\<`TCell`, `TCellSpec`\>

Build callbacks and overrides.

## Returns

[`TileMapData`](Interface.TileMapData.md)\<`TCell`, `TMarkerSpec`\>

The built tile map, markers, meta, and dimensions.
