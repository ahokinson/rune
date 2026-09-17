[**rune**](README.md)

***

[rune](README.md) / ref

# Function: ref()

```ts
function ref<T>(): Slot<Ref<T>>;
```

Defined in: assets/slot.ts:134

Build a slot that parses a [Ref](Class.Ref.md) to another asset by name.

## Type Parameters

### T

`T` *extends* [`Asset`](Class.Asset.md) = [`Asset`](Class.Asset.md)

## Returns

[`Slot`](Interface.Slot.md)\<[`Ref`](Class.Ref.md)\<`T`\>\>

A slot producing a [Ref](Class.Ref.md) of `T`.
