[**rune**](README.md)

***

[rune](README.md) / TileMarker

# Interface: TileMarker\<TMarkerSpec\>

Defined in: world/tileDocument.ts:48

A scanned-out marker occurrence with its world position.

## Type Parameters

### TMarkerSpec

`TMarkerSpec` = `unknown`

Game-defined spawn spec carried per marker symbol.

## Properties

### column

```ts
column: number;
```

Defined in: world/tileDocument.ts:54

Tile coordinates in the layout.

***

### position

```ts
position: Vector2;
```

Defined in: world/tileDocument.ts:58

World position, in cells, derived from the tile coordinate, the tile size, and the requested anchor.

***

### row

```ts
row: number;
```

Defined in: world/tileDocument.ts:56

Tile coordinates in the layout.

***

### spec

```ts
spec: TMarkerSpec;
```

Defined in: world/tileDocument.ts:52

Spec from `document.markers` for `symbol`.

***

### symbol

```ts
symbol: string;
```

Defined in: world/tileDocument.ts:50

Legend symbol that produced this marker.
