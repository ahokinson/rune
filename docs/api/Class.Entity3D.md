[**rune**](README.md)

***

[rune](README.md) / Entity3D

# Abstract Class: Entity3D

Defined in: scene/entity3d.ts:64

A renderable node in a [Scene3D](Class.Scene3D.md).

Carries a full 3D transform (position + quaternion rotation + scale) that a
mesh-style subclass folds into its model matrix; world-space primitives (point
clouds, arcs, implicit surfaces) leave it at identity and project their own
world points directly. The [Scene3D](Class.Scene3D.md) projects/culls/depth-orders and calls
`draw()` each frame in `zIndex` order.

## Extends

- [`Entity`](Class.Entity.md)

## Extended by

- [`Particles3D`](Class.Particles3D.md)
- [`PointCloud3D`](Class.PointCloud3D.md)
- [`Polyline3D`](Class.Polyline3D.md)
- [`SurfaceMesh3D`](Class.SurfaceMesh3D.md)
- [`MeshEntity3D`](Class.MeshEntity3D.md)

## Constructors

### Constructor

```ts
new Entity3D(options?): Entity3D;
```

Defined in: scene/entity3d.ts:79

#### Parameters

##### options?

[`Entity3DOptions`](Interface.Entity3DOptions.md) = `{}`

Construction options. All fields optional.

#### Returns

`Entity3D`

#### Overrides

[`Entity`](Class.Entity.md).[`constructor`](Class.Entity.md#constructor)

## Properties

### childList

```ts
protected readonly childList: Entity[] = [];
```

Defined in: scene/entity.ts:49

#### Inherited from

[`Entity`](Class.Entity.md).[`childList`](Class.Entity.md#childlist)

***

### enabled

```ts
enabled: boolean;
```

Defined in: scene/entity.ts:41

Skipped by update traversal when `false` (the whole subtree is skipped).

#### Inherited from

[`Entity`](Class.Entity.md).[`enabled`](Class.Entity.md#enabled)

***

### markedForRemoval

```ts
markedForRemoval: boolean = false;
```

Defined in: scene/entity.ts:45

Set by [markForRemoval](Class.Entity.md#markforremoval); consumed by the scene's prune pass.

#### Inherited from

[`Entity`](Class.Entity.md).[`markedForRemoval`](Class.Entity.md#markedforremoval)

***

### parent

```ts
parent: Entity | null = null;
```

Defined in: scene/entity.ts:47

Parent entity, or `null` when this entity is a scene root.

#### Inherited from

[`Entity`](Class.Entity.md).[`parent`](Class.Entity.md#parent)

***

### position

```ts
position: Vector3;
```

Defined in: scene/entity3d.ts:66

World-space position.

***

### rotation

```ts
rotation: Quaternion;
```

Defined in: scene/entity3d.ts:68

Quaternion rotation.

***

### scale

```ts
scale: Vector3;
```

Defined in: scene/entity3d.ts:70

Per-axis scale.

***

### scene

```ts
scene: Scene3D | null = null;
```

Defined in: scene/entity3d.ts:72

Containing scene, set when this entity is attached.

***

### visible

```ts
visible: boolean;
```

Defined in: scene/entity.ts:43

Skipped by draw traversal when `false` (the whole subtree is skipped).

#### Inherited from

[`Entity`](Class.Entity.md).[`visible`](Class.Entity.md#visible)

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

[`Entity`](Class.Entity.md).[`zIndex`](Class.Entity.md#zindex)

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

[`Entity`](Class.Entity.md).[`children`](Class.Entity.md#children)

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

[`Entity`](Class.Entity.md).[`add`](Class.Entity.md#add)

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

[`Entity`](Class.Entity.md).[`addAll`](Class.Entity.md#addall)

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

[`Entity`](Class.Entity.md).[`applyInterpolation`](Class.Entity.md#applyinterpolation)

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

[`Entity`](Class.Entity.md).[`applyInterpolationTree`](Class.Entity.md#applyinterpolationtree)

***

### draw()

```ts
abstract draw(ctx): void;
```

Defined in: scene/entity3d.ts:117

Draw this entity into the 3D context.

#### Parameters

##### ctx

[`Draw3DContext`](Interface.Draw3DContext.md)

Shared draw context for this frame.

#### Returns

`void`

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

[`Entity`](Class.Entity.md).[`markForRemoval`](Class.Entity.md#markforremoval)

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

[`Entity`](Class.Entity.md).[`markSortDirty`](Class.Entity.md#marksortdirty)

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

#### Overrides

[`Entity`](Class.Entity.md).[`onChildAdded`](Class.Entity.md#onchildadded)

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

#### Overrides

[`Entity`](Class.Entity.md).[`onChildRemoved`](Class.Entity.md#onchildremoved)

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

[`Entity`](Class.Entity.md).[`onEnter`](Class.Entity.md#onenter)

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

[`Entity`](Class.Entity.md).[`onExit`](Class.Entity.md#onexit)

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

[`Entity`](Class.Entity.md).[`remove`](Class.Entity.md#remove)

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

[`Entity`](Class.Entity.md).[`restoreInterpolation`](Class.Entity.md#restoreinterpolation)

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

[`Entity`](Class.Entity.md).[`restoreInterpolationTree`](Class.Entity.md#restoreinterpolationtree)

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

[`Entity`](Class.Entity.md).[`snapshot`](Class.Entity.md#snapshot)

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

[`Entity`](Class.Entity.md).[`tick`](Class.Entity.md#tick)

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

[`Entity`](Class.Entity.md).[`update`](Class.Entity.md#update)

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
