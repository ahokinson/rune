[**rune**](README.md)

***

[rune](README.md) / InputPlayback

# Class: InputPlayback\<TInput\>

Defined in: replay/playback.ts:17

Frame-by-frame player for a recorded input stream.

## Type Parameters

### TInput

`TInput`

Per-tick input snapshot type.

## Constructors

### Constructor

```ts
new InputPlayback<TInput>(recording): InputPlayback<TInput>;
```

Defined in: replay/playback.ts:26

#### Parameters

##### recording

[`Recording`](Interface.Recording.md)\<`TInput`\>

The recording to replay.

#### Returns

`InputPlayback`\<`TInput`\>

## Properties

### seed

```ts
readonly seed: number;
```

Defined in: replay/playback.ts:19

Seed the recorded session used; feed this to your RNG before replaying.

## Accessors

### done

#### Get Signature

```ts
get done(): boolean;
```

Defined in: replay/playback.ts:42

`true` when every recorded frame has been consumed.

##### Returns

`boolean`

***

### length

#### Get Signature

```ts
get length(): number;
```

Defined in: replay/playback.ts:32

Number of frames in the recording.

##### Returns

`number`

***

### tick

#### Get Signature

```ts
get tick(): number;
```

Defined in: replay/playback.ts:37

Ticks consumed so far.

##### Returns

`number`

## Methods

### at()

```ts
at(tick): TInput | undefined;
```

Defined in: replay/playback.ts:62

Peek a specific tick's frame without moving the cursor.

#### Parameters

##### tick

`number`

Tick index to read.

#### Returns

`TInput` \| `undefined`

The frame at `tick`, or `undefined` if out of range.

***

### next()

```ts
next(): TInput | undefined;
```

Defined in: replay/playback.ts:51

The next frame, advancing the cursor.

#### Returns

`TInput` \| `undefined`

The next input frame, or `undefined` once exhausted.

***

### reset()

```ts
reset(): void;
```

Defined in: replay/playback.ts:67

Rewind the cursor to the first frame.

#### Returns

`void`
