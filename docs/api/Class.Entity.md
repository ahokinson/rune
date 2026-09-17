[**rune**](README.md)

***

[rune](README.md) / Entity

# Abstract Class: Entity

Defined in: scene/entity.ts:33

Base class for every game object. Subclass as [Entity2D](Class.Entity2D.md) or
[Entity3D](Class.Entity3D.md) to add a transform and a `draw` implementation.

## Extended by

- [`Entity2D`](Class.Entity2D.md)
- [`Entity3D`](Class.Entity3D.md)

## Constructors

### Constructor

```ts
new Entity(options?): Entity;
```

Defined in: scene/entity.ts:55

#### Parameters

##### options?

[`EntityOptions`](Interface.EntityOptions.md) = `{}`

Construction options. All fields optional.

#### Returns

`Entity`

## Properties

### childList

```ts
protected readonly childList: Entity[] = [];
```

Defined in: scene/entity.ts:49

***

### enabled

```ts
enabled: boolean;
```

Defined in: scene/entity.ts:41

Skipped by update traversal when `false` (the whole subtree is skipped).

***

### markedForRemoval

```ts
markedForRemoval: boolean = false;
```

Defined in: scene/entity.ts:45

Set by [markForRemoval](#markforremoval); consumed by the scene's prune pass.

***

### parent

```ts
parent: Entity | null = null;
```

Defined in: scene/entity.ts:47

Parent entity, or `null` when this entity is a scene root.

***

### visible

```ts
visible: boolean;
```

Defined in: scene/entity.ts:43

Skipped by draw traversal when `false` (the whole subtree is skipped).

***

### zIndex

```ts
zIndex: number;
```

Defined in: scene/entity.ts:39

Draw/update order among siblings (low first). Mutating this after attaching
requires calling [markSortDirty](#marksortdirty) on the parent (or scene) so the next
pass re-sorts.

## Accessors

### children

#### Get Signature

```ts
get children(): readonly Entity[];
```

Defined in: scene/entity.ts:62

Children in draw/update order (sorted lazily by `zIndex`).

##### Returns

readonly `Entity`[]

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

`T` *extends* `Entity`

#### Parameters

##### child

`T`

Entity to attach.

#### Returns

`T`

The same `child`, for chaining.

***

### addAll()

```ts
addAll(children): void;
```

Defined in: scene/entity.ts:92

Attach several children at once, in iteration order.

#### Parameters

##### children

`Iterable`\<`Entity`\>

Entities to attach.

#### Returns

`void`

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

***

### markSortDirty()

```ts
markSortDirty(): void;
```

Defined in: scene/entity.ts:110

Re-sort children on the next pass; call after mutating a child's `zIndex`.

#### Returns

`void`

***

### onChildAdded()

```ts
protected onChildAdded(_child): void;
```

Defined in: scene/entity.ts:196

Notified when a child is attached so subclasses can propagate scene
attachment to descendants added after this entity is already in a scene.

#### Parameters

##### \_child

`Entity`

The newly attached child.

#### Returns

`void`

***

### onChildRemoved()

```ts
protected onChildRemoved(_child): void;
```

Defined in: scene/entity.ts:203

Notified when a child is detached so subclasses can propagate scene
detachment to descendants.

#### Parameters

##### \_child

`Entity`

The removed child.

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

***

### onExit()

```ts
onExit(): void;
```

Defined in: scene/entity.ts:131

Called once when this entity exits a scene. Override in game code.

#### Returns

`void`

***

### remove()

```ts
remove(child): void;
```

Defined in: scene/entity.ts:101

Detach a child from this entity.

#### Parameters

##### child

`Entity`

Entity to remove. No-op if not a child.

#### Returns

`void`

***

### restoreInterpolation()

```ts
restoreInterpolation(): void;
```

Defined in: scene/entity.ts:188

Restore pre-interpolation state captured by [snapshot](#snapshot).

#### Returns

`void`

***

### restoreInterpolationTree()

```ts
restoreInterpolationTree(): void;
```

Defined in: scene/entity.ts:165

Restore pre-interpolation state across this subtree.

#### Returns

`void`

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
