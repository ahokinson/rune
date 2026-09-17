[**rune**](README.md)

***

[rune](README.md) / Entity2D

# Class: Entity2D

Defined in: scene/entity2d.ts:44

A renderable node in a 2D [Scene](Class.SceneInstance.md).

Holds a full 2D transform (position, rotation, scale) plus a `size` used for
AABB collision, and smooths its position between fixed ticks for high-framerate
rendering. Game objects extend this (or a primitive subclass like
[SpriteEntity](Class.SpriteEntity.md)) and override `update()`/`draw()`.

## Extends

- [`Entity`](Class.Entity.md)

## Extended by

- [`Particles`](Class.Particles.md)
- [`TriggerVolume`](Class.TriggerVolume.md)
- [`AnimatedSpriteEntity`](Class.AnimatedSpriteEntity.md)
- [`SpriteEntity`](Class.SpriteEntity.md)
- [`TileLayer`](Class.TileLayer.md)
- [`WorldView3D`](Class.WorldView3D.md)

## Constructors

### Constructor

```ts
new Entity2D(options?): Entity2D;
```

Defined in: scene/entity2d.ts:69

#### Parameters

##### options?

[`Entity2DOptions`](Interface.Entity2DOptions.md) = `{}`

Construction options. All fields optional.

#### Returns

`Entity2D`

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

### collisionLayer?

```ts
optional collisionLayer?: number;
```

Defined in: scene/entity2d.ts:56

Layer this entity lives on (for collision filtering).

***

### collisionMask?

```ts
optional collisionMask?: number;
```

Defined in: scene/entity2d.ts:58

Mask of layers this entity collides with.

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
position: Vector2;
```

Defined in: scene/entity2d.ts:46

World-space position.

***

### rotation

```ts
rotation: number;
```

Defined in: scene/entity2d.ts:48

Rotation in radians.

***

### scale

```ts
scale: Vector2;
```

Defined in: scene/entity2d.ts:50

Per-axis scale.

***

### scene

```ts
scene: SceneInstance | null = null;
```

Defined in: scene/entity2d.ts:54

Containing scene, set when this entity is attached.

***

### size

```ts
size: Vector2;
```

Defined in: scene/entity2d.ts:52

AABB size used for collision.

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

### bounds

#### Get Signature

```ts
get bounds(): Rectangle;
```

Defined in: scene/entity2d.ts:84

Local-space AABB at this entity's own position. (World-space hierarchy uses
[worldPosition](#worldposition); `bounds` stays local so unparented collision is
allocation-free and unchanged from before the transform grew.)

##### Returns

[`Rectangle`](Class.Rectangle.md)

***

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

### worldPosition

#### Get Signature

```ts
get worldPosition(): Vector2;
```

Defined in: scene/entity2d.ts:114

World-space position, composed up the parent chain.

##### Returns

[`Vector2`](Class.Vector2.md)

***

### worldRotation

#### Get Signature

```ts
get worldRotation(): number;
```

Defined in: scene/entity2d.ts:100

World-space rotation, composed up the parent chain.

##### Returns

`number`

***

### worldScale

#### Get Signature

```ts
get worldScale(): Vector2;
```

Defined in: scene/entity2d.ts:106

World-space scale, composed up the parent chain.

##### Returns

[`Vector2`](Class.Vector2.md)

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
applyInterpolation(alpha): boolean;
```

Defined in: scene/entity2d.ts:139

Lerp between the previous and current position by `alpha`, swapping in the
interpolated position for the duration of the draw.

#### Parameters

##### alpha

`number`

Interpolation factor (0 = previous tick, 1 = current).

#### Returns

`boolean`

`true` if interpolation was applied.

#### Overrides

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
draw(_canvas, _camera): void;
```

Defined in: scene/entity2d.ts:180

Override to render this entity. Children are drawn afterwards, on top.

#### Parameters

##### \_canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

##### \_camera

[`Camera`](Class.Camera.md)

Active camera.

#### Returns

`void`

***

### drawTree()

```ts
drawTree(canvas, camera): void;
```

Defined in: scene/entity2d.ts:188

Draw this entity and recurse into visible 2D children in `zIndex` order.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

##### camera

[`Camera`](Class.Camera.md)

Active camera.

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

Defined in: scene/entity2d.ts:201

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

Defined in: scene/entity2d.ts:208

#### Parameters

##### child

[`Entity`](Class.Entity.md)

The removed child.

#### Returns

`void`

#### Overrides

[`Entity`](Class.Entity.md).[`onChildRemoved`](Class.Entity.md#onchildremoved)

***

### onCollide()?

```ts
optional onCollide(other): void;
```

Defined in: scene/entity2d.ts:170

Override to react when this entity overlaps another. Fired by
`detectCollisions()` for each root entity whose `collisionLayer` matches this
entity's `collisionMask`. Left undefined by default so non-colliding entities
are skipped entirely.

#### Parameters

##### other

`Entity2D`

The overlapping entity.

#### Returns

`void`

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

Defined in: scene/entity2d.ts:153

Restore the post-tick position after a draw that applied interpolation.

#### Returns

`void`

#### Overrides

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

Defined in: scene/entity2d.ts:126

Capture the current position for render-frame interpolation.

#### Returns

`void`

#### Overrides

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
