[**rune**](README.md)

***

[rune](README.md) / sphericalToVector3Into

# Function: sphericalToVector3Into()

```ts
function sphericalToVector3Into(
   out, 
   theta, 
   phi
): Vector3;
```

Defined in: geom/sphere.ts:33

Allocation-free variant of [sphericalToVector3](Function.sphericalToVector3.md): writes the unit
direction into `out`.

## Parameters

### out

[`Vector3`](Class.Vector3.md)

Target vector to fill.

### theta

`number`

Elevation from the equatorial plane.

### phi

`number`

Azimuth about the y axis.

## Returns

[`Vector3`](Class.Vector3.md)

`out` for chaining.
