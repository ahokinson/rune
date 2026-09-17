[**rune**](README.md)

***

[rune](README.md) / TimelineEvent

# Interface: TimelineEvent\<T\>

Defined in: replay/timeline.ts:18

A timestamped event on a timeline.

## Type Parameters

### T

`T`

Event payload type.

## Properties

### time

```ts
time: number;
```

Defined in: replay/timeline.ts:20

Position on the timeline, in the same units as `speed` (e.g. seconds, days).

***

### value

```ts
value: T;
```

Defined in: replay/timeline.ts:22

Payload fired to the apply callback when the clock reaches `time`.
