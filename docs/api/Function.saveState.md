[**rune**](README.md)

***

[rune](README.md) / saveState

# Function: saveState()

```ts
function saveState(value): string;
```

Defined in: replay/snapshot.ts:58

Encode a snapshot for persistence (the stable string is the save format).

## Parameters

### value

[`Serializable`](TypeAlias.Serializable.md)

Plain-data value to save.

## Returns

`string`

The stable serialisation of `value`.
