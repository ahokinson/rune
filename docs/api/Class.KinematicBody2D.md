[**rune**](README.md)

***

[rune](README.md) / KinematicBody2D

# Class: KinematicBody2D

Defined in: physics/kinematicBody2d.ts:53

A kinematic platformer body. See the module docstring for the movement model.

## Constructors

### Constructor

```ts
new KinematicBody2D(options): KinematicBody2D;
```

Defined in: physics/kinematicBody2d.ts:73

#### Parameters

##### options

[`KinematicBody2DOptions`](Interface.KinematicBody2DOptions.md)

Movement tuning. See [KinematicBody2DOptions](Interface.KinematicBody2DOptions.md).

#### Returns

`KinematicBody2D`

## Properties

### grounded

```ts
grounded: boolean = false;
```

Defined in: physics/kinematicBody2d.ts:57

`true` while the body rests on a floor this step.

***

### velocity

```ts
readonly velocity: Vector2;
```

Defined in: physics/kinematicBody2d.ts:55

Current velocity (cells / second); the body mutates this as it collides.

## Methods

### step()

```ts
step(
   box, 
   input, 
   deltaMilliseconds, 
   obstacles
): CollisionResult;
```

Defined in: physics/kinematicBody2d.ts:96

Advance one fixed step: mutates `box` to the resolved position and returns the
collision result so the caller can react to ceilings/grounding. Velocity
components that collided are zeroed here; the caller may still overwrite
`velocity` afterwards (e.g. a stomp bounce).

#### Parameters

##### box

[`Rectangle`](Class.Rectangle.md)

The body's AABB; updated to the resolved position.

##### input

[`KinematicInput`](Interface.KinematicInput.md)

Steering + jump intent for this step.

##### deltaMilliseconds

`number`

Step duration in milliseconds.

##### obstacles

readonly [`Rectangle`](Class.Rectangle.md)[]

Axis-aligned terrain rectangles to collide against.

#### Returns

[`CollisionResult`](Interface.CollisionResult.md)

The [CollisionResult](Interface.CollisionResult.md) from this step.
