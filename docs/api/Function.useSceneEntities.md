[**rune**](README.md)

***

[rune](README.md) / useSceneEntities

# Function: useSceneEntities()

```ts
function useSceneEntities(factory): Entity2D[];
```

Defined in: hooks.ts:65

Add entities to the nearest `<Scene>` on mount and remove them on cleanup, so
a component owns its scene contents without hand-rolling `onMount`/`onCleanup`
around `scene.add`/`scene.remove`. The `factory` runs immediately (during
component setup) so callers may capture the returned entities; the actual
`addAll` is deferred to mount.

## Parameters

### factory

() => `Iterable`\<[`Entity2D`](Class.Entity2D.md)\>

Builds the entities to manage; run once at setup.

## Returns

[`Entity2D`](Class.Entity2D.md)[]

The created entities, in iteration order.
