[**rune**](README.md)

***

[rune](README.md) / AssetPack

# Class: AssetPack

Defined in: assets/pack.ts:45

A mounted directory of assets, keyed by name.

Construct one with [AssetPack.mount](#mount); then look up assets with
[get](#get), [tryGet](#tryget), or [getAll](#getall).

## Properties

### rootDir

```ts
readonly rootDir: string;
```

Defined in: assets/pack.ts:48

Absolute path to the pack's root directory.

## Accessors

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: assets/pack.ts:210

Number of assets in the pack.

##### Returns

`number`

## Methods

### get()

```ts
get<T>(name): T;
```

Defined in: assets/pack.ts:165

Look up an asset by name, throwing if it is missing.

#### Type Parameters

##### T

`T` *extends* [`Asset`](Class.Asset.md) = [`Asset`](Class.Asset.md)

#### Parameters

##### name

`string`

Asset name.

#### Returns

`T`

The asset, cast to `T`.

***

### getAll()

```ts
getAll<T>(cls): T[];
```

Defined in: assets/pack.ts:189

Return every asset in the pack that is an instance of `cls`.

#### Type Parameters

##### T

`T` *extends* [`Asset`](Class.Asset.md)

#### Parameters

##### cls

[`AssetClass`](Interface.AssetClass.md)\<`T`\>

Class to filter by.

#### Returns

`T`[]

All matching assets.

***

### has()

```ts
has(name): boolean;
```

Defined in: assets/pack.ts:205

Check whether an asset with `name` exists in the pack.

#### Parameters

##### name

`string`

Asset name.

#### Returns

`boolean`

`true` if present.

***

### names()

```ts
names(): string[];
```

Defined in: assets/pack.ts:219

List all asset names in the pack.

#### Returns

`string`[]

A new array of names.

***

### tryGet()

```ts
tryGet<T>(name): T | undefined;
```

Defined in: assets/pack.ts:179

Look up an asset by name, returning `undefined` if missing.

#### Type Parameters

##### T

`T` *extends* [`Asset`](Class.Asset.md) = [`Asset`](Class.Asset.md)

#### Parameters

##### name

`string`

Asset name.

#### Returns

`T` \| `undefined`

The asset cast to `T`, or `undefined`.

***

### mount()

```ts
static mount(rootDir, types): AssetPack;
```

Defined in: assets/pack.ts:63

Mount a pack: read its manifest, parse each listed asset through its
registered class's schema, resolve inter-asset [Ref](Class.Ref.md)s, and run each
class's `finalize` hook.

#### Parameters

##### rootDir

`string`

Pack root containing `manifest.yaml`.

##### types

`Record`\<`string`, [`AssetClass`](Interface.AssetClass.md)\>

Map of asset `type` string to [AssetClass](Interface.AssetClass.md).

#### Returns

`AssetPack`

A populated AssetPack.

***

### mountAsync()

```ts
static mountAsync(rootDir, types): Promise<AssetPack>;
```

Defined in: assets/pack.ts:88

Async counterpart to [mount](#mount): read the manifest and every asset file
via async I/O (concurrently), then parse, resolve [Ref](Class.Ref.md)s, and finalize
exactly as [mount](#mount) does. Prefer this for larger packs where blocking
the event loop on synchronous reads is undesirable.

#### Parameters

##### rootDir

`string`

Pack root containing `manifest.yaml`.

##### types

`Record`\<`string`, [`AssetClass`](Interface.AssetClass.md)\>

Map of asset `type` string to [AssetClass](Interface.AssetClass.md).

#### Returns

`Promise`\<`AssetPack`\>

A promise of a populated AssetPack.
