[**rune**](README.md)

***

[rune](README.md) / TerminalSpriteAsset

# Class: TerminalSpriteAsset

Defined in: assets/sprite.ts:26

Asset wrapping one or more terminal sprites (a standalone sprite and/or a set
of animation clips) resolved against named character legends.

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

Defined in: assets/sprite.ts:42

Whether this asset has any animation clips.

##### Returns

`boolean`

***

### isStandalone

#### Get Signature

```ts
get isStandalone(): boolean;
```

Defined in: assets/sprite.ts:37

Whether this asset has a standalone (non-animated) sprite.

##### Returns

`boolean`

***

### standalone

#### Get Signature

```ts
get standalone(): Sprite;
```

Defined in: assets/sprite.ts:51

The standalone sprite.

##### Returns

[`Sprite`](Class.Sprite.md)

The standalone [Sprite](Class.Sprite.md).

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
createAnimation(initial?): AnimatedSprite<Sprite>;
```

Defined in: assets/sprite.ts:83

Build a runnable [AnimatedSprite](Class.AnimatedSprite.md) from this asset's clips.

#### Parameters

##### initial?

`string`

Optional clip to play first; defaults to the first clip.

#### Returns

[`AnimatedSprite`](Class.AnimatedSprite.md)\<[`Sprite`](Class.Sprite.md)\>

A new [AnimatedSprite](Class.AnimatedSprite.md).

***

### getClip()

```ts
getClip(name): 
  | AnimationClip<Sprite>
  | undefined;
```

Defined in: assets/sprite.ts:64

Look up a clip by name.

#### Parameters

##### name

`string`

Clip name.

#### Returns

  \| [`AnimationClip`](Interface.AnimationClip.md)\<[`Sprite`](Class.Sprite.md)\>
  \| `undefined`

The clip, or `undefined` if not found.

***

### getClipNames()

```ts
getClipNames(): string[];
```

Defined in: assets/sprite.ts:73

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
static fromData(data, options): TerminalSpriteAsset;
```

Defined in: assets/sprite.ts:103

Build a TerminalSpriteAsset from parsed YAML data.

#### Parameters

##### data

[`TerminalSpriteAssetData`](Interface.TerminalSpriteAssetData.md)

Authored asset data.

##### options

[`AssetOptions`](Interface.AssetOptions.md)

Name and source path.

#### Returns

`TerminalSpriteAsset`

A new TerminalSpriteAsset.

***

### fromYaml()

```ts
static fromYaml(path): TerminalSpriteAsset;
```

Defined in: assets/sprite.ts:137

Load and build a TerminalSpriteAsset from a YAML file.

#### Parameters

##### path

`string`

Path to the YAML file.

#### Returns

`TerminalSpriteAsset`

A new TerminalSpriteAsset.
