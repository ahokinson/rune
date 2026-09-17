[**rune**](README.md)

***

[rune](README.md) / PointCloud3DOptions

# Interface: PointCloud3DOptions

Defined in: geom/geometry3d.ts:33

Options for [PointCloud3D](Class.PointCloud3D.md).

## Properties

### minDepth?

```ts
optional minDepth?: number;
```

Defined in: geom/geometry3d.ts:40

Points nearer-facing than this depth are kept; the rest (grazing/far side)
are culled. Defaults to 0.1 to match the globe's city markers.

***

### zIndex?

```ts
optional zIndex?: number;
```

Defined in: geom/geometry3d.ts:35

Draw order (lower draws first so it writes depth before later entities test).
