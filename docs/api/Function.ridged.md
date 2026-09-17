[**rune**](README.md)

***

[rune](README.md) / ridged

# Function: ridged()

```ts
function ridged(
   sampler, 
   x, 
   y, 
   options?
): number;
```

Defined in: math/fbm.ts:66

Ridged multifractal: 1 − |sampler| folded each octave, biased toward sharp
ridges. Best fed a signed sampler (Perlin); produces eroded mountain ridges
and canyon networks. Returns [0, 1).

## Parameters

### sampler

[`NoiseSampler2D`](TypeAlias.NoiseSampler2D.md)

Source noise to layer (ideally signed, e.g. Perlin).

### x

`number`

X coordinate to sample.

### y

`number`

Y coordinate to sample.

### options?

[`FbmOptions`](Interface.FbmOptions.md) = `{}`

Octave/lacunarity/gain/frequency controls.

## Returns

`number`

Ridged fractal value in [0, 1).
