[**rune**](README.md)

***

[rune](README.md) / TileLayer

# Class: TileLayer\<TCell\>

Defined in: scene/tileLayer.ts:74

Renders a tile grid through a tile set: a camera-culled pass that looks up each
visible cell's appearance (resolving animation and neighbour rules) and draws
it, with optional per-tile transient effects layered on top.

This replaces the per-game switch-on-cell draw loop and the ad-hoc bump
bookkeeping. Assumes an orthographic camera whose position is the top-left of
the view in world cells.

## Extends

- [`Entity2D`](Class.Entity2D.md)

## Type Parameters

### TCell

`TCell`

## Constructors

### Constructor

```ts
new TileLayer<TCell>(options): TileLayer<TCell>;
```

Defined in: scene/tileLayer.ts:90

#### Parameters

##### options

[`TileLayerOptions`](Interface.TileLayerOptions.md)\<`TCell`\>

Construction options.

#### Returns

`TileLayer`\<`TCell`\>

#### Overrides

[`Entity2D`](Class.Entity2D.md).[`constructor`](Class.Entity2D.md#constructor)

## Properties

### childList

```ts
protected readonly childList: Entity[] = [];
```

Defined in: scene/entity.ts:49

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`childList`](Class.Entity2D.md#childlist)

***

### collisionLayer?

```ts
optional collisionLayer?: number;
```

Defined in: scene/entity2d.ts:56

Layer this entity lives on (for collision filtering).

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`collisionLayer`](Class.Entity2D.md#collisionlayer)

***

### collisionMask?

```ts
optional collisionMask?: number;
```

Defined in: scene/entity2d.ts:58

Mask of layers this entity collides with.

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`collisionMask`](Class.Entity2D.md#collisionmask)

***

### enabled

```ts
enabled: boolean;
```

Defined in: scene/entity.ts:41

Skipped by update traversal when `false` (the whole subtree is skipped).

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`enabled`](Class.Entity2D.md#enabled)

***

### markedForRemoval

```ts
markedForRemoval: boolean = false;
```

Defined in: scene/entity.ts:45

Set by [markForRemoval](Class.Entity.md#markforremoval); consumed by the scene's prune pass.

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`markedForRemoval`](Class.Entity2D.md#markedforremoval)

***

### parallax

```ts
readonly parallax: Vector2;
```

Defined in: scene/tileLayer.ts:85

Per-axis parallax scroll factor relative to the camera.

***

### parent

```ts
parent: Entity | null = null;
```

Defined in: scene/entity.ts:47

Parent entity, or `null` when this entity is a scene root.

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`parent`](Class.Entity2D.md#parent)

***

### position

```ts
position: Vector2;
```

Defined in: scene/entity2d.ts:46

World-space position.

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`position`](Class.Entity2D.md#position)

***

### rotation

```ts
rotation: number;
```

Defined in: scene/entity2d.ts:48

Rotation in radians.

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`rotation`](Class.Entity2D.md#rotation)

***

### scale

```ts
scale: Vector2;
```

Defined in: scene/entity2d.ts:50

Per-axis scale.

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`scale`](Class.Entity2D.md#scale)

***

### scene

```ts
scene: SceneInstance | null = null;
```

Defined in: scene/entity2d.ts:54

Containing scene, set when this entity is attached.

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`scene`](Class.Entity2D.md#scene)

***

### size

```ts
size: Vector2;
```

Defined in: scene/entity2d.ts:52

AABB size used for collision.

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`size`](Class.Entity2D.md#size)

***

### tileMap

```ts
readonly tileMap: TileMap<TCell>;
```

Defined in: scene/tileLayer.ts:76

Tile map read for cell values.

***

### tileSet

```ts
readonly tileSet: TileSet<TCell>;
```

Defined in: scene/tileLayer.ts:78

Tile set resolving each cell's appearance.

***

### tileSize

```ts
readonly tileSize: number;
```

Defined in: scene/tileLayer.ts:80

Edge length of one tile in world units.

***

### visible

```ts
visible: boolean;
```

Defined in: scene/entity.ts:43

Skipped by draw traversal when `false` (the whole subtree is skipped).

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`visible`](Class.Entity2D.md#visible)

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

[`Entity2D`](Class.Entity2D.md).[`zIndex`](Class.Entity2D.md#zindex)

## Accessors

### bounds

#### Get Signature

```ts
get bounds(): Rectangle;
```

Defined in: scene/entity2d.ts:84

Local-space AABB at this entity's own position. (World-space hierarchy uses
[worldPosition](Class.Entity2D.md#worldposition); `bounds` stays local so unparented collision is
allocation-free and unchanged from before the transform grew.)

##### Returns

[`Rectangle`](Class.Rectangle.md)

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`bounds`](Class.Entity2D.md#bounds)

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

[`Entity2D`](Class.Entity2D.md).[`children`](Class.Entity2D.md#children)

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

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`worldPosition`](Class.Entity2D.md#worldposition)

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

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`worldRotation`](Class.Entity2D.md#worldrotation)

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

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`worldScale`](Class.Entity2D.md#worldscale)

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

[`Entity2D`](Class.Entity2D.md).[`add`](Class.Entity2D.md#add)

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

[`Entity2D`](Class.Entity2D.md).[`addAll`](Class.Entity2D.md#addall)

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

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`applyInterpolation`](Class.Entity2D.md#applyinterpolation)

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

[`Entity2D`](Class.Entity2D.md).[`applyInterpolationTree`](Class.Entity2D.md#applyinterpolationtree)

***

### bump()

```ts
bump(
   column, 
   row, 
   options?
): void;
```

Defined in: scene/tileLayer.ts:167

Nudge a tile up and back down, the classic bonked-block bounce.

#### Parameters

##### column

`number`

Tile column.

##### row

`number`

Tile row.

##### options?

Overrides for `rise` (fraction of `tileSize`) and `durationMilliseconds`.

###### durationMilliseconds?

`number`

###### rise?

`number`

#### Returns

`void`

***

### collidersNear()

```ts
collidersNear(box, pad): Rectangle[];
```

Defined in: scene/tileLayer.ts:202

Solid-tile rectangles overlapping `box` expanded by `pad`, for swept-AABB
collision — the small obstacle set near a mover, not the whole grid.

#### Parameters

##### box

[`Rectangle`](Class.Rectangle.md)

AABB to expand and test.

##### pad

`number`

Expansion on every side, in world units.

#### Returns

[`Rectangle`](Class.Rectangle.md)[]

Solid tile rectangles near `box`.

***

### draw()

```ts
draw(canvas, camera): void;
```

Defined in: scene/tileLayer.ts:120

Draw the visible tiles, culled to the camera, with any active effects applied.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

##### camera

[`Camera`](Class.Camera.md)

Active camera.

#### Returns

`void`

#### Overrides

[`Entity2D`](Class.Entity2D.md).[`draw`](Class.Entity2D.md#draw)

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

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`drawTree`](Class.Entity2D.md#drawtree)

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

[`Entity2D`](Class.Entity2D.md).[`markForRemoval`](Class.Entity2D.md#markforremoval)

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

[`Entity2D`](Class.Entity2D.md).[`markSortDirty`](Class.Entity2D.md#marksortdirty)

***

### nudge()

```ts
nudge(
   column, 
   row, 
   offset, 
   tween
): void;
```

Defined in: scene/tileLayer.ts:188

Drive a tile's draw-time offset with an arbitrary tween (the tween's value
scales `offset`). Use [bump](#bump) for the common vertical bounce.

#### Parameters

##### column

`number`

Tile column.

##### row

`number`

Tile row.

##### offset

[`Vector2`](Class.Vector2.md)

Peak shift in world cells.

##### tween

[`TweenOptions`](Interface.TweenOptions.md)

Tween options driving the effect.

#### Returns

`void`

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

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`onChildAdded`](Class.Entity2D.md#onchildadded)

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

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`onChildRemoved`](Class.Entity2D.md#onchildremoved)

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

[`Entity2D`](Class.Entity2D.md)

The overlapping entity.

#### Returns

`void`

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`onCollide`](Class.Entity2D.md#oncollide)

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

[`Entity2D`](Class.Entity2D.md).[`onEnter`](Class.Entity2D.md#onenter)

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

[`Entity2D`](Class.Entity2D.md).[`onExit`](Class.Entity2D.md#onexit)

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

[`Entity2D`](Class.Entity2D.md).[`remove`](Class.Entity2D.md#remove)

***

### restoreInterpolation()

```ts
restoreInterpolation(): void;
```

Defined in: scene/entity2d.ts:153

Restore the post-tick position after a draw that applied interpolation.

#### Returns

`void`

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`restoreInterpolation`](Class.Entity2D.md#restoreinterpolation)

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

[`Entity2D`](Class.Entity2D.md).[`restoreInterpolationTree`](Class.Entity2D.md#restoreinterpolationtree)

***

### snapshot()

```ts
snapshot(): void;
```

Defined in: scene/entity2d.ts:126

Capture the current position for render-frame interpolation.

#### Returns

`void`

#### Inherited from

[`Entity2D`](Class.Entity2D.md).[`snapshot`](Class.Entity2D.md#snapshot)

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

[`Entity2D`](Class.Entity2D.md).[`tick`](Class.Entity2D.md#tick)

***

### update()

```ts
update(deltaMilliseconds): void;
```

Defined in: scene/tileLayer.ts:105

Advance the tile set's animations and any active tile effects.

#### Parameters

##### deltaMilliseconds

`number`

Elapsed time since the last update.

#### Returns

`void`

#### Overrides

[`Entity2D`](Class.Entity2D.md).[`update`](Class.Entity2D.md#update)
