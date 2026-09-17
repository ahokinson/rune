[**rune**](README.md)

***

[rune](README.md) / slerp

# Function: slerp()

```ts
function slerp(
   a, 
   b, 
   t
): Vector3;
```

Defined in: geom/sphere.ts:65

Spherical linear interpolation along the great circle from `a` to `b`. Falls
back to a plain lerp when the endpoints are nearly parallel (sin θ → 0).

## Parameters

### a

[`Vector3`](Class.Vector3.md)

Start direction (unit).

### b

[`Vector3`](Class.Vector3.md)

End direction (unit).

### t

`number`

Interpolation factor (0 = `a`, 1 = `b`).

## Returns

[`Vector3`](Class.Vector3.md)

A new interpolated [Vector3](Class.Vector3.md).
