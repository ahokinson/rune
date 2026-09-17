[**rune**](README.md)

***

[rune](README.md) / useEntity

# Function: useEntity()

```ts
function useEntity<T>(factory): T;
```

Defined in: hooks.ts:82

Single-entity convenience over [useSceneEntities](Function.useSceneEntities.md): add one entity to the
nearest `<Scene>` on mount, remove it on cleanup, and return it.

## Type Parameters

### T

`T` *extends* [`Entity2D`](Class.Entity2D.md)

## Parameters

### factory

() => `T`

Builds the entity to manage; run once at setup.

## Returns

`T`

The created entity.
