[**rune**](README.md)

***

[rune](README.md) / cohesion

# Function: cohesion()

```ts
function cohesion(
   self, 
   neighbours, 
   radius
): Vector2;
```

Defined in: ai/steering.ts:202

Steer toward the average position of neighbours within `radius` — pulls a flock
together.

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

A steering force toward the neighbour centroid.
