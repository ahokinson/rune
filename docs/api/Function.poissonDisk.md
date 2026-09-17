[**rune**](README.md)

***

[rune](README.md) / poissonDisk

# Function: poissonDisk()

```ts
function poissonDisk(options): Vector2[];
```

Defined in: math/poisson.ts:36

Poisson-disk sampling via Bridson's algorithm: scatter points across a
rectangle so no two are closer than `radius`, but the spacing stays organic
(not a grid). The go-to distribution for tree/rock/enemy/star placement — it
reads as natural clumping-free randomness. O(n) with a background grid; the
grid cell size radius/√2 guarantees at most one sample per cell, so a new
candidate only checks its 5×5 cell neighbourhood. Deterministic for a seed.

## Parameters

### options

[`PoissonOptions`](Interface.PoissonOptions.md)

Sample dimensions, radius, attempts, and seed.

## Returns

[`Vector2`](Class.Vector2.md)[]

The sampled points (empty if `width`, `height`, or `radius` is ≤ 0).
