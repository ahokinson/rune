[**rune**](README.md)

***

[rune](README.md) / TileMapAsset

# Class: TileMapAsset\<TCellSpec, TMarkerSpec\>

Defined in: assets/tileMap.ts:19

An authored tile map loaded through the asset system, so maps sit alongside
sprites and themes in an AssetPack manifest. The raw document is parsed by the
schema; games subclass this and call [build](#build) from their own `finalize`
to turn the legend into concrete cells and attach any domain extras (light
grids, theme refs, door bookkeeping). The standalone `loadTileMap` covers code
that does not need a pack.

## Extends

- [`Asset`](Class.Asset.md)

## Type Parameters

### TCellSpec

`TCellSpec` = `unknown`

### TMarkerSpec

`TMarkerSpec` = `unknown`

## Constructors

### Constructor

```ts
new TileMapAsset<TCellSpec, TMarkerSpec>(options): TileMapAsset<TCellSpec, TMarkerSpec>;
```

Defined in: assets/asset.ts:55

#### Parameters

##### options

[`AssetOptions`](Interface.AssetOptions.md)

Name and source path.

#### Returns

`TileMapAsset`\<`TCellSpec`, `TMarkerSpec`\>

#### Inherited from

[`Asset`](Class.Asset.md).[`constructor`](Class.Asset.md#constructor)

## Properties

### document

```ts
document: TileMapDocument<TCellSpec, TMarkerSpec>;
```

Defined in: assets/tileMap.ts:21

The raw authored tile-map document.

***

### name

```ts
readonly name: string;
```

Defined in: assets/asset.ts:48

Unique name of this asset within its pack.

#### Inherited from

[`Asset`](Class.Asset.md).[`name`](Class.Asset.md#name)

***

### path

```ts
readonly path: string;
```

Defined in: assets/asset.ts:50

Absolute path to this asset's source file.

#### Inherited from

[`Asset`](Class.Asset.md).[`path`](Class.Asset.md#path)

***

### schema

```ts
static schema: object;
```

Defined in: assets/tileMap.ts:24

Schema declaring the `document` field parsed from YAML.

#### document

```ts
readonly document: Slot<TileMapDocument<unknown, unknown>>;
```

## Methods

### build()

```ts
build<TCell>(options): TileMapData<TCell, TMarkerSpec>;
```

Defined in: assets/tileMap.ts:34

Build a concrete tile map from this asset's document and a legend resolver.

#### Type Parameters

##### TCell

`TCell`

#### Parameters

##### options

[`BuildTileMapOptions`](Interface.BuildTileMapOptions.md)\<`TCell`, `TCellSpec`\>

Cell-building options (legend, markers, …).

#### Returns

[`TileMapData`](Interface.TileMapData.md)\<`TCell`, `TMarkerSpec`\>

The built [TileMapData](Interface.TileMapData.md).

***

### collectRefs()

```ts
collectRefs(): Ref<Asset>[];
```

Defined in: assets/asset.ts:87

Walk the class schema and collect every [Ref](Class.Ref.md) field, binding each
ref's source to this asset so unresolved references can be reported with
`asset.field` context.

#### Returns

[`Ref`](Class.Ref.md)\<[`Asset`](Class.Asset.md)\>[]

All refs found on this asset.

#### Inherited from

[`Asset`](Class.Asset.md).[`collectRefs`](Class.Asset.md#collectrefs)

***

### getField()

```ts
getField(key): unknown;
```

Defined in: assets/asset.ts:76

Read a schema field by key.

#### Parameters

##### key

`string`

Field name declared in the schema.

#### Returns

`unknown`

The current value (or `undefined` if unset).

#### Inherited from

[`Asset`](Class.Asset.md).[`getField`](Class.Asset.md#getfield)

***

### setField()

```ts
setField(key, value): void;
```

Defined in: assets/asset.ts:66

Set a schema field by key. Used by the pack loader while parsing.

#### Parameters

##### key

`string`

Field name declared in the schema.

##### value

`unknown`

Parsed value to assign.

#### Returns

`void`

#### Inherited from

[`Asset`](Class.Asset.md).[`setField`](Class.Asset.md#setfield)
