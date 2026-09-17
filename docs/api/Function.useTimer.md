[**rune**](README.md)

***

[rune](README.md) / useTimer

# Function: useTimer()

```ts
function useTimer(): ScopedTimer;
```

Defined in: hooks.ts:233

Returns a [ScopedTimer](Interface.ScopedTimer.md) whose `after`/`every` timers are tracked and
cancelled automatically when the calling component unmounts.

## Returns

[`ScopedTimer`](Interface.ScopedTimer.md)

The scoped timer handle.
