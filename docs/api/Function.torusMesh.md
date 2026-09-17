[**rune**](README.md)

***

[rune](README.md) / torusMesh

# Function: torusMesh()

```ts
function torusMesh(options?): Mesh;
```

Defined in: geom/solids.ts:156

A torus in the xz-plane. Normals point radially out of the tube; uvs wrap
`(around-ring, around-tube)`.

## Parameters

### options?

[`TorusMeshOptions`](Interface.TorusMeshOptions.md) = `{}`

Radii and segment counts.

## Returns

[`Mesh`](Interface.Mesh.md)

A torus [Mesh](Interface.Mesh.md).
