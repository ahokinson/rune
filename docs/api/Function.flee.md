[**rune**](README.md)

***

[rune](README.md) / flee

# Function: flee()

```ts
function flee(
   position, 
   velocity, 
   target, 
   maxSpeed
): Vector2;
```

Defined in: ai/steering.ts:48

Steer directly away from `target`.

## Parameters

### position

[`Vector2`](Class.Vector2.md)

Agent position.

### velocity

[`Vector2`](Class.Vector2.md)

Agent velocity.

### target

[`Vector2`](Class.Vector2.md)

Point to flee from.

### maxSpeed

`number`

Maximum speed the agent may travel.

## Returns

[`Vector2`](Class.Vector2.md)

A steering force (the negation of [seek](Function.seek.md)).
