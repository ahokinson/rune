[**rune**](README.md)

***

[rune](README.md) / PixelSpriteAsset

# Class: PixelSpriteAsset

Defined in: assets/pixelSprite.ts:26

Asset wrapping one or more pixel sprites (a standalone sprite and/or a set of
animation clips) resolved against named pixel legends.

## Extends

- [`Asset`](Class.Asset.md)

## Properties

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

## Accessors

### isAnimated

#### Get Signature

```ts
get isAnimated(): boolean;
```

Defined in: assets/pixelSprite.ts:49

Whether this asset has any animation clips.

##### Returns

`boolean`

***

### isStandalone

#### Get Signature

```ts
get isStandalone(): boolean;
```

Defined in: assets/pixelSprite.ts:44

Whether this asset has a standalone (non-animated) sprite.

##### Returns

`boolean`

***

### standalone

#### Get Signature

```ts
get standalone(): PixelSprite;
```

Defined in: assets/pixelSprite.ts:58

The standalone sprite.

##### Returns

[`PixelSprite`](Class.PixelSprite.md)

The standalone [PixelSprite](Class.PixelSprite.md).

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

[`Ref`](Class.Ref.md)\<[`Asset`](Class.Asset.md)\>[]

All refs found on this asset.

#### Inherited from

[`Asset`](Class.Asset.md).[`collectRefs`](Class.Asset.md#collectrefs)

***

### createAnimation()

```ts
createAnimation(initial?): AnimatedSprite<PixelSprite>;
```

Defined in: assets/pixelSprite.ts:90

Build a runnable [AnimatedSprite](Class.AnimatedSprite.md) from this asset's clips.

#### Parameters

##### initial?

`string`

Optional clip to play first; defaults to the first clip.

#### Returns

[`AnimatedSprite`](Class.AnimatedSprite.md)\<[`PixelSprite`](Class.PixelSprite.md)\>

A new [AnimatedSprite](Class.AnimatedSprite.md).

***

### getClip()

```ts
getClip(name): 
  | AnimationClip<PixelSprite>
  | undefined;
```

Defined in: assets/pixelSprite.ts:71

Look up a clip by name.

#### Parameters

##### name

`string`

Clip name.

#### Returns

  \| [`AnimationClip`](Interface.AnimationClip.md)\<[`PixelSprite`](Class.PixelSprite.md)\>
  \| `undefined`

The clip, or `undefined` if not found.

***

### getClipNames()

```ts
getClipNames(): string[];
```

Defined in: assets/pixelSprite.ts:80

List all clip names.

#### Returns

`string`[]

A new array of clip names.

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

***

### fromData()

```ts
static fromData(data, options): PixelSpriteAsset;
```

Defined in: assets/pixelSprite.ts:110

Build a PixelSpriteAsset from parsed YAML data.

#### Parameters

##### data

[`PixelSpriteAssetData`](Interface.PixelSpriteAssetData.md)

Authored asset data.

##### options

[`AssetOptions`](Interface.AssetOptions.md)

Name and source path.

#### Returns

`PixelSpriteAsset`

A new PixelSpriteAsset.

***

### fromYaml()

```ts
static fromYaml(path): PixelSpriteAsset;
```

Defined in: assets/pixelSprite.ts:145

Load and build a PixelSpriteAsset from a YAML file.

#### Parameters

##### path

`string`

Path to the YAML file.

#### Returns

`PixelSpriteAsset`

A new PixelSpriteAsset.
