[**rune**](README.md)

***

[rune](README.md) / RigidBody3D

# Class: RigidBody3D

Defined in: physics/rigidBody.ts:78

An impulse-based 3D rigid body resolved against a floor plane.

## Constructors

### Constructor

```ts
new RigidBody3D(options?): RigidBody3D;
```

Defined in: physics/rigidBody.ts:123

#### Parameters

##### options?

[`RigidBody3DOptions`](Interface.RigidBody3DOptions.md) = `{}`

Simulation tuning; all fields optional (see [RigidBody3DOptions](Interface.RigidBody3DOptions.md)).

#### Returns

`RigidBody3D`

## Properties

### angularVelocity

```ts
readonly angularVelocity: Vector3;
```

Defined in: physics/rigidBody.ts:86

Angular velocity (radians / second, world axes).

***

### orientation

```ts
readonly orientation: Quaternion;
```

Defined in: physics/rigidBody.ts:82

Body orientation.

***

### position

```ts
readonly position: Vector3;
```

Defined in: physics/rigidBody.ts:80

World-space centre-of-mass position.

***

### resting

```ts
resting: boolean = false;
```

Defined in: physics/rigidBody.ts:88

`true` once the body has gone to sleep; call [wake](#wake) to revive it.

***

### velocity

```ts
readonly velocity: Vector3;
```

Defined in: physics/rigidBody.ts:84

Linear velocity (world units / second).

## Methods

### setCollider()

```ts
setCollider(collider): void;
```

Defined in: physics/rigidBody.ts:145

Adopt `collider`'s shape, contact points, and inverse inertia for this body.

#### Parameters

##### collider

[`Collider`](Interface.Collider.md)

Collider built by [colliderFor](Function.colliderFor.md).

#### Returns

`void`

***

### step()

```ts
step(deltaSeconds): void;
```

Defined in: physics/rigidBody.ts:166

Advance the simulation by one step: integrate gravity and damping, gather
floor contacts, run the sequential-impulse solver, apply Baumgarte
positional correction, then contain the walls and update sleep.

#### Parameters

##### deltaSeconds

`number`

Step duration.

#### Returns

`void`

***

### wake()

```ts
wake(): void;
```

Defined in: physics/rigidBody.ts:154

Reset the sleep timer and mark the body awake.

#### Returns

`void`
