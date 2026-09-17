[**rune**](README.md)

***

[rune](README.md) / Collider

# Interface: Collider

Defined in: physics/collider.ts:40

Precomputed collision geometry for a body. `points` are local contact offsets
(box corners or sampled mesh vertices); a sphere carries none and contacts the
floor at its single lowest point, `radius` below the centre. `inverseInertia`
is the diagonal of I⁻¹ in the body frame (unit mass).

## Properties

### inverseInertia

```ts
readonly inverseInertia: Vector3;
```

Defined in: physics/collider.ts:48

Diagonal of the body-frame inverse inertia tensor, for unit mass.

***

### kind

```ts
readonly kind: ColliderKind;
```

Defined in: physics/collider.ts:42

Collider shape.

***

### points

```ts
readonly points: readonly Vector3[];
```

Defined in: physics/collider.ts:46

Local-space contact points (empty for a sphere).

***

### radius

```ts
readonly radius: number;
```

Defined in: physics/collider.ts:44

Sphere radius (zero for non-sphere colliders).
