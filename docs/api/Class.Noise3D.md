[**rune**](README.md)

***

[rune](README.md) / Noise3D

# Class: Noise3D

Defined in: math/noise.ts:23

Seeded 3D value noise with fractal-brownian-motion summation. Value noise (a
hashed value per integer lattice corner, smootherstep-interpolated) rather
than gradient/Perlin noise: cheaper, no gradient tables, and the soft blobby
output suits volumetric looks like clouds or terrain masks. Sampling in 3D
lets callers feed a unit surface vector so a field wraps seamlessly over a
sphere — no equirectangular seam or pole pinch. Deterministic for a given seed.

## Example

```ts
const n = new Noise3D(1234)
n.sample(1.5, 2.5, 3.5)   // [0, 1)
n.fbm(1.5, 2.5, 3.5, 4)   // layered detail, [0, 1)
```

## Constructors

### Constructor

```ts
new Noise3D(seed?): Noise3D;
```

Defined in: math/noise.ts:29

#### Parameters

##### seed?

`number` = `0`

Seed for the lattice hash (default 0).

#### Returns

`Noise3D`

## Methods

### fbm()

```ts
fbm(
   x, 
   y, 
   z, 
   octaves?, 
   lacunarity?, 
   gain?
): number;
```

Defined in: math/noise.ts:94

Fractal brownian motion: sum `octaves` of sample at rising frequency
(×lacunarity) and falling amplitude (×gain), normalised back to [0, 1).
More octaves add finer detail; the default 4/2/0.5 is a balanced cloud-like
field.

#### Parameters

##### x

`number`

X coordinate.

##### y

`number`

Y coordinate.

##### z

`number`

Z coordinate.

##### octaves?

`number` = `4`

Number of octave passes (default 4).

##### lacunarity?

`number` = `2`

Frequency multiplier per octave (default 2).

##### gain?

`number` = `0.5`

Amplitude multiplier per octave (default 0.5).

#### Returns

`number`

Amplitude-normalised fractal sum in [0, 1).

***

### sample()

```ts
sample(
   x, 
   y, 
   z
): number;
```

Defined in: math/noise.ts:51

Value noise at a point, trilinearly interpolated with a smootherstep fade
(t³(t(6t−15)+10)) so the field has continuous first and second derivatives.
Returns [0, 1).

#### Parameters

##### x

`number`

X coordinate.

##### y

`number`

Y coordinate.

##### z

`number`

Z coordinate.

#### Returns

`number`

Noise value in [0, 1).
