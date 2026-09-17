[**rune**](README.md)

***

[rune](README.md) / ColliderKind

# Enumeration: ColliderKind

Defined in: physics/collider.ts:25

Shape approximation used by the 3D rigid-body solver.

## Enumeration Members

### Box

```ts
Box: "box";
```

Defined in: physics/collider.ts:29

Eight corner contacts; oriented box inertia tensor.

***

### Mesh

```ts
Mesh: "mesh";
```

Defined in: physics/collider.ts:31

Sampled surface vertices as contacts; box-inertia approximation.

***

### Sphere

```ts
Sphere: "sphere";
```

Defined in: physics/collider.ts:27

Single rolling contact; isotropic sphere inertia.
