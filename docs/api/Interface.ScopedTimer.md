[**rune**](README.md)

***

[rune](README.md) / ScopedTimer

# Interface: ScopedTimer

Defined in: hooks.ts:199

Timer handle returned by [useTimer](Function.useTimer.md) whose pending timers are cleared
automatically when the owning component unmounts.

## Methods

### after()

```ts
after(milliseconds, callback): number;
```

Defined in: hooks.ts:208

Schedule `callback` after `milliseconds` ms. The timer is tracked for
automatic cleanup on unmount.

#### Parameters

##### milliseconds

`number`

Delay in milliseconds.

##### callback

() => `void`

Fired once after the delay.

#### Returns

`number`

A [TimerId](TypeAlias.TimerId.md) that can be passed to [ScopedTimer.clear](#clear).

***

### clear()

```ts
clear(id): void;
```

Defined in: hooks.ts:224

Cancel a timer previously scheduled via [ScopedTimer.after](#after) or
[ScopedTimer.every](#every).

#### Parameters

##### id

`number`

The timer id to cancel.

#### Returns

`void`

***

### every()

```ts
every(milliseconds, callback): number;
```

Defined in: hooks.ts:217

Schedule `callback` every `milliseconds` ms. The timer is tracked for
automatic cleanup on unmount.

#### Parameters

##### milliseconds

`number`

Interval in milliseconds.

##### callback

() => `void`

Fired on each interval.

#### Returns

`number`

A [TimerId](TypeAlias.TimerId.md) that can be passed to [ScopedTimer.clear](#clear).
