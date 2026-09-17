[**rune**](README.md)

***

[rune](README.md) / PointMass

# Class: PointMass

Defined in: physics/constraint.ts:19

A Verlet point mass. Position and previous position are both tracked so the
implied velocity is `position − previous`; integration advances both.

## Constructors

### Constructor

```ts
new PointMass(
   x?, 
   y?, 
   z?, 
   mass?
): PointMass;
```

Defined in: physics/constraint.ts:33

#### Parameters

##### x?

`number` = `0`

Initial X (default 0).

##### y?

`number` = `0`

Initial Y (default 0).

##### z?

`number` = `0`

Initial Z (default 0).

##### mass?

`number` = `1`

Mass; `<= 0` pins the particle (default 1).

#### Returns

`PointMass`

## Properties

### inverseMass

```ts
inverseMass: number;
```

Defined in: physics/constraint.ts:25

Reciprocal of mass; `0` means the particle is pinned (infinite mass).

***

### position

```ts
readonly position: Vector3;
```

Defined in: physics/constraint.ts:21

Current position.

***

### previous

```ts
readonly previous: Vector3;
```

Defined in: physics/constraint.ts:23

Previous position; the implicit velocity is `position − previous` (Verlet).

## Accessors

### pinned

#### Get Signature

```ts
get pinned(): boolean;
```

Defined in: physics/constraint.ts:40

`true` when the particle is pinned (infinite mass) and never moves.

##### Returns

`boolean`

## Methods

### integrate()

```ts
integrate(
   deltaSeconds, 
   acceleration, 
   damping
): void;
```

Defined in: physics/constraint.ts:62

Verlet integration: advance by the implied velocity plus acceleration·dt²,
with `damping` bleeding off velocity (0 = none). Pinned particles ignore it.

#### Parameters

##### deltaSeconds

`number`

Time step.

##### acceleration

[`Vector3`](Class.Vector3.md)

Per-axis acceleration (e.g. gravity).

##### damping

`number`

Fraction of implied velocity shed this step (0 = none).

#### Returns

`void`

***

### setPinned()

```ts
setPinned(pinned, mass?): void;
```

Defined in: physics/constraint.ts:50

Pin (mass 0) or release (finite mass) the particle in place.

#### Parameters

##### pinned

`boolean`

`true` to pin, `false` to release.

##### mass?

`number` = `1`

Mass to restore when releasing (default 1); `<= 0` keeps it pinned.

#### Returns

`void`
