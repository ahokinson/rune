[**rune**](README.md)

***

[rune](README.md) / planeMesh

# Function: planeMesh()

```ts
function planeMesh(options?): Mesh;
```

Defined in: geom/solids.ts:227

A flat quad in the xz-plane at height `y`. The normal points to screen-up (−y,
the engine's up hint) so the lit side faces the viewer; uvs tile `tiles` times.
Handy as a floor/ground a mesh's shadow falls on.

## Parameters

### options?

[`PlaneMeshOptions`](Interface.PlaneMeshOptions.md) = `{}`

Extent, height, and uv tiling.

## Returns

[`Mesh`](Interface.Mesh.md)

A plane [Mesh](Interface.Mesh.md).
