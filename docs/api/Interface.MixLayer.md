[**rune**](README.md)

***

[rune](README.md) / MixLayer

# Interface: MixLayer

Defined in: audio/mixer.ts:16

One layer in a mix: a sample buffer plus gain, pan and time offset.

## Properties

### gain?

```ts
optional gain?: number;
```

Defined in: audio/mixer.ts:20

Linear gain applied to this layer (default 1).

***

### offsetSamples?

```ts
optional offsetSamples?: number;
```

Defined in: audio/mixer.ts:24

Start offset in samples, for layering sounds in time. Default 0.

***

### pan?

```ts
optional pan?: number;
```

Defined in: audio/mixer.ts:22

Stereo pan, −1 (left) … 0 (centre) … 1 (right). Non-zero on any layer makes the mix stereo. Default 0.

***

### samples

```ts
samples: Float32Array;
```

Defined in: audio/mixer.ts:18

Sample buffer to mix in.
