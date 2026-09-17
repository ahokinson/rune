[**rune**](README.md)

***

[rune](README.md) / AssetClass

# Interface: AssetClass\<T\>

Defined in: assets/asset.ts:33

Constructor type for an [Asset](Class.Asset.md) subclass.

Optionally carries a static `schema` used by the pack loader to parse fields,
and an optional `finalize` hook invoked after all refs are resolved.

## Type Parameters

### T

`T` *extends* [`Asset`](Class.Asset.md) = [`Asset`](Class.Asset.md)

## Constructors

### Constructor

```ts
new AssetClass(options): T;
```

Defined in: assets/asset.ts:34

#### Parameters

##### options

[`AssetOptions`](Interface.AssetOptions.md)

#### Returns

`T`

## Properties

### schema?

```ts
optional schema?: Readonly<Record<string, Slot<unknown>>>;
```

Defined in: assets/asset.ts:35

## Methods

### finalize()?

```ts
optional finalize(asset, ctx): void;
```

Defined in: assets/asset.ts:36

#### Parameters

##### asset

`T`

##### ctx

###### get

###### tryGet

#### Returns

`void`
