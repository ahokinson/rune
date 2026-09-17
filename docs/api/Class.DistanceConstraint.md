[**rune**](README.md)

***

[rune](README.md) / DistanceConstraint

# Class: DistanceConstraint

Defined in: physics/constraint.ts:85

Hold two particles at `restLength`. `stiffness` in (0, 1] scales the correction
per pass: 1 is a rigid rod (taut after enough iterations), lower is springier.

## Implements

- [`Constraint`](Interface.Constraint.md)

## Constructors

### Constructor

```ts
new DistanceConstraint(
   a, 
   b, 
   restLength, 
   stiffness?
): DistanceConstraint;
```

Defined in: physics/constraint.ts:92

#### Parameters

##### a

[`PointMass`](Class.PointMass.md)

First endpoint.

##### b

[`PointMass`](Class.PointMass.md)

Second endpoint.

##### restLength

`number`

Target separation.

##### stiffness?

`number` = `1`

Correction fraction per pass (default 1).

#### Returns

`DistanceConstraint`

## Properties

### a

```ts
readonly a: PointMass;
```

Defined in: physics/constraint.ts:93

First endpoint.

***

### b

```ts
readonly b: PointMass;
```

Defined in: physics/constraint.ts:94

Second endpoint.

***

### restLength

```ts
restLength: number;
```

Defined in: physics/constraint.ts:95

Target separation.

***

### stiffness

```ts
stiffness: number = 1;
```

Defined in: physics/constraint.ts:96

Correction fraction per pass (default 1).

## Methods

### solve()

```ts
solve(): void;
```

Defined in: physics/constraint.ts:100

Nudge both endpoints toward the rest separation, split by inverse mass.

#### Returns

`void`

#### Implementation of

[`Constraint`](Interface.Constraint.md).[`solve`](Interface.Constraint.md#solve)
