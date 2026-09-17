[**rune**](README.md)

***

[rune](README.md) / RenderGridSurfacesContext

# Interface: RenderGridSurfacesContext

Defined in: draw/raycast/grid.ts:72

Options for [renderGridSurfaces](Function.renderGridSurfaces.md).

## Properties

### camera

```ts
camera: Camera;
```

Defined in: draw/raycast/grid.ts:74

***

### canvas

```ts
canvas: CanvasSurface;
```

Defined in: draw/raycast/grid.ts:73

***

### depthBuffer

```ts
depthBuffer: ColumnDepthBuffer;
```

Defined in: draw/raycast/grid.ts:78

***

### eyeZ

```ts
eyeZ: number;
```

Defined in: draw/raycast/grid.ts:84

Camera eye height in world Z.

***

### maxDistance?

```ts
optional maxDistance?: number;
```

Defined in: draw/raycast/grid.ts:86

Ray cutoff distance. Defaults to 32.

***

### projection

```ts
projection: RaycastProjection;
```

Defined in: draw/raycast/grid.ts:75

***

### screenColumns

```ts
screenColumns: number;
```

Defined in: draw/raycast/grid.ts:80

Screen columns to cast (one ray each).

***

### screenRows

```ts
screenRows: number;
```

Defined in: draw/raycast/grid.ts:82

Screen rows; the horizon is fixed at `floor(screenRows / 2)`.

***

### shader

```ts
shader: SurfaceShader;
```

Defined in: draw/raycast/grid.ts:77

***

### surfaces

```ts
surfaces: GridSurfaces;
```

Defined in: draw/raycast/grid.ts:76
