[**rune**](README.md)

***

[rune](README.md) / SystemAudioContextOptions

# Interface: SystemAudioContextOptions

Defined in: audio/context.ts:139

## Properties

### platform?

```ts
optional platform?: string;
```

Defined in: audio/context.ts:141

Override the detected platform (mainly for testing).

***

### player?

```ts
optional player?: string;
```

Defined in: audio/context.ts:143

Force a specific player command on the current platform.

***

### tempDir?

```ts
optional tempDir?: string;
```

Defined in: audio/context.ts:145

Directory for buffers written by loadBuffer (default $TMPDIR or "/tmp").
