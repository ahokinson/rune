[**rune**](README.md)

***

[rune](README.md) / AudioContext

# Interface: AudioContext

Defined in: audio/context.ts:23

Minimal audio backend: load sounds, play them, and stop everything.

## Methods

### load()

```ts
load(name, path): Promise<void>;
```

Defined in: audio/context.ts:24

#### Parameters

##### name

`string`

##### path

`string`

#### Returns

`Promise`\<`void`\>

***

### loadBuffer()?

```ts
optional loadBuffer(name, bytes): Promise<void>;
```

Defined in: audio/context.ts:29

Register a sound from an in-memory buffer (e.g. a WAV synthesised at runtime),
so games need no on-disk audio assets. Optional: not every backend supports it.

#### Parameters

##### name

`string`

##### bytes

`Uint8Array`

#### Returns

`Promise`\<`void`\>

***

### play()

```ts
play(name, options?): AudioSource | null;
```

Defined in: audio/context.ts:30

#### Parameters

##### name

`string`

##### options?

[`PlayOptions`](Interface.PlayOptions.md)

#### Returns

[`AudioSource`](Interface.AudioSource.md) \| `null`

***

### stopAll()

```ts
stopAll(): void;
```

Defined in: audio/context.ts:31

#### Returns

`void`
