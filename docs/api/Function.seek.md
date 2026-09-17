[**rune**](README.md)

***

[rune](README.md) / seek

# Function: seek()

```ts
function seek(
   position, 
   velocity, 
   target, 
   maxSpeed
): Vector2;
```

Defined in: ai/steering.ts:31

Steer toward `target` at full speed.

## Parameters

### position

[`Vector2`](Class.Vector2.md)

Agent position.

### velocity

[`Vector2`](Class.Vector2.md)

Agent velocity.

### target

[`Vector2`](Class.Vector2.md)

Point to seek.

### maxSpeed

`number`

Maximum speed the agent may travel.

## Returns

[`Vector2`](Class.Vector2.md)

A steering force to add to `velocity`.
