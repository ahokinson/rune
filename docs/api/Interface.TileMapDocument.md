[**rune**](README.md)

***

[rune](README.md) / TileMapDocument

# Interface: TileMapDocument\<TCellSpec, TMarkerSpec\>

Defined in: world/tileDocument.ts:22

Authored YAML/document shape of a tile map.

## Type Parameters

### TCellSpec

`TCellSpec` = `unknown`

Game-defined terrain spec carried per legend symbol.

### TMarkerSpec

`TMarkerSpec` = `unknown`

Game-defined spawn spec carried per marker symbol.

## Properties

### layout

```ts
layout: string;
```

Defined in: world/tileDocument.ts:30

The grid. Rows are newline-separated; ragged rows are padded with the fallback cell.

***

### legend

```ts
legend: Record<string, TCellSpec>;
```

Defined in: world/tileDocument.ts:26

Symbol → terrain spec. A symbol absent here (and present in `markers`, or blank) leaves the grid cell at the fallback value.

***

### markers?

```ts
optional markers?: Record<string, TMarkerSpec>;
```

Defined in: world/tileDocument.ts:28

Symbol → spawn spec. These symbols are not terrain: the loader emits a TileMarker for each occurrence and leaves the underlying grid cell at the fallback (so a goomba glyph reads as empty floor, not a wall).

***

### tileSize?

```ts
optional tileSize?: number;
```

Defined in: world/tileDocument.ts:24

How many world cells one tile spans on a side. Defaults to 1.
