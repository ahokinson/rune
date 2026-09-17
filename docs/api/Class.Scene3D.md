[**rune**](README.md)

***

[rune](README.md) / Scene3D

# Class: Scene3D

Defined in: scene/scene3d.ts:46

A tree of [Entity3D](Class.Entity3D.md) projected/culled/depth-ordered against one
[Camera3D](Class.Camera3D.md) — the 3D counterpart to [Scene](Function.Scene.md).

It is not drawn directly by the renderer; a host [WorldView3D](Class.WorldView3D.md) (a 2D
entity) ticks it and draws it at a viewport, so 2D effects can sit in front of
or behind it. Entities draw low -> high `zIndex` so a surface can write depth
before points and arcs test against it.

## Constructors

### Constructor

```ts
new Scene3D(options): Scene3D;
```

Defined in: scene/scene3d.ts:61

#### Parameters

##### options

[`Scene3DOptions`](Interface.Scene3DOptions.md)

Construction options.

#### Returns

`Scene3D`

## Properties

### camera

```ts
readonly camera: Camera3D;
```

Defined in: scene/scene3d.ts:48

Camera used to project this scene.

***

### occlude

```ts
occlude: boolean;
```

Defined in: scene/scene3d.ts:50

Whether per-cell depth occlusion is enabled.

## Accessors

### entities

#### Get Signature

```ts
get entities(): readonly Entity3D[];
```

Defined in: scene/scene3d.ts:69

Root entities in draw order (sorted lazily by `zIndex`).

##### Returns

readonly [`Entity3D`](Class.Entity3D.md)[]

## Methods

### add()

```ts
add(entity): Entity3D;
```

Defined in: scene/scene3d.ts:84

Attach an entity (and its subtree) to this scene. If the entity is attached
elsewhere, it is removed from there first.

#### Parameters

##### entity

[`Entity3D`](Class.Entity3D.md)

Entity to add.

#### Returns

[`Entity3D`](Class.Entity3D.md)

The same `entity`, for chaining.

***

### addAll()

```ts
addAll(entities): void;
```

Defined in: scene/scene3d.ts:98

Add several entities at once, in iteration order.

#### Parameters

##### entities

`Iterable`\<[`Entity3D`](Class.Entity3D.md)\>

Entities to add.

#### Returns

`void`

***

### attachSubtree()

```ts
attachSubtree(entity): void;
```

Defined in: scene/scene3d.ts:131

Bind an entity (and everything beneath it) to this scene, firing
`onEnter`. Called by `add` and by `Entity3D` when a child
is attached to an entity that is already in the scene.

#### Parameters

##### entity

[`Entity3D`](Class.Entity3D.md)

Root of the subtree to attach.

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: scene/scene3d.ts:103

Remove every root entity (and its subtree). Handy for scene teardown.

#### Returns

`void`

***

### detachSubtree()

```ts
detachSubtree(entity): void;
```

Defined in: scene/scene3d.ts:144

Unbind an entity (and its subtree) from this scene, firing `onExit`.

#### Parameters

##### entity

[`Entity3D`](Class.Entity3D.md)

Root of the subtree to detach.

#### Returns

`void`

***

### draw()

```ts
draw(canvas, viewport): void;
```

Defined in: scene/scene3d.ts:174

Draw the scene's root entities, low -> high `zIndex`, into `canvas` at
`viewport`. Reallocates the depth (and subpixel) buffer if the canvas size
changed.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

Visible viewport in canvas pixels.

#### Returns

`void`

***

### markSortDirty()

```ts
markSortDirty(): void;
```

Defined in: scene/scene3d.ts:153

Re-sort entities on the next draw after a `zIndex` change.

#### Returns

`void`

***

### remove()

```ts
remove(entity): void;
```

Defined in: scene/scene3d.ts:113

Detach an entity from this scene. A nested child leaves the scene by
detaching from its parent.

#### Parameters

##### entity

[`Entity3D`](Class.Entity3D.md)

Entity to remove. No-op if not in this scene.

#### Returns

`void`

***

### update()

```ts
update(deltaMilliseconds): void;
```

Defined in: scene/scene3d.ts:162

Tick every root entity.

#### Parameters

##### deltaMilliseconds

`number`

Elapsed time since the last update.

#### Returns

`void`
