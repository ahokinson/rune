[**rune**](README.md)

***

[rune](README.md) / Noise2D

# Class: Noise2D

Defined in: math/noise2d.ts:23

Seeded 2D noise. Two flavours share one lattice hash: `sample` is value noise
(a hashed value per integer corner, smootherstep-interpolated) in [0, 1),
matching Noise3D's cheap blobby look; `perlin` is gradient noise (Perlin's
dot-of-gradient construction) in roughly [-1, 1], which has no directional
bias and reads as flowing rather than blobby. Pick value noise for masks and
terrain heightfields, Perlin for flow/warp fields. Deterministic for a seed.

## Example

```ts
const n = new Noise2D(1234)
n.sample(1.5, 2.5)   // [0, 1)
n.perlin(1.5, 2.5)   // ~[-1, 1]
```

## Constructors

### Constructor

```ts
new Noise2D(seed?): Noise2D;
```

Defined in: math/noise2d.ts:29

#### Parameters

##### seed?

`number` = `0`

Seed for the lattice hash (default 0).

#### Returns

`Noise2D`

## Methods

### fbm()

```ts
fbm(
   x, 
   y, 
   octaves?, 
   lacunarity?, 
   gain?
): number;
```

Defined in: math/noise2d.ts:136

Fractal brownian motion over the value-noise `sample`: sum `octaves` at rising
frequency (×lacunarity) and falling amplitude (×gain), normalised to [0, 1).

#### Parameters

##### x

`number`

X coordinate.

##### y

`number`

Y coordinate.

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

### perlin()

```ts
perlin(x, y): number;
```

Defined in: math/noise2d.ts:109

Gradient (Perlin) noise at a point, in roughly [-1, 1]. Each corner gradient
is dotted with the offset to that corner, then bilinearly faded.

#### Parameters

##### x

`number`

X coordinate.

##### y

`number`

Y coordinate.

#### Returns

`number`

Noise value in roughly [-1, 1].

***

### sample()

```ts
sample(x, y): number;
```

Defined in: math/noise2d.ts:85

Value noise at a point, bilinearly interpolated. Returns [0, 1).

#### Parameters

##### x

`number`

X coordinate.

##### y

`number`

Y coordinate.

#### Returns

`number`

Noise value in [0, 1).
