[**rune**](README.md)

***

[rune](README.md) / Wander

# Class: Wander

Defined in: ai/steering.ts:106

Wander holds the slowly-drifting target angle that gives smooth, non-jittery
random roaming (a jittered point on a circle projected ahead of the agent).

## Constructors

### Constructor

```ts
new Wander(
   circleDistance?, 
   circleRadius?, 
   jitter?, 
   random?
): Wander;
```

Defined in: ai/steering.ts:116

#### Parameters

##### circleDistance?

`number` = `2`

Distance ahead of the agent the wander circle sits.

##### circleRadius?

`number` = `1`

Radius of the wander circle.

##### jitter?

`number` = `0.5`

Maximum per-step nudge applied to the wander angle.

##### random?

[`Random`](Class.Random.md)

Optional seeded RNG; a fresh one is created if omitted.

#### Returns

`Wander`

## Methods

### step()

```ts
step(velocity, maxSpeed): Vector2;
```

Defined in: ai/steering.ts:132

One step of wandering: nudges the internal angle and returns a steering force.

#### Parameters

##### velocity

[`Vector2`](Class.Vector2.md)

Agent velocity, used to derive the heading.

##### maxSpeed

`number`

Maximum speed the agent may travel.

#### Returns

[`Vector2`](Class.Vector2.md)

A steering force toward the wandering target.
