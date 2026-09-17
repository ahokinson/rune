[**rune**](README.md)

***

[rune](README.md) / SurfaceShader

# Interface: SurfaceShader

Defined in: draw/raycast/grid.ts:65

Per-pixel colour seam. Each method is called twice per terminal cell — once
for the upper sub-pixel, once for the lower — and fills `out` (0–255). The
renderer adds no fog, lighting, or side-shading; implementations own all of
that via the map coordinates on the sample.

## Methods

### ceilingPixel()

```ts
ceilingPixel(sample, out): void;
```

Defined in: draw/raycast/grid.ts:68

#### Parameters

##### sample

[`FlatSample`](Interface.FlatSample.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`

***

### floorPixel()

```ts
floorPixel(sample, out): void;
```

Defined in: draw/raycast/grid.ts:67

#### Parameters

##### sample

[`FlatSample`](Interface.FlatSample.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`

***

### wallPixel()

```ts
wallPixel(sample, out): void;
```

Defined in: draw/raycast/grid.ts:66

#### Parameters

##### sample

[`WallSample`](Interface.WallSample.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`
