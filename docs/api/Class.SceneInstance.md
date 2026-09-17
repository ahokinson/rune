[**rune**](README.md)

***

[rune](README.md) / SceneInstance

# Class: SceneInstance

Defined in: scene/scene.ts:38

The top-level 2D container: a tree of [Entity2D](Class.Entity2D.md) drawn through one
[Camera](Class.Camera.md).

The scene holds the root entities; nested children live on their parent and are
updated/drawn/pruned alongside it, so the whole hierarchy ticks from here.

## Constructors

### Constructor

```ts
new SceneInstance(name, options?): Scene;
```

Defined in: scene/scene.ts:54

#### Parameters

##### name

`string`

Scene identifier.

##### options?

`SceneOptions` = `{}`

Construction options. All fields optional.

#### Returns

`Scene`

## Properties

### autoPrune

```ts
autoPrune: boolean;
```

Defined in: scene/scene.ts:46

Whether [update](#update) prunes marked-for-removal entities each tick.

***

### camera

```ts
readonly camera: Camera;
```

Defined in: scene/scene.ts:42

Camera used to draw this scene.

***

### events

```ts
readonly events: EventEmitter<SceneEventMap>;
```

Defined in: scene/scene.ts:44

Event emitter for scene lifecycle and entity add/remove events.

***

### name

```ts
readonly name: string;
```

Defined in: scene/scene.ts:40

Scene identifier (used for logging/debugging).

## Accessors

### entities

#### Get Signature

```ts
get entities(): readonly Entity2D[];
```

Defined in: scene/scene.ts:62

Root entities in draw order (sorted lazily by `zIndex`).

##### Returns

readonly [`Entity2D`](Class.Entity2D.md)[]

## Methods

### add()

```ts
add(entity): Entity2D;
```

Defined in: scene/scene.ts:77

Attach an entity (and its subtree) to this scene. If the entity is attached
elsewhere, it is removed from there first.

#### Parameters

##### entity

[`Entity2D`](Class.Entity2D.md)

Entity to add.

#### Returns

[`Entity2D`](Class.Entity2D.md)

The same `entity`, for chaining.

***

### addAll()

```ts
addAll(entities): void;
```

Defined in: scene/scene.ts:91

Add several entities at once, in iteration order.

#### Parameters

##### entities

`Iterable`\<[`Entity2D`](Class.Entity2D.md)\>

Entities to add.

#### Returns

`void`

***

### attachSubtree()

```ts
attachSubtree(entity): void;
```

Defined in: scene/scene.ts:127

Bind an entity (and everything beneath it) to this scene, firing
[onEnter](#onenter). Called by [add](#add) and by [Entity2D](Class.Entity2D.md) when a child
is attached to an entity that is already in the scene.

#### Parameters

##### entity

[`Entity2D`](Class.Entity2D.md)

Root of the subtree to attach.

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: scene/scene.ts:96

Remove every root entity (and its subtree). Handy for scene teardown.

#### Returns

`void`

***

### detachSubtree()

```ts
detachSubtree(entity): void;
```

Defined in: scene/scene.ts:141

Unbind an entity (and its subtree) from this scene, firing [onExit](#onexit).

#### Parameters

##### entity

[`Entity2D`](Class.Entity2D.md)

Root of the subtree to detach.

#### Returns

`void`

***

### draw()

```ts
draw(canvas, renderAlpha?): void;
```

Defined in: scene/scene.ts:218

Draw the scene's root entities, optionally interpolating between ticks.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

##### renderAlpha?

`number` = `0`

Interpolation factor (0 = last tick, 1 = current).
  Default `0` (no interpolation).

#### Returns

`void`

***

### markSortDirty()

```ts
markSortDirty(): void;
```

Defined in: scene/scene.ts:151

Re-sort roots on the next pass; call after mutating a root's `zIndex`.

#### Returns

`void`

***

### onEnter()

```ts
onEnter(): void;
```

Defined in: scene/scene.ts:156

Emit the `enter` event. Called by the scene manager.

#### Returns

`void`

***

### onExit()

```ts
onExit(): void;
```

Defined in: scene/scene.ts:161

Emit the `exit` event. Called by the scene manager.

#### Returns

`void`

***

### pruneRemoved()

```ts
pruneRemoved(): number;
```

Defined in: scene/scene.ts:181

Remove every root (or child) flagged with [Entity.markForRemoval](Class.Entity.md#markforremoval),
detaching each from the scene.

#### Returns

`number`

Number of entities removed.

***

### remove()

```ts
remove(entity): void;
```

Defined in: scene/scene.ts:107

Detach an entity from this scene. A nested child leaves the scene by
detaching from its parent, which routes back here through [Entity2D](Class.Entity2D.md)'s
`onChildRemoved` -> [detachSubtree](#detachsubtree).

#### Parameters

##### entity

[`Entity2D`](Class.Entity2D.md)

Entity to remove. No-op if not in this scene.

#### Returns

`void`

***

### update()

```ts
update(deltaMilliseconds): void;
```

Defined in: scene/scene.ts:170

Tick every root entity and optionally prune removed ones.

#### Parameters

##### deltaMilliseconds

`number`

Elapsed time since the last update.

#### Returns

`void`
