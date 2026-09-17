[**rune**](README.md)

***

[rune](README.md) / fbm

# Function: fbm()

```ts
function fbm(
   sampler, 
   x, 
   y, 
   options?
): number;
```

Defined in: math/fbm.ts:38

Sum `octaves` of `sampler` at rising frequency and falling amplitude. The
result is normalised by total amplitude, so its range matches the sampler's
own range (e.g. [0, 1) value noise stays [0, 1); [-1, 1] Perlin stays [-1, 1]).

## Parameters

### sampler

[`NoiseSampler2D`](TypeAlias.NoiseSampler2D.md)

Source noise to layer.

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

Amplitude-normalised fractal sum.
