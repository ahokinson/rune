[**rune**](README.md)

***

[rune](README.md) / Slot

# Interface: Slot\<T\>

Defined in: assets/slot.ts:32

A parser for one field of an asset's schema.

## Type Parameters

### T

`T`

## Methods

### parse()

```ts
parse(raw, ctx): T;
```

Defined in: assets/slot.ts:40

Parse the raw YAML for this field into a typed value.

#### Parameters

##### raw

`any`

The raw YAML for the whole asset.

##### ctx

[`ParseContext`](Interface.ParseContext.md)

Field/asset context.

#### Returns

`T`

The parsed value.
