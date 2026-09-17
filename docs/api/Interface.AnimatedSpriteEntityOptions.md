[**rune**](README.md)

***

[rune](README.md) / AnimatedSpriteEntityOptions

# Interface: AnimatedSpriteEntityOptions

Defined in: scene/animatedSpriteEntity.ts:16

Options for constructing an [AnimatedSpriteEntity](Class.AnimatedSpriteEntity.md).

## Extends

- [`Entity2DOptions`](Interface.Entity2DOptions.md)

## Properties

### animation

```ts
animation: AnimatedSprite<Sprite>;
```

Defined in: scene/animatedSpriteEntity.ts:18

Animation driving the rendered frames.

***

### collisionLayer?

```ts
optional collisionLayer?: number;
```

Defined in: scene/entity2d.ts:31

Layer this entity lives on (for collision filtering).

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`collisionLayer`](Interface.Entity2DOptions.md#collisionlayer)

***

### collisionMask?

```ts
optional collisionMask?: number;
```

Defined in: scene/entity2d.ts:33

Mask of layers this entity collides with.

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`collisionMask`](Interface.Entity2DOptions.md#collisionmask)

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: scene/entity.ts:24

Whether the entity (and its subtree) is updated each tick. Default `true`.

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`enabled`](Interface.Entity2DOptions.md#enabled)

***

### position?

```ts
optional position?: Vector2;
```

Defined in: scene/entity2d.ts:23

World-space position. Default `(0, 0)`.

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`position`](Interface.Entity2DOptions.md#position)

***

### rotation?

```ts
optional rotation?: number;
```

Defined in: scene/entity2d.ts:25

Rotation in radians. Default `0`.

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`rotation`](Interface.Entity2DOptions.md#rotation)

***

### scale?

```ts
optional scale?: Vector2;
```

Defined in: scene/entity2d.ts:27

Per-axis scale. Default `(1, 1)`.

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`scale`](Interface.Entity2DOptions.md#scale)

***

### size?

```ts
optional size?: Vector2;
```

Defined in: scene/entity2d.ts:29

AABB size used for collision. Default `(1, 1)`.

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`size`](Interface.Entity2DOptions.md#size)

***

### visible?

```ts
optional visible?: boolean;
```

Defined in: scene/entity.ts:26

Whether the entity (and its subtree) is drawn. Default `true`.

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`visible`](Interface.Entity2DOptions.md#visible)

***

### zIndex?

```ts
optional zIndex?: number;
```

Defined in: scene/entity.ts:22

Draw/update order among siblings (low first). Mutating this after attaching
requires [Entity.markSortDirty](Class.Entity.md#marksortdirty) on the parent (or scene) so the next
pass re-sorts. Default `0`.

#### Inherited from

[`Entity2DOptions`](Interface.Entity2DOptions.md).[`zIndex`](Interface.Entity2DOptions.md#zindex)
