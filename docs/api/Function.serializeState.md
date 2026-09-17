[**rune**](README.md)

***

[rune](README.md) / serializeState

# Function: serializeState()

```ts
function serializeState(value): string;
```

Defined in: replay/snapshot.ts:24

Stable JSON: identical for two structurally equal values regardless of key
insertion order. Throws on cycles (state snapshots should be plain trees).

## Parameters

### value

[`Serializable`](TypeAlias.Serializable.md)

Plain-data value to serialize.

## Returns

`string`

Canonical JSON string with sorted object keys.
