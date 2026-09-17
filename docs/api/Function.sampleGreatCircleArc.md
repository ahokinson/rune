[**rune**](README.md)

***

[rune](README.md) / sampleGreatCircleArc

# Function: sampleGreatCircleArc()

```ts
function sampleGreatCircleArc(
   a, 
   b, 
   steps
): Vector3[];
```

Defined in: geom/sphere.ts:117

Sample the great-circle arc from `a` to `b` at `steps + 1` evenly spaced
points (inclusive of both endpoints). Points are unit directions — bowing an
arc off the surface is a projection concern (see SphereProjection's altitude
parameter), kept separate so depth/culling stay tied to the true surface.

## Parameters

### a

[`Vector3`](Class.Vector3.md)

Start direction (unit).

### b

[`Vector3`](Class.Vector3.md)

End direction (unit).

### steps

`number`

Number of segments; the result has `steps + 1` points.

## Returns

[`Vector3`](Class.Vector3.md)[]

Array of unit directions along the arc.
