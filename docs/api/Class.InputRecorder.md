[**rune**](README.md)

***

[rune](README.md) / InputRecorder

# Class: InputRecorder\<TInput\>

Defined in: replay/record.ts:30

Collects one input frame per fixed tick into a [Recording](Interface.Recording.md).

## Type Parameters

### TInput

`TInput`

Per-tick input snapshot type.

## Constructors

### Constructor

```ts
new InputRecorder<TInput>(seed?): InputRecorder<TInput>;
```

Defined in: replay/record.ts:37

#### Parameters

##### seed?

`number` = `0`

Random seed the session will use. Defaults to 0.

#### Returns

`InputRecorder`\<`TInput`\>

## Properties

### frames

```ts
readonly frames: TInput[] = [];
```

Defined in: replay/record.ts:32

Captured frames in tick order.

***

### seed

```ts
readonly seed: number = 0;
```

Defined in: replay/record.ts:37

Random seed the session will use. Defaults to 0.

## Accessors

### length

#### Get Signature

```ts
get length(): number;
```

Defined in: replay/record.ts:49

Number of frames captured so far.

##### Returns

`number`

## Methods

### build()

```ts
build(): Recording<TInput>;
```

Defined in: replay/record.ts:59

Snapshot the recording so far (frames are copied, so further recording does
not mutate the returned Recording).

#### Returns

[`Recording`](Interface.Recording.md)\<`TInput`\>

An immutable copy of the recording.

***

### record()

```ts
record(frame): void;
```

Defined in: replay/record.ts:44

Capture the input consumed by one fixed tick. Call once per fixed update.

#### Parameters

##### frame

`TInput`

The input snapshot for this tick.

#### Returns

`void`
