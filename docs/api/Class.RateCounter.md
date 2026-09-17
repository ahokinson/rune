[**rune**](README.md)

***

[rune](README.md) / RateCounter

# Class: RateCounter

Defined in: core/rateCounter.ts:13

Counts events over a trailing window. Unit-agnostic: callers pass a monotonic
clock value to [record](#record)/[sample](#sample) (ticks, frames, or milliseconds)
and the counter keeps only the entries within `window` of the latest value.
Parallels [FramesPerSecondCounter](Class.FramesPerSecondCounter.md), but for arbitrary discrete events.

## Constructors

### Constructor

```ts
new RateCounter(window): RateCounter;
```

Defined in: core/rateCounter.ts:21

#### Parameters

##### window

`number`

Trailing window length, in the same unit callers pass to
  [record](#record) and [sample](#sample).

#### Returns

`RateCounter`

## Accessors

### current

#### Get Signature

```ts
get current(): number;
```

Defined in: core/rateCounter.ts:51

The count from the last [sample](#sample), without pruning again.

##### Returns

`number`

## Methods

### record()

```ts
record(now): void;
```

Defined in: core/rateCounter.ts:28

Record an event at `now` (the same unit used for `window`).

#### Parameters

##### now

`number`

Current monotonic clock value.

#### Returns

`void`

***

### reset()

```ts
reset(): void;
```

Defined in: core/rateCounter.ts:56

Clear all recorded events.

#### Returns

`void`

***

### sample()

```ts
sample(now): number;
```

Defined in: core/rateCounter.ts:38

Prune events older than `window` and return how many remain in the window.

#### Parameters

##### now

`number`

Current monotonic clock value.

#### Returns

`number`

Count of events within the trailing window.
