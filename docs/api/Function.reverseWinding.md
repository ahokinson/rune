[**rune**](README.md)

***

[rune](README.md) / reverseWinding

# Function: reverseWinding()

```ts
function reverseWinding(mesh): Mesh;
```

Defined in: geom/meshBuilder.ts:213

Reverse each triangle's winding in place (swap the 2nd and 3rd index),
flipping which side faces the camera. Normals are untouched, so lighting is
unaffected. Returns the same mesh for chaining.

## Parameters

### mesh

[`Mesh`](Interface.Mesh.md)

Mesh to rewind (mutated in place).

## Returns

[`Mesh`](Interface.Mesh.md)

The same `mesh`.
