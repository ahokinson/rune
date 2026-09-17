[**rune**](README.md)

***

[rune](README.md) / separation

# Function: separation()

```ts
function separation(
   self, 
   neighbours, 
   radius
): Vector2;
```

Defined in: ai/steering.ts:154

Steer away from the average position of neighbours within `radius` — keeps a
flock from clumping. Weighted by inverse distance so nearer crowders push harder.

## Parameters

### self

[`Boid`](Interface.Boid.md)

The agent doing the steering.

### neighbours

readonly [`Boid`](Interface.Boid.md)[]

Other agents to consider.

### radius

`number`

Neighbour inclusion distance.

## Returns

[`Vector2`](Class.Vector2.md)

A steering force pushing `self` away from clustered neighbours.
