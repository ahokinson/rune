[**rune**](README.md)

***

[rune](README.md) / MeshShader

# Interface: MeshShader

Defined in: draw/mesh/rasterizer.ts:54

Per-fragment colour seam, mirroring [SurfaceShader](Interface.SurfaceShader.md). Fills `out` (RGB,
0–255) for the given fragment. The renderer adds no lighting or fog of its own.

## Methods

### shade()

```ts
shade(fragment, out): void;
```

Defined in: draw/mesh/rasterizer.ts:55

#### Parameters

##### fragment

[`Fragment`](Interface.Fragment.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`
