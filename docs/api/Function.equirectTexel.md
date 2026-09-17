[**rune**](README.md)

***

[rune](README.md) / equirectTexel

# Function: equirectTexel()

```ts
function equirectTexel(
   theta, 
   phi, 
   width, 
   height
): object;
```

Defined in: geom/texture.ts:23

Map a spherical elevation/azimuth (radians, see sphere.ts for the theta/phi
convention) to nearest-neighbour integer texel coordinates of an
equirectangular texture: row 0 is the +y pole, column 0 is azimuth −π.
Azimuth wraps; elevation clamps at the poles. Storage-agnostic — the caller
indexes its own buffer at the returned (x, y).

## Parameters

### theta

`number`

Elevation from the equatorial plane in radians.

### phi

`number`

Azimuth about the y axis in radians.

### width

`number`

Texture width in texels.

### height

`number`

Texture height in texels.

## Returns

`object`

Texel coordinates `{ x, y }`.

### x

```ts
x: number;
```

### y

```ts
y: number;
```
