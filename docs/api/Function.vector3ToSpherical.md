[**rune**](README.md)

***

[rune](README.md) / vector3ToSpherical

# Function: vector3ToSpherical()

```ts
function vector3ToSpherical(v): object;
```

Defined in: geom/sphere.ts:49

Inverse of [sphericalToVector3](Function.sphericalToVector3.md): recover elevation/azimuth (radians) from a
direction. The azimuth tolerates a non-unit vector, but the elevation assumes
a unit vector, so normalize first if unsure.

## Parameters

### v

[`Vector3`](Class.Vector3.md)

Direction to invert (unit length for a correct elevation).

## Returns

`object`

`{ theta, phi }` in radians.

### phi

```ts
phi: number;
```

### theta

```ts
theta: number;
```
