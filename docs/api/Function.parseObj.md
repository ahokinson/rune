[**rune**](README.md)

***

[rune](README.md) / parseObj

# Function: parseObj()

```ts
function parseObj(text): Mesh;
```

Defined in: geom/obj.ts:22

A minimal Wavefront OBJ parser → [Mesh](Interface.Mesh.md). Handles `v`, `vn`, `vt`, and
`f` with `a`, `a/b`, `a//c`, or `a/b/c` vertex references (1-based, negative
allowed), triangulating polygons as a fan. Face-vertices with distinct
position/uv/normal triples become distinct mesh vertices. Normals and uvs are
emitted only when every face-vertex supplies them (so a normal-less OBJ falls
back to the renderer's flat shading).

## Parameters

### text

`string`

Raw OBJ source text.

## Returns

[`Mesh`](Interface.Mesh.md)

A [Mesh](Interface.Mesh.md) with positions, indices, and (when present) normals/uvs.
