[**rune**](README.md)

***

[rune](README.md) / boxInverseInertia

# Function: boxInverseInertia()

```ts
function boxInverseInertia(half): Vector3;
```

Defined in: physics/collider.ts:148

Inverse diagonal inertia of a solid box with half-extents `half` and unit
mass: I = (1/3)·diag(hy²+hz², hx²+hz², hx²+hy²).

## Parameters

### half

[`Vector3`](Class.Vector3.md)

Box half-extents.

## Returns

[`Vector3`](Class.Vector3.md)

The diagonal of I⁻¹ as a [Vector3](Class.Vector3.md).
