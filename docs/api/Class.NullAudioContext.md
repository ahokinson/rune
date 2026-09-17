[**rune**](README.md)

***

[rune](README.md) / NullAudioContext

# Class: NullAudioContext

Defined in: audio/context.ts:38

No-op [AudioContext](Interface.AudioContext.md) that records plays instead of making sound — the
test double for assertions about what a game "played".

## Implements

- [`AudioContext`](Interface.AudioContext.md)

## Constructors

### Constructor

```ts
new NullAudioContext(): NullAudioContext;
```

#### Returns

`NullAudioContext`

## Properties

### playLog

```ts
readonly playLog: object[] = [];
```

Defined in: audio/context.ts:40

Recorded `play` calls in order, for test assertions.

#### name

```ts
name: string;
```

#### options

```ts
options: PlayOptions | undefined;
```

## Methods

### isLoaded()

```ts
isLoaded(name): boolean;
```

Defined in: audio/context.ts:90

#### Parameters

##### name

`string`

Sound key.

#### Returns

`boolean`

`true` if `name` was registered via `load`/`loadBuffer`.

***

### load()

```ts
load(name, _path): Promise<void>;
```

Defined in: audio/context.ts:49

Record `name` as loaded (no file is touched).

#### Parameters

##### name

`string`

Sound key.

##### \_path

`string`

Ignored.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AudioContext`](Interface.AudioContext.md).[`load`](Interface.AudioContext.md#load)

***

### loadBuffer()

```ts
loadBuffer(name, _bytes): Promise<void>;
```

Defined in: audio/context.ts:59

Record `name` as loaded (no bytes are touched).

#### Parameters

##### name

`string`

Sound key.

##### \_bytes

`Uint8Array`

Ignored.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AudioContext`](Interface.AudioContext.md).[`loadBuffer`](Interface.AudioContext.md#loadbuffer)

***

### play()

```ts
play(name, options?): AudioSource | null;
```

Defined in: audio/context.ts:70

Append to [playLog](#playlog) and return a fake [AudioSource](Interface.AudioSource.md).

#### Parameters

##### name

`string`

Sound key.

##### options?

[`PlayOptions`](Interface.PlayOptions.md)

Playback options (recorded).

#### Returns

[`AudioSource`](Interface.AudioSource.md) \| `null`

A handle whose `playing` flips to `false` on `stop()`.

#### Implementation of

[`AudioContext`](Interface.AudioContext.md).[`play`](Interface.AudioContext.md#play)

***

### stopAll()

```ts
stopAll(): void;
```

Defined in: audio/context.ts:84

No-op.

#### Returns

`void`

#### Implementation of

[`AudioContext`](Interface.AudioContext.md).[`stopAll`](Interface.AudioContext.md#stopall)
