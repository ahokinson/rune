[**rune**](README.md)

***

[rune](README.md) / data

# Function: data()

```ts
function data<T>(pick?): Slot<T>;
```

Defined in: assets/slot.ts:121

Build a slot that returns raw data, optionally projected through `pick`.

## Type Parameters

### T

`T`

## Parameters

### pick?

(`raw`) => `T`

Optional projection from raw YAML to `T`.

## Returns

[`Slot`](Interface.Slot.md)\<`T`\>

A slot returning the raw value (or its projection).
