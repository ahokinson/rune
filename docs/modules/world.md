# world

Tile maps: the in-memory grid, the authored YAML document shape, the loader that turns the document into concrete cells and markers, and a sparse per-cell side-table for extra metadata. Use this for level grids; render them through [scene](scene.md)'s [`TileLayer`](../api/Class.TileLayer.md) and a [draw](draw.md) [`TileSet`](../api/Class.TileSet.md).

## Overview

[`TileMap`](../api/Class.TileMap.md)<TCell> is a 2D grid of cells addressed by (column, row) — the runtime structure gameplay and rendering read from. [`TileMeta`](../api/Class.TileMeta.md)<T> is a sparse per-cell side-table keyed by (column, row) for domain extras that shouldn't bloat the cell type (door bookkeeping, light refs, spawn flags).

Authored levels are [`TileMapDocument`](../api/Interface.TileMapDocument.md)s — a legend mapping ASCII glyphs to cell specs, a marker legend for scanned-out entities, and the ASCII layout itself. [`buildTileMap`](../api/Function.buildTileMap.md) is the shared core that turns a document into a [`TileMapData`](../api/Interface.TileMapData.md): the terrain grid comes from `TileMap.fromString` over the legend, and marker symbols are scanned out of the same layout into world-positioned [`TileMarker`](../api/Interface.TileMarker.md)s (placed per [`TileAnchor`](../api/Enumeration.TileAnchor.md)). [`loadTileMap`](../api/Function.loadTileMap.md) is the standalone loader that reads a YAML document from disk and builds it; the asset-pack equivalent is [`TileMapAsset`](../api/Class.TileMapAsset.md) in [assets](assets.md).

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `tileMap.ts` | [`TileMap`](../api/Class.TileMap.md) | 2D grid of cells addressed by (column, row). |
| `tileDocument.ts` | [`buildTileMap`](../api/Function.buildTileMap.md), [`loadTileMap`](../api/Function.loadTileMap.md), [`TileMapDocument`](../api/Interface.TileMapDocument.md), [`TileMapData`](../api/Interface.TileMapData.md), [`TileMarker`](../api/Interface.TileMarker.md), [`TileAnchor`](../api/Enumeration.TileAnchor.md), [`BuildTileMapOptions`](../api/Interface.BuildTileMapOptions.md) | Authored document shape + loader. |
| `tileMeta.ts` | [`TileMeta`](../api/Class.TileMeta.md) | Sparse per-cell side-table. |

## Key types

### Classes
- [`TileMap`](../api/Class.TileMap.md) — 2D grid of cells addressed by (column, row).
- [`TileMeta`](../api/Class.TileMeta.md) — Sparse per-cell side-table keyed by (column, row).

### Functions
- [`loadTileMap`](../api/Function.loadTileMap.md) — Load and build a tile map from a YAML document on disk.
- [`buildTileMap`](../api/Function.buildTileMap.md) — Build a tile map from an authored document (shared by the loader and `TileMapAsset`).

### Types & interfaces
- [`TileMapDocument`](../api/Interface.TileMapDocument.md) — Authored YAML shape: cell legend, marker legend, ASCII layout.
- [`TileMapData`](../api/Interface.TileMapData.md) — Built result: the `TileMap` plus scanned-out markers.
- [`TileMarker`](../api/Interface.TileMarker.md) — A scanned-out marker occurrence with its world position.
- [`BuildTileMapOptions`](../api/Interface.BuildTileMapOptions.md) — Build-time callbacks and overrides for `buildTileMap`.

### Enums
- [`TileAnchor`](../api/Enumeration.TileAnchor.md) — How a marker's tile coordinate maps to a world position.

## Usage

```ts
import { loadTileMap, TileMap, TileMeta } from "@ahokinson/rune"

// Standalone: load an authored level straight from disk.
const level = loadTileMap<MyCell>("assets/world-1-1.yaml", {
  cellFor: (glyph) => cellFromLegend(glyph),
})

// Domain extras on a sparse side-table.
const doors = new TileMeta<DoorInfo>()
for (const marker of level.markers) {
  if (marker.symbol === "D") doors.set(marker.column, marker.row, openDoorInfo(marker))
}
```

## See also

- [assets](assets.md) — [`TileMapAsset`](../api/Class.TileMapAsset.md) for the asset-pack path.
- [scene](scene.md) — [`TileLayer`](../api/Class.TileLayer.md) renders a `TileMap` through a [`TileSet`](../api/Class.TileSet.md).
- [draw](draw.md) — [`TileSet`](../api/Class.TileSet.md), [`autoTile`](../api/Function.autoTile.md).
- [worldgen](worldgen.md) — procedural generators that produce [`TileMap`](../api/Class.TileMap.md)s.
- [Assets](../concepts/assets.md) — tile maps as assets.
