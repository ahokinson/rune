[**rune**](README.md)

***

[rune](README.md) / colliderFor

# Function: colliderFor()

```ts
function colliderFor(mesh, kind): Collider;
```

Defined in: physics/collider.ts:58

Build the collider of the requested shape for `mesh`.

## Parameters

### mesh

[`Mesh`](Interface.Mesh.md)

Source mesh whose bounds and vertices drive the collider.

### kind

[`ColliderKind`](Enumeration.ColliderKind.md)

Desired collider shape.

## Returns

[`Collider`](Interface.Collider.md)

A new [Collider](Interface.Collider.md).
