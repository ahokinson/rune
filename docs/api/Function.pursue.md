[**rune**](README.md)

***

[rune](README.md) / pursue

# Function: pursue()

```ts
function pursue(
   position, 
   velocity, 
   targetPosition, 
   targetVelocity, 
   maxSpeed
): Vector2;
```

Defined in: ai/steering.ts:89

Seek where the target will be, extrapolating from its velocity — the chase that
leads a moving quarry.

## Parameters

### position

[`Vector2`](Class.Vector2.md)

Agent position.

### velocity

[`Vector2`](Class.Vector2.md)

Agent velocity.

### targetPosition

[`Vector2`](Class.Vector2.md)

Moving target's current position.

### targetVelocity

[`Vector2`](Class.Vector2.md)

Moving target's velocity.

### maxSpeed

`number`

Maximum speed the agent may travel.

## Returns

[`Vector2`](Class.Vector2.md)

A steering force aimed at the predicted intercept point.
