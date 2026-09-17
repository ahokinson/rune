[**rune**](README.md)

***

[rune](README.md) / lathe

# Function: lathe()

```ts
function lathe(
   profileKnots, 
   radialSegments, 
   profileSamples, 
   vOffset
): MeshPart;
```

Defined in: geom/meshBuilder.ts:53

Lathe a 2D profile of `[radius, height]` knots around the Y axis into a surface
of revolution. `radialSegments` divides the sweep, `profileSamples` densifies
each profile span (via Catmull–Rom). Meridian normals come from the
finite-difference profile tangent rotated 90°, then swept. `vOffset` shifts
the uv v-range so stacked parts tile cleanly.

## Parameters

### profileKnots

`number`[][]

`[radius, height]` knots defining the profile curve.

### radialSegments

`number`

Divisions of the full revolution.

### profileSamples

`number`

Points sampled per profile span (Catmull–Rom densification).

### vOffset

`number`

UV v-range shift so stacked parts tile cleanly.

## Returns

[`MeshPart`](Interface.MeshPart.md)

A [MeshPart](Interface.MeshPart.md) for the revolved surface.
