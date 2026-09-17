[**rune**](README.md)

***

[rune](README.md) / Draw3DContext

# Interface: Draw3DContext

Defined in: scene/entity3d.ts:30

Everything a [Scene3D](Class.Scene3D.md) hands an [Entity3D](Class.Entity3D.md) to draw one frame.

Two rasterizers share this context: the braille/projector primitives test/write
`depth` (a per-cell buffer; `occlude` toggles it), while renderMesh-based
entities draw into the shared `target` (a subpixel colour+depth buffer the scene
clears each frame). `target` is `null` unless the scene runs in subpixel mode.

## Properties

### camera

```ts
camera: Camera3D;
```

Defined in: scene/entity3d.ts:34

Active 3D camera.

***

### canvas

```ts
canvas: CanvasSurface;
```

Defined in: scene/entity3d.ts:32

Target canvas.

***

### depth

```ts
depth: GridDepthBuffer;
```

Defined in: scene/entity3d.ts:38

Per-cell depth buffer (LARGER = NEARER).

***

### occlude

```ts
occlude: boolean;
```

Defined in: scene/entity3d.ts:40

Whether to test/write against `depth` this frame.

***

### target

```ts
target: SubpixelTarget | null;
```

Defined in: scene/entity3d.ts:42

Shared subpixel target, or `null` when subpixel mode is off.

***

### viewport

```ts
viewport: Viewport3D;
```

Defined in: scene/entity3d.ts:36

Visible viewport in canvas pixels.
