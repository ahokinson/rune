[**rune**](README.md)

***

[rune](README.md) / MixResult

# Interface: MixResult

Defined in: audio/mixer.ts:28

Output of [Mixer.render](Class.Mixer.md#render): interleaved samples and the channel count.

## Properties

### channels

```ts
channels: 1 | 2;
```

Defined in: audio/mixer.ts:32

1 for mono, 2 for stereo.

***

### samples

```ts
samples: Float32Array;
```

Defined in: audio/mixer.ts:30

Interleaved sample buffer (mono or L,R,L,R,…).
