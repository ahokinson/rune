[**rune**](README.md)

***

[rune](README.md) / Entity3DOptions

# Interface: Entity3DOptions

Defined in: scene/entity3d.ts:46

Options for constructing an [Entity3D](Class.Entity3D.md).

## Extends

- [`EntityOptions`](Interface.EntityOptions.md)

## Extended by

- [`MeshEntity3DOptions`](Interface.MeshEntity3DOptions.md)

## Properties

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
optional position?: Vector3;
```

Defined in: scene/entity3d.ts:48

World-space position. Default `(0, 0, 0)`.

***

### rotation?

```ts
optional rotation?: Quaternion;
```

Defined in: scene/entity3d.ts:50

Quaternion rotation. Default identity.

***

### scale?

```ts
optional scale?: Vector3;
```

Defined in: scene/entity3d.ts:52

Per-axis scale. Default `(1, 1, 1)`.

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
