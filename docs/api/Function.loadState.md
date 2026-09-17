[**rune**](README.md)

***

[rune](README.md) / loadState

# Function: loadState()

```ts
function loadState<T>(text): T;
```

Defined in: replay/snapshot.ts:69

Decode a snapshot produced by [saveState](Function.saveState.md).

## Type Parameters

### T

`T` *extends* [`Serializable`](TypeAlias.Serializable.md) = [`Serializable`](TypeAlias.Serializable.md)

Concrete shape to cast to.

## Parameters

### text

`string`

Stable serialisation produced by [saveState](Function.saveState.md).

## Returns

`T`

The parsed snapshot.
