[**rune**](README.md)

***

[rune](README.md) / renderMesh

# Function: renderMesh()

```ts
function renderMesh(context): void;
```

Defined in: draw/mesh/rasterizer.ts:189

Render an indexed triangle mesh into `target` (a SubpixelTarget the caller
cleared this frame) and resolve it onto `canvas`. The pipeline transforms by
`model`, clips against the near plane in view space, projects with
perspective, culls back faces, and fills each triangle perspective-correct
with a per-subpixel depth test — colour comes from `shader`.

## Parameters

### context

[`RenderMeshContext`](Interface.RenderMeshContext.md)

Draw parameters (camera, viewport, target, mesh, shader, …).

## Returns

`void`
