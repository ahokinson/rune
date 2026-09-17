[**rune**](README.md)

***

[rune](README.md) / Ref

# Class: Ref\<T\>

Defined in: assets/ref.ts:21

A named pointer to another asset, resolved lazily by the pack loader.

## Type Parameters

### T

`T` *extends* [`Asset`](Class.Asset.md) = [`Asset`](Class.Asset.md)

## Constructors

### Constructor

```ts
new Ref<T>(name): Ref<T>;
```

Defined in: assets/ref.ts:31

#### Parameters

##### name

`string`

Name of the referenced asset.

#### Returns

`Ref`\<`T`\>

## Properties

### name

```ts
readonly name: string;
```

Defined in: assets/ref.ts:23

Name of the referenced asset.

## Accessors

### isResolved

#### Get Signature

```ts
get isResolved(): boolean;
```

Defined in: assets/ref.ts:74

Whether the target has been resolved.

##### Returns

`boolean`

## Methods

### bindSource()

```ts
bindSource(sourceAsset, sourceField): void;
```

Defined in: assets/ref.ts:42

Record which asset and field holds this ref, for error reporting when the
ref cannot be resolved.

#### Parameters

##### sourceAsset

`string`

Name of the owning asset.

##### sourceField

`string`

Field name on the owning asset.

#### Returns

`void`

***

### get()

```ts
get(): T;
```

Defined in: assets/ref.ts:66

Get the resolved target asset.

#### Returns

`T`

The resolved asset.

***

### resolve()

```ts
resolve(ctx): void;
```

Defined in: assets/ref.ts:52

Resolve this ref against a context, throwing if the target is missing.

#### Parameters

##### ctx

[`RefResolveContext`](Interface.RefResolveContext.md)

Lookup context (typically the [AssetPack](Class.AssetPack.md)).

#### Returns

`void`
