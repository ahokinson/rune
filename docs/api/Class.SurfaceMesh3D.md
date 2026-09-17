[**rune**](README.md)

***

[rune](README.md) / SurfaceMesh3D

# Class: SurfaceMesh3D

Defined in: geom/geometry3d.ts:242

Renders an implicit surface by inverse-projecting each braille sub-pixel
against the sphere (per-cell raycast), driving a game sampler, and writing the
cell's far-most surface depth into the buffer so points/arcs occlude correctly.
Coupled to SphereProjector because implicit-surface raycasting needs its
surface-specialised inverse (`surfaceInto`).

## Extends

- [`Entity3D`](Class.Entity3D.md)

## Constructors

### Constructor

```ts
new SurfaceMesh3D(
   projector, 
   sampler, 
   options?
): SurfaceMesh3D;
```

Defined in: geom/geometry3d.ts:255

#### Parameters

##### projector

[`SphereProjector`](Class.SphereProjector.md)

Sphere projector for inverse raycasting.

##### sampler

[`SurfaceSampler`](Interface.SurfaceSampler.md)

Game-supplied cell sampler.

##### options?

[`SurfaceMesh3DOptions`](Interface.SurfaceMesh3DOptions.md) = `{}`

zIndex.

#### Returns

`SurfaceMesh3D`

#### Overrides

[`Entity3D`](Class.Entity3D.md).[`constructor`](Class.Entity3D.md#constructor)

## Properties

### childList

```ts
protected readonly childList: Entity[] = [];
```

Defined in: scene/entity.ts:49

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`childList`](Class.Entity3D.md#childlist)

***

### enabled

```ts
enabled: boolean;
```

Defined in: scene/entity.ts:41

Skipped by update traversal when `false` (the whole subtree is skipped).

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`enabled`](Class.Entity3D.md#enabled)

***

### markedForRemoval

```ts
markedForRemoval: boolean = false;
```

Defined in: scene/entity.ts:45

Set by [markForRemoval](Class.Entity.md#markforremoval); consumed by the scene's prune pass.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`markedForRemoval`](Class.Entity3D.md#markedforremoval)

***

### parent

```ts
parent: Entity | null = null;
```

Defined in: scene/entity.ts:47

Parent entity, or `null` when this entity is a scene root.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`parent`](Class.Entity3D.md#parent)

***

### position

```ts
position: Vector3;
```

Defined in: scene/entity3d.ts:66

World-space position.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`position`](Class.Entity3D.md#position)

***

### projector

```ts
projector: SphereProjector;
```

Defined in: geom/geometry3d.ts:244

Sphere projector used for inverse sub-pixel raycasting.

***

### rotation

```ts
rotation: Quaternion;
```

Defined in: scene/entity3d.ts:68

Quaternion rotation.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`rotation`](Class.Entity3D.md#rotation)

***

### sampler

```ts
sampler: SurfaceSampler;
```

Defined in: geom/geometry3d.ts:246

Game-supplied sampler that packs each cell.

***

### scale

```ts
scale: Vector3;
```

Defined in: scene/entity3d.ts:70

Per-axis scale.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`scale`](Class.Entity3D.md#scale)

***

### scene

```ts
scene: Scene3D | null = null;
```

Defined in: scene/entity3d.ts:72

Containing scene, set when this entity is attached.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`scene`](Class.Entity3D.md#scene)

***

### visible

```ts
visible: boolean;
```

Defined in: scene/entity.ts:43

Skipped by draw traversal when `false` (the whole subtree is skipped).

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`visible`](Class.Entity3D.md#visible)

***

### zIndex

```ts
zIndex: number;
```

Defined in: scene/entity.ts:39

Draw/update order among siblings (low first). Mutating this after attaching
requires calling [markSortDirty](Class.Entity.md#marksortdirty) on the parent (or scene) so the next
pass re-sorts.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`zIndex`](Class.Entity3D.md#zindex)

## Accessors

### children

#### Get Signature

```ts
get children(): readonly Entity[];
```

Defined in: scene/entity.ts:62

Children in draw/update order (sorted lazily by `zIndex`).

##### Returns

readonly [`Entity`](Class.Entity.md)[]

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`children`](Class.Entity3D.md#children)

***

### model

#### Get Signature

```ts
get model(): Matrix4;
```

Defined in: scene/entity3d.ts:90

This entity's own transform as a matrix, recomposed each call into a shared
buffer (transforms are mutated in place, so there's nothing safe to cache).

##### Returns

[`Matrix4`](Class.Matrix4.md)

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`model`](Class.Entity3D.md#model)

## Methods

### add()

```ts
add<T>(child): T;
```

Defined in: scene/entity.ts:77

Attach a child whose transform composes onto this one and whose lifecycle
follows it (added/removed from the scene alongside this entity).

#### Type Parameters

##### T

`T` *extends* [`Entity`](Class.Entity.md)

#### Parameters

##### child

`T`

Entity to attach.

#### Returns

`T`

The same `child`, for chaining.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`add`](Class.Entity3D.md#add)

***

### addAll()

```ts
addAll(children): void;
```

Defined in: scene/entity.ts:92

Attach several children at once, in iteration order.

#### Parameters

##### children

`Iterable`\<[`Entity`](Class.Entity.md)\>

Entities to attach.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`addAll`](Class.Entity3D.md#addall)

***

### applyInterpolation()

```ts
applyInterpolation(_alpha): boolean;
```

Defined in: scene/entity.ts:184

Apply render-frame interpolation to this node.

#### Parameters

##### \_alpha

`number`

Interpolation factor (0 = previous tick, 1 = current).

#### Returns

`boolean`

Whether anything was interpolated.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`applyInterpolation`](Class.Entity3D.md#applyinterpolation)

***

### applyInterpolationTree()

```ts
applyInterpolationTree(alpha): void;
```

Defined in: scene/entity.ts:158

Apply render-frame interpolation across this subtree.

#### Parameters

##### alpha

`number`

Interpolation factor (0 = previous tick, 1 = current).

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`applyInterpolationTree`](Class.Entity3D.md#applyinterpolationtree)

***

### draw()

```ts
draw(ctx): void;
```

Defined in: geom/geometry3d.ts:267

Walk the disc, run the 2x4 braille sub-pixel grid per cell, drive the
sampler, and write the cell's far-most surface depth into the buffer.

#### Parameters

##### ctx

[`Draw3DContext`](Interface.Draw3DContext.md)

3D draw context.

#### Returns

`void`

#### Overrides

[`Entity3D`](Class.Entity3D.md).[`draw`](Class.Entity3D.md#draw)

***

### drawTree()

```ts
drawTree(ctx): void;
```

Defined in: scene/entity3d.ts:124

Draw this entity and recurse into visible 3D children in `zIndex` order.

#### Parameters

##### ctx

[`Draw3DContext`](Interface.Draw3DContext.md)

Shared draw context for this frame.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`drawTree`](Class.Entity3D.md#drawtree)

***

### markForRemoval()

```ts
markForRemoval(): void;
```

Defined in: scene/entity.ts:118

Mark this entity (and its subtree) for removal. Disables and hides it
immediately; the scene prunes it on its next prune pass.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`markForRemoval`](Class.Entity3D.md#markforremoval)

***

### markSortDirty()

```ts
markSortDirty(): void;
```

Defined in: scene/entity.ts:110

Re-sort children on the next pass; call after mutating a child's `zIndex`.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`markSortDirty`](Class.Entity3D.md#marksortdirty)

***

### onChildAdded()

```ts
protected onChildAdded(child): void;
```

Defined in: scene/entity3d.ts:135

#### Parameters

##### child

[`Entity`](Class.Entity.md)

The newly attached child.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`onChildAdded`](Class.Entity3D.md#onchildadded)

***

### onChildRemoved()

```ts
protected onChildRemoved(child): void;
```

Defined in: scene/entity3d.ts:142

#### Parameters

##### child

[`Entity`](Class.Entity.md)

The removed child.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`onChildRemoved`](Class.Entity3D.md#onchildremoved)

***

### onEnter()

```ts
onEnter(): void;
```

Defined in: scene/entity.ts:129

Called once when this entity enters a scene. Override in game code.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`onEnter`](Class.Entity3D.md#onenter)

***

### onExit()

```ts
onExit(): void;
```

Defined in: scene/entity.ts:131

Called once when this entity exits a scene. Override in game code.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`onExit`](Class.Entity3D.md#onexit)

***

### remove()

```ts
remove(child): void;
```

Defined in: scene/entity.ts:101

Detach a child from this entity.

#### Parameters

##### child

[`Entity`](Class.Entity.md)

Entity to remove. No-op if not a child.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`remove`](Class.Entity3D.md#remove)

***

### restoreInterpolation()

```ts
restoreInterpolation(): void;
```

Defined in: scene/entity.ts:188

Restore pre-interpolation state captured by [snapshot](Class.Entity.md#snapshot).

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`restoreInterpolation`](Class.Entity3D.md#restoreinterpolation)

***

### restoreInterpolationTree()

```ts
restoreInterpolationTree(): void;
```

Defined in: scene/entity.ts:165

Restore pre-interpolation state across this subtree.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`restoreInterpolationTree`](Class.Entity3D.md#restoreinterpolationtree)

***

### snapshot()

```ts
snapshot(): void;
```

Defined in: scene/entity.ts:177

Capture the pre-tick state used for render-frame interpolation.
A no-op by default; [Entity2D](Class.Entity2D.md) snapshots its position.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`snapshot`](Class.Entity3D.md#snapshot)

***

### tick()

```ts
tick(deltaMilliseconds): void;
```

Defined in: scene/entity.ts:146

Snapshot + update this subtree in `zIndex` order, skipping disabled branches.

#### Parameters

##### deltaMilliseconds

`number`

Elapsed time since the last update.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`tick`](Class.Entity3D.md#tick)

***

### update()

```ts
update(_deltaMilliseconds): void;
```

Defined in: scene/entity.ts:137

Per-fixed-tick update. Override in game code.

#### Parameters

##### \_deltaMilliseconds

`number`

Elapsed time since the last update.

#### Returns

`void`

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`update`](Class.Entity3D.md#update)

***

### worldModelInto()

```ts
worldModelInto(out): Matrix4;
```

Defined in: scene/entity3d.ts:101

The transform composed up the parent chain (parent world * local), written
into `out`. Use this when a parented mesh should follow its parent.

#### Parameters

##### out

[`Matrix4`](Class.Matrix4.md)

Target matrix.

#### Returns

[`Matrix4`](Class.Matrix4.md)

`out` for chaining.

#### Inherited from

[`Entity3D`](Class.Entity3D.md).[`worldModelInto`](Class.Entity3D.md#worldmodelinto)
