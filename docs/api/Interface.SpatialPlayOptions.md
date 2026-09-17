[**rune**](README.md)

***

[rune](README.md) / SpatialPlayOptions

# Interface: SpatialPlayOptions

Defined in: audio/spatial.ts:40

[PlayOptions](Interface.PlayOptions.md) plus the listener/source/range needed for spatial falloff.

## Extends

- [`PlayOptions`](Interface.PlayOptions.md)

## Properties

### listener

```ts
listener: SpatialPoint;
```

Defined in: audio/spatial.ts:42

Ear position.

***

### loop?

```ts
optional loop?: boolean;
```

Defined in: audio/context.ts:13

Loop the sound until stopped (re-spawns the player each time it finishes).

#### Inherited from

[`PlayOptions`](Interface.PlayOptions.md).[`loop`](Interface.PlayOptions.md#loop)

***

### range

```ts
range: number;
```

Defined in: audio/spatial.ts:46

Distance at which the sound goes silent.

***

### source

```ts
source: SpatialPoint;
```

Defined in: audio/spatial.ts:44

Sound position.

***

### volume?

```ts
optional volume?: number;
```

Defined in: audio/context.ts:11

Linear volume multiplier, 0–1 (honoured on platforms whose player supports it, e.g. macOS afplay). Default 1.

#### Inherited from

[`PlayOptions`](Interface.PlayOptions.md).[`volume`](Interface.PlayOptions.md#volume)
