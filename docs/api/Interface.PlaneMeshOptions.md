[**rune**](README.md)

***

[rune](README.md) / PlaneMeshOptions

# Interface: PlaneMeshOptions

Defined in: geom/solids.ts:210

Options for [planeMesh](Function.planeMesh.md).

## Properties

### half?

```ts
optional half?: number;
```

Defined in: geom/solids.ts:212

Half-extent: the plane spans `[-half, half]` in x and z.

***

### tiles?

```ts
optional tiles?: number;
```

Defined in: geom/solids.ts:216

How many times the uvs tile across the quad, for a repeating texture.

***

### y?

```ts
optional y?: number;
```

Defined in: geom/solids.ts:214

Height (world y) the flat quad sits at.
