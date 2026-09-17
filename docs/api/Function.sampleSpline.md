[**rune**](README.md)

***

[rune](README.md) / sampleSpline

# Function: sampleSpline()

```ts
function sampleSpline(knots, samplesPerSegment): number[][];
```

Defined in: geom/spline.ts:38

Sample a Catmull–Rom spline through `knots` (each an array of the same number
of lanes/dimensions) into a dense polyline of `samplesPerSegment` points per
span. End knots are duplicated so the curve passes through the first and last
knot. Works in any dimension — pass 2D [radius, height] profiles to [lathe](Function.lathe.md) or 3D [x, y, z] paths to [sweepTube](Function.sweepTube.md).

## Parameters

### knots

`number`[][]

Control points, each an array of the same dimensionality.

### samplesPerSegment

`number`

Points to sample per span between consecutive knots.

## Returns

`number`[][]

Dense polyline as an array of points (same dimensionality as `knots`).
