[**rune**](README.md)

***

[rune](README.md) / sweepTube

# Function: sweepTube()

```ts
function sweepTube(
   pathKnots, 
   radiusAt, 
   pathSamples, 
   tubeSegments
): MeshPart;
```

Defined in: geom/meshBuilder.ts:108

Sweep a circular cross-section of `radiusAt(t)` along a 3D Catmull–Rom path
(`pathKnots` are `[x, y, z]` knots). `pathSamples` densifies the path,
`tubeSegments` divides the tube. A parallel-transport-ish frame is rebuilt per
sample from the path tangent and a reference up so the tube does not pinch.

## Parameters

### pathKnots

`number`[][]

`[x, y, z]` knots defining the centreline.

### radiusAt

(`t`) => `number`

Function returning the tube radius at param `t` (0..1).

### pathSamples

`number`

Points sampled along the path (Catmull–Rom densification).

### tubeSegments

`number`

Divisions of the circular cross-section.

## Returns

[`MeshPart`](Interface.MeshPart.md)

A [MeshPart](Interface.MeshPart.md) for the swept tube.
