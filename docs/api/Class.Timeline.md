[**rune**](README.md)

***

[rune](README.md) / Timeline

# Class: Timeline\<T\>

Defined in: replay/timeline.ts:44

Clock-driven player over a list of [TimelineEvent](Interface.TimelineEvent.md)s.

## Type Parameters

### T

`T`

Event payload type.

## Constructors

### Constructor

```ts
new Timeline<T>(options): Timeline<T>;
```

Defined in: replay/timeline.ts:58

#### Parameters

##### options

[`TimelineOptions`](Interface.TimelineOptions.md)\<`T`\>

Playback configuration.

#### Returns

`Timeline`\<`T`\>

## Properties

### paused

```ts
paused: boolean = false;
```

Defined in: replay/timeline.ts:46

Pause flag; when `true`, [Timeline.update](#update) does nothing.

## Accessors

### done

#### Get Signature

```ts
get done(): boolean;
```

Defined in: replay/timeline.ts:107

`true` when every event has been applied.

##### Returns

`boolean`

***

### progress

#### Get Signature

```ts
get progress(): object;
```

Defined in: replay/timeline.ts:112

Playback progress: applied index, total events, and current clock value.

##### Returns

`object`

###### clock

```ts
clock: number;
```

###### index

```ts
index: number;
```

###### total

```ts
total: number;
```

## Methods

### append()

```ts
append(event): void;
```

Defined in: replay/timeline.ts:70

Append an event to the tail (must arrive in non-decreasing time order). The
first appended event anchors the clock so playback starts at its moment.

#### Parameters

##### event

[`TimelineEvent`](Interface.TimelineEvent.md)\<`T`\>

Event to append.

#### Returns

`void`

***

### restart()

```ts
restart(): void;
```

Defined in: replay/timeline.ts:100

Rewind the cursor and clock to the first event and invoke `onReset`.

#### Returns

`void`

***

### seek()

```ts
seek(time): void;
```

Defined in: replay/timeline.ts:93

Jump the clock to `time`, applying every event up to it (without re-applying
ones already passed). To replay from scratch at a point, call `restart` first.

#### Parameters

##### time

`number`

Timeline position to jump to.

#### Returns

`void`

***

### setSpeed()

```ts
setSpeed(unitsPerSecond): void;
```

Defined in: replay/timeline.ts:83

Set the playback speed.

#### Parameters

##### unitsPerSecond

`number`

Timeline units advanced per real second.

#### Returns

`void`

***

### update()

```ts
update(deltaSeconds): void;
```

Defined in: replay/timeline.ts:121

Advance the clock by `deltaSeconds · speed` and apply any events it reaches.

#### Parameters

##### deltaSeconds

`number`

Real time elapsed since the previous update.

#### Returns

`void`
