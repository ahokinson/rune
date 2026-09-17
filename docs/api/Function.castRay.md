[**rune**](README.md)

***

[rune](README.md) / castRay

# Function: castRay()

```ts
function castRay(
   origin, 
   direction, 
   isBlocking, 
   maxDistance, 
   out?
): RaycastHit | null;
```

Defined in: physics/raycast.ts:41

Cast a ray through a uniform cell grid using DDA, returning the first cell
`isBlocking` accepts. An optional `out` [RaycastHit](Interface.RaycastHit.md) is filled in place
to avoid per-cast allocation.

## Parameters

### origin

[`Vector2`](Class.Vector2.md)

Ray origin in world space.

### direction

[`Vector2`](Class.Vector2.md)

Ray direction (need not be normalized; need not be zero).

### isBlocking

[`CellPredicate`](TypeAlias.CellPredicate.md)

Returns `true` if the given cell blocks the ray.

### maxDistance

`number`

Maximum perpendicular distance to trace.

### out?

[`RaycastHit`](Interface.RaycastHit.md)

Optional receiver for the hit, to avoid allocating.

## Returns

[`RaycastHit`](Interface.RaycastHit.md) \| `null`

The hit (either `out` or a new [RaycastHit](Interface.RaycastHit.md)), or `null` if no
  blocking cell is reached within `maxDistance`.
