[**rune**](README.md)

***

[rune](README.md) / alignment

# Function: alignment()

```ts
function alignment(
   self, 
   neighbours, 
   radius
): Vector2;
```

Defined in: ai/steering.ts:178

Steer toward the average heading of neighbours within `radius` — aligns a flock.

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

A steering force matching neighbour headings.
