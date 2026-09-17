[**rune**](README.md)

***

[rune](README.md) / Asset

# Abstract Class: Asset

Defined in: assets/asset.ts:46

Base class for all pack-resolved assets.

Subclasses populate typed fields via a static [schema](Interface.AssetClass.md#schema)
of [Slot](Interface.Slot.md)s; the pack loader sets fields through [setField](#setfield) and then
collects inter-asset [Ref](Class.Ref.md)s through [collectRefs](#collectrefs).

## Extended by

- [`PixelSpriteAsset`](Class.PixelSpriteAsset.md)
- [`TerminalSpriteAsset`](Class.TerminalSpriteAsset.md)
- [`TileMapAsset`](Class.TileMapAsset.md)

## Constructors

### Constructor

```ts
new Asset(options): Asset;
```

Defined in: assets/asset.ts:55

#### Parameters

##### options

[`AssetOptions`](Interface.AssetOptions.md)

Name and source path.

#### Returns

`Asset`

## Properties

### name

```ts
readonly name: string;
```

Defined in: assets/asset.ts:48

Unique name of this asset within its pack.

***

### path

```ts
readonly path: string;
```

Defined in: assets/asset.ts:50

Absolute path to this asset's source file.

## Methods

### collectRefs()

```ts
collectRefs(): Ref<Asset>[];
```

Defined in: assets/asset.ts:87

Walk the class schema and collect every [Ref](Class.Ref.md) field, binding each
ref's source to this asset so unresolved references can be reported with
`asset.field` context.

#### Returns

[`Ref`](Class.Ref.md)\<`Asset`\>[]

All refs found on this asset.

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
