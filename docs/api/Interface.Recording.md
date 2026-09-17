[**rune**](README.md)

***

[rune](README.md) / Recording

# Interface: Recording\<TInput\>

Defined in: replay/record.ts:18

Serialized input stream plus the seed needed to replay it.

## Type Parameters

### TInput

`TInput`

Per-tick input snapshot type.

## Properties

### frames

```ts
frames: TInput[];
```

Defined in: replay/record.ts:22

Captured input frames in tick order.

***

### seed

```ts
seed: number;
```

Defined in: replay/record.ts:20

The Random seed the recorded session used; replaying with the same seed is what makes playback deterministic.
