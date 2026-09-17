[**rune**](README.md)

***

[rune](README.md) / domainWarp

# Function: domainWarp()

```ts
function domainWarp(
   sampler, 
   warp, 
   x, 
   y, 
   options?
): number;
```

Defined in: math/fbm.ts:108

Domain warping: offset the lookup into `sampler` by an fbm of `warp`. The
classic two-pass swirl — feed the same noise as both `sampler` and `warp` for
a self-similar marbled field, or different noises for layered turbulence.

## Parameters

### sampler

[`NoiseSampler2D`](TypeAlias.NoiseSampler2D.md)

The field to read the warped value from.

### warp

[`NoiseSampler2D`](TypeAlias.NoiseSampler2D.md)

The field whose fbm drives the displacement.

### x

`number`

X coordinate to sample.

### y

`number`

Y coordinate to sample.

### options?

[`DomainWarpOptions`](Interface.DomainWarpOptions.md) = `{}`

Warp strength plus the shared octave controls.

## Returns

`number`

`sampler` sampled at the warped coordinate.
