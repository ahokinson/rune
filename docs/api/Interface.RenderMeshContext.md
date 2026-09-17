[**rune**](README.md)

***

[rune](README.md) / RenderMeshContext

# Interface: RenderMeshContext

Defined in: draw/mesh/rasterizer.ts:59

Options for [renderMesh](Function.renderMesh.md).

## Properties

### camera

```ts
camera: Camera3D;
```

Defined in: draw/mesh/rasterizer.ts:66

***

### canvas?

```ts
optional canvas?: CanvasSurface;
```

Defined in: draw/mesh/rasterizer.ts:65

Resolved to here after the mesh is drawn into `target`. Omit to render depth
and colour into `target` only (e.g. a shadow-map depth pass) without blitting
to a canvas.

***

### cullBackface?

```ts
optional cullBackface?: boolean;
```

Defined in: draw/mesh/rasterizer.ts:80

Cull triangles facing away from the camera. Default true.

***

### mesh

```ts
mesh: Mesh;
```

Defined in: draw/mesh/rasterizer.ts:74

***

### model

```ts
model: Matrix4;
```

Defined in: draw/mesh/rasterizer.ts:75

***

### near?

```ts
optional near?: number;
```

Defined in: draw/mesh/rasterizer.ts:78

View-space near plane; triangles are clipped against it. Default 0.05.

***

### shader

```ts
shader: MeshShader;
```

Defined in: draw/mesh/rasterizer.ts:76

***

### target

```ts
target: SubpixelTarget;
```

Defined in: draw/mesh/rasterizer.ts:73

Persistent colour + depth buffer, cleared by the caller each frame.

***

### viewport

```ts
viewport: Viewport3D;
```

Defined in: draw/mesh/rasterizer.ts:71

Placement + scale in subpixel coordinates (centerX/centerY/radius in
`target` subpixels; aspectY ~1 since subpixels are ~square).

***

### wireframe?

```ts
optional wireframe?: boolean;
```

Defined in: draw/mesh/rasterizer.ts:82

Draw triangle edges instead of filled faces. Default false.
