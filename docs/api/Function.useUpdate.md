[**rune**](README.md)

***

[rune](README.md) / useUpdate

# Function: useUpdate()

```ts
function useUpdate(callback): void;
```

Defined in: hooks.ts:136

Register a callback fired once per rendered frame. The registration is
automatically removed when the calling component unmounts.

## Parameters

### callback

[`UpdateCallback`](TypeAlias.UpdateCallback.md)

Invoked with `(deltaMilliseconds)` each frame.

## Returns

`void`
