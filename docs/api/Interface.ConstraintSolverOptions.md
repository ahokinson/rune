[**rune**](README.md)

***

[rune](README.md) / ConstraintSolverOptions

# Interface: ConstraintSolverOptions

Defined in: physics/constraint.ts:151

Options for constructing a [ConstraintSolver](Class.ConstraintSolver.md).

## Properties

### damping?

```ts
optional damping?: number;
```

Defined in: physics/constraint.ts:157

Velocity bleed per step (0 = none), standing in for air drag.

***

### gravity?

```ts
optional gravity?: Vector3;
```

Defined in: physics/constraint.ts:153

Acceleration applied to every particle each step (e.g. gravity).

***

### iterations?

```ts
optional iterations?: number;
```

Defined in: physics/constraint.ts:155

Relaxation passes per step; more passes make rigid constraints stiffer.
