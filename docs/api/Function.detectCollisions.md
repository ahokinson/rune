[**rune**](README.md)

***

[rune](README.md) / detectCollisions

# Function: detectCollisions()

```ts
function detectCollisions(scene): void;
```

Defined in: scene/collision.ts:23

Dispatch `onCollide()` to overlapping entities, the solid-overlap counterpart to
`updateTriggers()`. An entity is an "actor" when it defines both a
`collisionMask` and an `onCollide` handler; it receives a callback for every
other root entity whose `collisionLayer` matches that mask and whose AABB it
overlaps this step.

Run it once per fixed update, after movement has resolved.

## Parameters

### scene

[`SceneInstance`](Class.SceneInstance.md)

The scene whose entities to test.

## Returns

`void`
