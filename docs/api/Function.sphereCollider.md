[**rune**](README.md)

***

[rune](README.md) / sphereCollider

# Function: sphereCollider()

```ts
function sphereCollider(mesh): Collider;
```

Defined in: physics/collider.ts:71

A sphere sized to the mesh's bounding radius, with the isotropic inertia of a
solid sphere: I = (2/5)·m·r², so I⁻¹ = 2.5/r² on every axis.

## Parameters

### mesh

[`Mesh`](Interface.Mesh.md)

Source mesh.

## Returns

[`Collider`](Interface.Collider.md)

A sphere [Collider](Interface.Collider.md).
