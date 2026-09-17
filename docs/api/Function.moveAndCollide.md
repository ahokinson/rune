[**rune**](README.md)

***

[rune](README.md) / moveAndCollide

# Function: moveAndCollide()

```ts
function moveAndCollide(
   box, 
   deltaX, 
   deltaY, 
   obstacles
): CollisionResult;
```

Defined in: physics/moveAndCollide.ts:36

Move `box` by `(deltaX, deltaY)` against axis-aligned obstacles, resolving each
axis independently with the engine's swept-AABB test so the box stops flush
against terrain instead of tunnelling through it at speed. `box` is mutated to
the resolved position; the caller zeroes whatever velocity component collided.

## Parameters

### box

[`Rectangle`](Class.Rectangle.md)

The AABB to move; mutated to the resolved position.

### deltaX

`number`

X displacement for this step.

### deltaY

`number`

Y displacement for this step.

### obstacles

readonly [`Rectangle`](Class.Rectangle.md)[]

Axis-aligned terrain rectangles to collide against.

## Returns

[`CollisionResult`](Interface.CollisionResult.md)

The [CollisionResult](Interface.CollisionResult.md) describing this step's collisions.
