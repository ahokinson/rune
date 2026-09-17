[**rune**](README.md)

***

[rune](README.md) / EntityOptions

# Interface: EntityOptions

Defined in: scene/entity.ts:16

Construction options shared by every entity in the engine.

## Extended by

- [`Entity2DOptions`](Interface.Entity2DOptions.md)
- [`Entity3DOptions`](Interface.Entity3DOptions.md)

## Properties

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: scene/entity.ts:24

Whether the entity (and its subtree) is updated each tick. Default `true`.

***

### visible?

```ts
optional visible?: boolean;
```

Defined in: scene/entity.ts:26

Whether the entity (and its subtree) is drawn. Default `true`.

***

### zIndex?

```ts
optional zIndex?: number;
```

Defined in: scene/entity.ts:22

Draw/update order among siblings (low first). Mutating this after attaching
requires [Entity.markSortDirty](Class.Entity.md#marksortdirty) on the parent (or scene) so the next
pass re-sorts. Default `0`.
