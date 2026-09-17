[**rune**](README.md)

***

[rune](README.md) / RigidBody2D

# Class: RigidBody2D

Defined in: physics/rigidBody2d.ts:49

A translational 2D rigid body (AABB) with gravity, restitution, and friction.

## Constructors

### Constructor

```ts
new RigidBody2D(options?): RigidBody2D;
```

Defined in: physics/rigidBody2d.ts:66

#### Parameters

##### options?

[`RigidBody2DOptions`](Interface.RigidBody2DOptions.md) = `{}`

Construction options; all fields optional (see [RigidBody2DOptions](Interface.RigidBody2DOptions.md)).

#### Returns

`RigidBody2D`

## Properties

### box

```ts
readonly box: Rectangle;
```

Defined in: physics/rigidBody2d.ts:51

The collision box; `box.x`/`box.y` are the body's top-left position.

***

### grounded

```ts
grounded: boolean = false;
```

Defined in: physics/rigidBody2d.ts:55

`true` while the body rests on a floor this step.

***

### velocity

```ts
readonly velocity: Vector2;
```

Defined in: physics/rigidBody2d.ts:53

Current velocity (world units / second).

## Accessors

### position

#### Get Signature

```ts
get position(): Vector2;
```

Defined in: physics/rigidBody2d.ts:81

Convenience view of the box's top-left as a fresh `Vector2` (the box is the
source of truth; mutate `box.x`/`box.y` to teleport).

##### Returns

[`Vector2`](Class.Vector2.md)

A new [Vector2](Class.Vector2.md) with the body's top-left coordinates.

## Methods

### step()

```ts
step(deltaSeconds, obstacles): CollisionResult;
```

Defined in: physics/rigidBody2d.ts:95

Advance one step: integrate gravity and damping, then sweep the box by the
resulting displacement against `obstacles`, applying bounce/friction from the
collision result. Returns the CollisionResult so callers can react to a
ground/ceiling hit (e.g. a landing sound, a bonked block).

#### Parameters

##### deltaSeconds

`number`

Step duration.

##### obstacles

readonly [`Rectangle`](Class.Rectangle.md)[]

Axis-aligned terrain rectangles to collide against.

#### Returns

[`CollisionResult`](Interface.CollisionResult.md)

The [CollisionResult](Interface.CollisionResult.md) from this step.
