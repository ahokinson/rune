[**rune**](README.md)

***

[rune](README.md) / TimelineOptions

# Interface: TimelineOptions\<T\>

Defined in: replay/timeline.ts:30

Configuration for a [Timeline](Class.Timeline.md).

## Type Parameters

### T

`T`

Event payload type.

## Properties

### apply

```ts
apply: (value, event) => void;
```

Defined in: replay/timeline.ts:34

Called for each event as the clock reaches its time.

#### Parameters

##### value

`T`

##### event

[`TimelineEvent`](Interface.TimelineEvent.md)\<`T`\>

#### Returns

`void`

***

### onReset?

```ts
optional onReset?: () => void;
```

Defined in: replay/timeline.ts:36

Called by `restart()` so the caller can clear applied state.

#### Returns

`void`

***

### speed?

```ts
optional speed?: number;
```

Defined in: replay/timeline.ts:32

Timeline units advanced per real second. Defaults to 1.
