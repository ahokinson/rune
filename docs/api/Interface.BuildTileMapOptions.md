[**rune**](README.md)

***

[rune](README.md) / BuildTileMapOptions

# Interface: BuildTileMapOptions\<TCell, TCellSpec\>

Defined in: world/tileDocument.ts:88

Build-time callbacks and overrides for [buildTileMap](Function.buildTileMap.md).

## Type Parameters

### TCell

`TCell`

Grid cell type.

### TCellSpec

`TCellSpec` = `unknown`

Game-defined terrain spec carried per legend symbol.

## Properties

### anchor?

```ts
optional anchor?: TileAnchor;
```

Defined in: world/tileDocument.ts:94

World-position anchor for markers. Defaults to [TileAnchor.Center](Enumeration.TileAnchor.md#center).

***

### fallback

```ts
fallback: TCell;
```

Defined in: world/tileDocument.ts:92

The cell every untouched/blank/marker tile holds.

## Methods

### cell()

```ts
cell(spec, symbol): TCell;
```

Defined in: world/tileDocument.ts:90

Turn a legend spec into the grid cell stored for that symbol.

#### Parameters

##### spec

`TCellSpec`

##### symbol

`string`

#### Returns

`TCell`

***

### isMarker()?

```ts
optional isMarker(symbol): boolean;
```

Defined in: world/tileDocument.ts:96

Override which symbols are treated as markers. Defaults to "every symbol present in `document.markers`".

#### Parameters

##### symbol

`string`

#### Returns

`boolean`
