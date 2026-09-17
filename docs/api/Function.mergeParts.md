[**rune**](README.md)

***

[rune](README.md) / mergeParts

# Function: mergeParts()

```ts
function mergeParts(parts): Mesh;
```

Defined in: geom/meshBuilder.ts:176

Concatenate parts into one indexed mesh, offsetting each part's indices by the
running vertex count.

## Parameters

### parts

[`MeshPart`](Interface.MeshPart.md)[]

Mesh parts to merge.

## Returns

[`Mesh`](Interface.Mesh.md)

A single indexed [Mesh](Interface.Mesh.md).
