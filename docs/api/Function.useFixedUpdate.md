[**rune**](README.md)

***

[rune](README.md) / useFixedUpdate

# Function: useFixedUpdate()

```ts
function useFixedUpdate(callback): void;
```

Defined in: hooks.ts:124

Register a callback fired once per fixed-update tick. The registration is
automatically removed when the calling component unmounts.

## Parameters

### callback

[`FixedUpdateCallback`](TypeAlias.FixedUpdateCallback.md)

Invoked with `(deltaMilliseconds, tick)` each fixed step.

## Returns

`void`
