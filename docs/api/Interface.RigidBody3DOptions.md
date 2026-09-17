[**rune**](README.md)

***

[rune](README.md) / RigidBody3DOptions

# Interface: RigidBody3DOptions

Defined in: physics/rigidBody.ts:23

Construction options for a [RigidBody3D](Class.RigidBody3D.md).

## Properties

### angularDamping?

```ts
optional angularDamping?: number;
```

Defined in: physics/rigidBody.ts:65

Per-second angular velocity decay. See [RigidBody3DOptions.linearDamping](#lineardamping).

***

### correction?

```ts
optional correction?: number;
```

Defined in: physics/rigidBody.ts:56

Baumgarte correction fraction per step. See [RigidBody3DOptions.penetrationSlop](#penetrationslop).

***

### floorY?

```ts
optional floorY?: number;
```

Defined in: physics/rigidBody.ts:37

The floor plane; its outward normal is (0,-1,0).

***

### friction?

```ts
optional friction?: number;
```

Defined in: physics/rigidBody.ts:35

Coulomb friction coefficient at floor contacts. Converts sliding into rolling
(it drives the contact-point velocity to zero) and arrests it once settled.

***

### gravity?

```ts
optional gravity?: number;
```

Defined in: physics/rigidBody.ts:25

Downward (+Y) acceleration, world units per second².

***

### linearDamping?

```ts
optional linearDamping?: number;
```

Defined in: physics/rigidBody.ts:63

Gentle per-second velocity decay standing in for air drag and rolling
resistance. Mostly this lets a sphere's vertical-axis spin — which the floor
contact sits on the axis of and so cannot brake — bleed off so the body sleeps
instead of topping forever.

***

### penetrationSlop?

```ts
optional penetrationSlop?: number;
```

Defined in: physics/rigidBody.ts:54

Positional correction: push a fraction of the remaining penetration out each
step (Baumgarte) past a small slop, so the body neither sinks nor pops.

***

### restitution?

```ts
optional restitution?: number;
```

Defined in: physics/rigidBody.ts:30

Bounciness of the floor: fraction of normal speed returned per impact. Low, so
the body loses energy and beds down within a couple of bounces.

***

### sleepAngular?

```ts
optional sleepAngular?: number;
```

Defined in: physics/rigidBody.ts:72

Angular sleep threshold. See [RigidBody3DOptions.sleepLinear](#sleeplinear).

***

### sleepLinear?

```ts
optional sleepLinear?: number;
```

Defined in: physics/rigidBody.ts:70

Sleep: once linear and angular speed stay under these for `sleepTime`, freeze
the body so it rests dead still instead of shivering on the floor.

***

### sleepTime?

```ts
optional sleepTime?: number;
```

Defined in: physics/rigidBody.ts:74

Seconds of stillness required before the body sleeps.

***

### solverIterations?

```ts
optional solverIterations?: number;
```

Defined in: physics/rigidBody.ts:49

Contact solver: a few sequential-impulse passes per step damp the jitter of
multiple simultaneous contacts.

***

### wallX?

```ts
optional wallX?: number;
```

Defined in: physics/rigidBody.ts:42

Invisible side/depth walls that keep a moving body in frame. X is wider than Z
so it never drifts toward the camera's near plane.

***

### wallZ?

```ts
optional wallZ?: number;
```

Defined in: physics/rigidBody.ts:44

See [RigidBody3DOptions.wallX](#wallx).
