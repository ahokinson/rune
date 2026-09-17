[**rune**](README.md)

***

[rune](README.md) / AfplayAudioContext

# Class: AfplayAudioContext

Defined in: audio/context.ts:258

macOS preset of [SystemAudioContext](Class.SystemAudioContext.md) (plays through `afplay`). Kept for
back-compat and as the obvious choice on macOS; new code can use
[SystemAudioContext](Class.SystemAudioContext.md) directly for cross-platform behaviour.

## Extends

- [`SystemAudioContext`](Class.SystemAudioContext.md)

## Constructors

### Constructor

```ts
new AfplayAudioContext(options?): AfplayAudioContext;
```

Defined in: audio/context.ts:262

#### Parameters

##### options?

[`AfplayAudioContextOptions`](Interface.AfplayAudioContextOptions.md) = `{}`

Optional override of the `afplay` command name.

#### Returns

`AfplayAudioContext`

#### Overrides

[`SystemAudioContext`](Class.SystemAudioContext.md).[`constructor`](Class.SystemAudioContext.md#constructor)

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

#### Inherited from

[`SystemAudioContext`](Class.SystemAudioContext.md).[`load`](Class.SystemAudioContext.md#load)

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

#### Inherited from

[`SystemAudioContext`](Class.SystemAudioContext.md).[`loadBuffer`](Class.SystemAudioContext.md#loadbuffer)

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

#### Inherited from

[`SystemAudioContext`](Class.SystemAudioContext.md).[`play`](Class.SystemAudioContext.md#play)

***

### stopAll()

```ts
stopAll(): void;
```

Defined in: audio/context.ts:242

Kill every active player.

#### Returns

`void`

#### Inherited from

[`SystemAudioContext`](Class.SystemAudioContext.md).[`stopAll`](Class.SystemAudioContext.md#stopall)
