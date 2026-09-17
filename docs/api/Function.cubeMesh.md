[**rune**](README.md)

***

[rune](README.md) / cubeMesh

# Function: cubeMesh()

```ts
function cubeMesh(size?): Mesh;
```

Defined in: geom/solids.ts:22

A cube of edge length `size`, spanning `[-size/2, size/2]³`. Built as six
independent quads so each face gets a flat outward normal and its own uv
square (shared-vertex cubes average normals across edges and look
unhelpfully smooth).

## Parameters

### size?

`number` = `1`

Edge length (default 1).

## Returns

[`Mesh`](Interface.Mesh.md)

A cube [Mesh](Interface.Mesh.md).
