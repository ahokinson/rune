[**rune**](README.md)

***

[rune](README.md) / BloomOptions

# Interface: BloomOptions

Defined in: fx/bloom.ts:13

Options for the [bloom](Function.bloom.md) post effect.

## Properties

### intensity?

```ts
optional intensity?: number;
```

Defined in: fx/bloom.ts:19

How strongly the blurred glow is added back. Default 0.6.

***

### radius?

```ts
optional radius?: number;
```

Defined in: fx/bloom.ts:17

How far the glow spreads, in cells. Default 2.

***

### threshold?

```ts
optional threshold?: number;
```

Defined in: fx/bloom.ts:15

Luminance (0–255) above which a cell contributes to the glow. Default 180.
