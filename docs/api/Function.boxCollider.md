[**rune**](README.md)

***

[rune](README.md) / boxCollider

# Function: boxCollider()

```ts
function boxCollider(mesh): Collider;
```

Defined in: physics/collider.ts:85

An oriented box sized to the mesh's bounding half-extents: contacts at the
eight corners, box inertia tensor.

## Parameters

### mesh

[`Mesh`](Interface.Mesh.md)

Source mesh.

## Returns

[`Collider`](Interface.Collider.md)

A box [Collider](Interface.Collider.md).
