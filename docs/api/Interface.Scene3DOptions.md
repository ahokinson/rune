[**rune**](README.md)

***

[rune](README.md) / Scene3DOptions

# Interface: Scene3DOptions

Defined in: scene/scene3d.ts:18

Options for constructing a [Scene3D](Class.Scene3D.md).

## Properties

### camera

```ts
camera: Camera3D;
```

Defined in: scene/scene3d.ts:20

Camera used to project this scene.

***

### clearColor?

```ts
optional clearColor?: Color;
```

Defined in: scene/scene3d.ts:34

Colour to clear the subpixel target to each frame. Default black.

***

### occlude?

```ts
optional occlude?: boolean;
```

Defined in: scene/scene3d.ts:25

Enable per-cell depth occlusion so geometry hides behind the nearer surface
drawn earlier this frame. Off by default (painter's order only).

***

### subpixel?

```ts
optional subpixel?: boolean;
```

Defined in: scene/scene3d.ts:32

Allocate a shared [SubpixelTarget](Class.SubpixelTarget.md) (the renderMesh rasterizer) cleared
to [clearColor](#clearcolor) each frame and handed to entities via `ctx.target`.
Enable for [MeshEntity3D](Class.MeshEntity3D.md) scenes; leave off for the braille/projector
primitives.
