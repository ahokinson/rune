[**rune**](README.md)

***

[rune](README.md) / PinConstraint

# Class: PinConstraint

Defined in: physics/constraint.ts:129

Pin a particle to a fixed anchor point each pass (a moving attachment point —
for a static pin, set the particle's inverseMass to 0 instead).

## Implements

- [`Constraint`](Interface.Constraint.md)

## Constructors

### Constructor

```ts
new PinConstraint(particle, anchor): PinConstraint;
```

Defined in: physics/constraint.ts:137

#### Parameters

##### particle

[`PointMass`](Class.PointMass.md)

Particle to pin.

##### anchor

[`Vector3`](Class.Vector3.md)

Anchor position (cloned; mutate `anchor` to drag the particle).

#### Returns

`PinConstraint`

## Properties

### anchor

```ts
readonly anchor: Vector3;
```

Defined in: physics/constraint.ts:131

The world-space point the particle is welded to.

***

### particle

```ts
readonly particle: PointMass;
```

Defined in: physics/constraint.ts:138

Particle to pin.

## Methods

### solve()

```ts
solve(): void;
```

Defined in: physics/constraint.ts:145

Snap the particle to the anchor.

#### Returns

`void`

#### Implementation of

[`Constraint`](Interface.Constraint.md).[`solve`](Interface.Constraint.md#solve)
