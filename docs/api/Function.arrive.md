[**rune**](README.md)

***

[rune](README.md) / arrive

# Function: arrive()

```ts
function arrive(
   position, 
   velocity, 
   target, 
   maxSpeed, 
   slowRadius
): Vector2;
```

Defined in: ai/steering.ts:63

Seek `target`, but ramp the speed down inside `slowRadius` so the agent eases to
a stop on it instead of orbiting.

## Parameters

### position

[`Vector2`](Class.Vector2.md)

Agent position.

### velocity

[`Vector2`](Class.Vector2.md)

Agent velocity.

### target

[`Vector2`](Class.Vector2.md)

Point to arrive at.

### maxSpeed

`number`

Maximum speed the agent may travel.

### slowRadius

`number`

Distance from `target` at which braking begins.

## Returns

[`Vector2`](Class.Vector2.md)

A steering force to add to `velocity`.
