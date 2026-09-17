[**rune**](README.md)

***

[rune](README.md) / Entity2DOptions

# Interface: Entity2DOptions

Defined in: scene/entity2d.ts:21

Options for constructing an [Entity2D](Class.Entity2D.md).

## Extends

- [`EntityOptions`](Interface.EntityOptions.md)

## Extended by

- [`AnimatedSpriteEntityOptions`](Interface.AnimatedSpriteEntityOptions.md)
- [`SpriteEntityOptions`](Interface.SpriteEntityOptions.md)
- [`TileLayerOptions`](Interface.TileLayerOptions.md)
- [`WorldView3DOptions`](Interface.WorldView3DOptions.md)

## Properties

### collisionLayer?

```ts
optional collisionLayer?: number;
```

Defined in: scene/entity2d.ts:31

Layer this entity lives on (for collision filtering).

***

### collisionMask?

```ts
optional collisionMask?: number;
```

Defined in: scene/entity2d.ts:33

Mask of layers this entity collides with.

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: scene/entity.ts:24

Whether the entity (and its subtree) is updated each tick. Default `true`.

#### Inherited from

[`EntityOptions`](Interface.EntityOptions.md).[`enabled`](Interface.EntityOptions.md#enabled)

***

### position?

```ts
optional position?: Vector2;
```

Defined in: scene/entity2d.ts:23

World-space position. Default `(0, 0)`.

***

### rotation?

```ts
optional rotation?: number;
```

Defined in: scene/entity2d.ts:25

Rotation in radians. Default `0`.

***

### scale?

```ts
optional scale?: Vector2;
```

Defined in: scene/entity2d.ts:27

Per-axis scale. Default `(1, 1)`.

***

### size?

```ts
optional size?: Vector2;
```

Defined in: scene/entity2d.ts:29

AABB size used for collision. Default `(1, 1)`.

***

### visible?

```ts
optional visible?: boolean;
```

Defined in: scene/entity.ts:26

Whether the entity (and its subtree) is drawn. Default `true`.

#### Inherited from

[`EntityOptions`](Interface.EntityOptions.md).[`visible`](Interface.EntityOptions.md#visible)

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

[`EntityOptions`](Interface.EntityOptions.md).[`zIndex`](Interface.EntityOptions.md#zindex)
