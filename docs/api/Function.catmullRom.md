[**rune**](README.md)

***

[rune](README.md) / catmullRom

# Function: catmullRom()

```ts
function catmullRom(
   p0, 
   p1, 
   p2, 
   p3, 
   t
): number;
```

Defined in: geom/spline.ts:21

Catmull–Rom interpolation of one scalar lane between p1 and p2. p0 and p3 are
the neighbouring knots that set the tangents, t runs 0..1 across the p1→p2
span.

## Parameters

### p0

`number`

Neighbouring knot before p1 (sets the incoming tangent).

### p1

`number`

Start of the span.

### p2

`number`

End of the span.

### p3

`number`

Neighbouring knot after p2 (sets the outgoing tangent).

### t

`number`

Interpolation factor 0..1 across the p1→p2 span.

## Returns

`number`

Interpolated scalar.
