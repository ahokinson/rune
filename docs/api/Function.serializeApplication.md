[**rune**](README.md)

***

[rune](README.md) / serializeApplication

# Function: serializeApplication()

```ts
function serializeApplication(handle, registry?): InspectorSnapshot;
```

Defined in: inspect/snapshot.ts:35

Serialize the live application into a single snapshot. When a `registry` is
passed it is cleared and repopulated with id -> entity for every node walked,
so the caller (the server) can resolve an incoming edit back to its entity.

## Parameters

### handle

[`ApplicationHandle`](Interface.ApplicationHandle.md)

The running application handle.

### registry?

`Map`\<`number`, [`Entity`](Class.Entity.md)\>

Optional map to repopulate with id -> entity.

## Returns

[`InspectorSnapshot`](Interface.InspectorSnapshot.md)

A full [InspectorSnapshot](Interface.InspectorSnapshot.md).
