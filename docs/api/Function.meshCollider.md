[**rune**](README.md)

***

[rune](README.md) / meshCollider

# Function: meshCollider()

```ts
function meshCollider(mesh, maxPoints?): Collider;
```

Defined in: physics/collider.ts:101

The mesh's own vertices (sampled to at most `maxPoints` for performance) as
contact points, so the body rests on its real silhouette. Inertia is the box
approximation from the bounding extents.

## Parameters

### mesh

[`Mesh`](Interface.Mesh.md)

Source mesh.

### maxPoints?

`number` = `96`

Cap on the number of sampled vertices (default 96).

## Returns

[`Collider`](Interface.Collider.md)

A mesh [Collider](Interface.Collider.md).
