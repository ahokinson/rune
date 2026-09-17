[**rune**](README.md)

***

[rune](README.md) / Scheduler

# Class: Scheduler

Defined in: core/scheduler.ts:24

Timer registry advanced by an external time source. Schedule one-shot timers
with [Scheduler.after](#after) or repeating timers with [Scheduler.every](#every),
then call [Scheduler.advance](#advance) each frame with the frame delta to fire
due callbacks. Pause-safe: no timer fires while [advance](#advance) isn't called.

## Constructors

### Constructor

```ts
new Scheduler(): Scheduler;
```

#### Returns

`Scheduler`

## Methods

### advance()

```ts
advance(deltaMilliseconds): void;
```

Defined in: core/scheduler.ts:71

Advance the scheduler by `deltaMilliseconds`, firing any callbacks whose
deadline has been reached. Repeating timers re-arm from their interval.

#### Parameters

##### deltaMilliseconds

`number`

Time to add to every pending timer.

#### Returns

`void`

***

### after()

```ts
after(milliseconds, callback): number;
```

Defined in: core/scheduler.ts:35

Schedule `callback` to fire once after `milliseconds` have elapsed.

#### Parameters

##### milliseconds

`number`

Delay before firing.

##### callback

() => `void`

Function to invoke.

#### Returns

`number`

A [TimerId](TypeAlias.TimerId.md) for cancellation via [clear](#clear).

***

### clear()

```ts
clear(id): void;
```

Defined in: core/scheduler.ts:56

Cancel a single scheduled timer.

#### Parameters

##### id

`number`

Handle returned by [after](#after) or [every](#every).

#### Returns

`void`

***

### clearAll()

```ts
clearAll(): void;
```

Defined in: core/scheduler.ts:61

Cancel every scheduled timer.

#### Returns

`void`

***

### every()

```ts
every(milliseconds, callback): number;
```

Defined in: core/scheduler.ts:47

Schedule `callback` to fire every `milliseconds`, repeating until
cancelled.

#### Parameters

##### milliseconds

`number`

Interval between firings.

##### callback

() => `void`

Function to invoke on each firing.

#### Returns

`number`

A [TimerId](TypeAlias.TimerId.md) for cancellation via [clear](#clear).
