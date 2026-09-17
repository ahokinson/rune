[**rune**](README.md)

***

[rune](README.md) / normalizeMesh

# Function: normalizeMesh()

```ts
function normalizeMesh(mesh, options?): Mesh;
```

Defined in: geom/obj.ts:116

Recentre a mesh on the origin and uniformly scale it to `size`, optionally
remapping axes (positions and normals alike). Mutates and returns the mesh —
the axis map is a pure rotation/reflection, so a reflection's winding flip is
corrected by reversing each triangle when the map is orientation-reversing.

## Parameters

### mesh

[`Mesh`](Interface.Mesh.md)

Mesh to normalise (mutated in place).

### options?

[`NormalizeOptions`](Interface.NormalizeOptions.md) = `{}`

Size target and optional axis remap.

## Returns

[`Mesh`](Interface.Mesh.md)

The same `mesh`, recentred and scaled.
