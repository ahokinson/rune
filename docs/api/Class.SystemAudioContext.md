[**rune**](README.md)

***

[rune](README.md) / SystemAudioContext

# Class: SystemAudioContext

Defined in: audio/context.ts:155

Plays sounds by spawning the platform's command-line audio player — the
terminal-friendly way to get audio without a native binding. Resolves the right
player per OS, honours per-play volume where the player supports it, and loops
by re-spawning on exit. `loadBuffer` writes a runtime-synthesised WAV to a temp
file so generated sounds (see ./synth) play the same as loaded ones.

## Extended by

- [`AfplayAudioContext`](Class.AfplayAudioContext.md)

## Implements

- [`AudioContext`](Interface.AudioContext.md)

## Constructors

### Constructor

```ts
new SystemAudioContext(options?): SystemAudioContext;
```

Defined in: audio/context.ts:166

#### Parameters

##### options?

[`SystemAudioContextOptions`](Interface.SystemAudioContextOptions.md) = `{}`

Backend configuration; defaults inferred from `process`.

#### Returns

`SystemAudioContext`

## Methods

### load()

```ts
load(name, path): Promise<void>;
```

Defined in: audio/context.ts:178

Register a sound at `path` under `name`.

#### Parameters

##### name

`string`

Sound key used by `play`.

##### path

`string`

Filesystem path to the audio file.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AudioContext`](Interface.AudioContext.md).[`load`](Interface.AudioContext.md#load)

***

### loadBuffer()

```ts
loadBuffer(name, bytes): Promise<void>;
```

Defined in: audio/context.ts:188

Write `bytes` to a temp WAV file and register it under `name`. No-op outside Bun.

#### Parameters

##### name

`string`

Sound key.

##### bytes

`Uint8Array`

WAV file bytes (e.g. from `synthTone`).

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AudioContext`](Interface.AudioContext.md).[`loadBuffer`](Interface.AudioContext.md#loadbuffer)

***

### play()

```ts
play(name, options?): AudioSource | null;
```

Defined in: audio/context.ts:204

Spawn the resolved player for `name`. Loops by re-spawning on exit when
`options.loop` is set.

#### Parameters

##### name

`string`

Sound key previously loaded.

##### options?

[`PlayOptions`](Interface.PlayOptions.md)

Volume/loop options.

#### Returns

[`AudioSource`](Interface.AudioSource.md) \| `null`

A handle on the running player, or `null` if `name` is unknown or
  the runtime can't spawn.

#### Implementation of

[`AudioContext`](Interface.AudioContext.md).[`play`](Interface.AudioContext.md#play)

***

### stopAll()

```ts
stopAll(): void;
```

Defined in: audio/context.ts:242

Kill every active player.

#### Returns

`void`

#### Implementation of

[`AudioContext`](Interface.AudioContext.md).[`stopAll`](Interface.AudioContext.md#stopall)
