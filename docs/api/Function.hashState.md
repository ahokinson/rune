[**rune**](README.md)

***

[rune](README.md) / hashState

# Function: hashState()

```ts
function hashState(value): number;
```

Defined in: replay/snapshot.ts:42

FNV-1a 32-bit hash of the stable serialisation — a compact fingerprint of the
whole state for cheap equality checks in determinism tests.

## Parameters

### value

[`Serializable`](TypeAlias.Serializable.md)

Plain-data value to hash.

## Returns

`number`

Unsigned 32-bit hash of [serializeState](Function.serializeState.md).
