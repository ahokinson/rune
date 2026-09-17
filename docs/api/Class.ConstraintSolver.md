[**rune**](README.md)

***

[rune](README.md) / ConstraintSolver

# Class: ConstraintSolver

Defined in: physics/constraint.ts:165

Steps a network of [PointMass](Class.PointMass.md) instances and [Constraint](Interface.Constraint.md)s:
integrates every particle, then satisfies the constraints over several
relaxation passes per step.

## Constructors

### Constructor

```ts
new ConstraintSolver(options?): ConstraintSolver;
```

Defined in: physics/constraint.ts:178

#### Parameters

##### options?

[`ConstraintSolverOptions`](Interface.ConstraintSolverOptions.md) = `{}`

Construction options (all fields optional).

#### Returns

`ConstraintSolver`

## Properties

### constraints

```ts
readonly constraints: Constraint[] = [];
```

Defined in: physics/constraint.ts:169

Constraints owned by this solver.

***

### gravity

```ts
readonly gravity: Vector3;
```

Defined in: physics/constraint.ts:171

Acceleration applied to every particle each step.

***

### particles

```ts
readonly particles: PointMass[] = [];
```

Defined in: physics/constraint.ts:167

Particles owned by this solver.

## Methods

### add()

```ts
add<T>(particle): T;
```

Defined in: physics/constraint.ts:191

Register a particle with the solver.

#### Type Parameters

##### T

`T` *extends* [`PointMass`](Class.PointMass.md)

Particle subtype.

#### Parameters

##### particle

`T`

Particle to add.

#### Returns

`T`

`particle`, for chaining.

***

### addConstraint()

```ts
addConstraint<T>(constraint): T;
```

Defined in: physics/constraint.ts:203

Register a constraint with the solver.

#### Type Parameters

##### T

`T` *extends* [`Constraint`](Interface.Constraint.md)

Constraint subtype.

#### Parameters

##### constraint

`T`

Constraint to add.

#### Returns

`T`

`constraint`, for chaining.

***

### step()

```ts
step(deltaSeconds): void;
```

Defined in: physics/constraint.ts:213

Integrate every particle, then satisfy the constraints over several passes.

#### Parameters

##### deltaSeconds

`number`

Time step.

#### Returns

`void`
