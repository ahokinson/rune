[**rune**](README.md)

***

[rune](README.md) / renderGridSurfaces

# Function: renderGridSurfaces()

```ts
function renderGridSurfaces(context): void;
```

Defined in: draw/raycast/grid.ts:119

Render a first-person view of a grid of variable-height floor/ceiling cells
via per-column DDA raycasting, writing colour to `canvas` (two vertical
sub-pixels per cell through the ▀ half-block) and depth to `depthBuffer` for
later billboard occlusion. Walls, floor/ceiling strips, and step walls (where
a neighbour's floor or ceiling height differs) are all drawn. Geometry comes
from [GridSurfaces](Interface.GridSurfaces.md); colour from [SurfaceShader](Interface.SurfaceShader.md).

## Parameters

### context

[`RenderGridSurfacesContext`](Interface.RenderGridSurfacesContext.md)

## Returns

`void`
