[**rune**](README.md)

***

[rune](README.md) / PlayOptions

# Interface: PlayOptions

Defined in: audio/context.ts:9

## Extended by

- [`SpatialPlayOptions`](Interface.SpatialPlayOptions.md)

## Properties

### loop?

```ts
optional loop?: boolean;
```

Defined in: audio/context.ts:13

Loop the sound until stopped (re-spawns the player each time it finishes).

***

### volume?

```ts
optional volume?: number;
```

Defined in: audio/context.ts:11

Linear volume multiplier, 0–1 (honoured on platforms whose player supports it, e.g. macOS afplay). Default 1.
