[**rune**](README.md)

***

[rune](README.md) / SurfaceSample

# Interface: SurfaceSample

Defined in: geom/sphereProjector.ts:20

One sampled point on an implicit sphere surface: its spherical angles, the
camera-space normal (also the unit screen-space lighting direction), and the
camera-facing depth (LARGER = NEARER, i.e. the normal's z). Extends the shape
SphereProjection writes so it can be filled in place with no extra scratch.

## Extends

- [`SurfacePoint`](Interface.SurfacePoint.md)

## Properties

### depth

```ts
depth: number;
```

Defined in: geom/sphereProjector.ts:21

***

### normal

```ts
normal: Vector3;
```

Defined in: geom/sphereProjection.ts:34

#### Inherited from

[`SurfacePoint`](Interface.SurfacePoint.md).[`normal`](Interface.SurfacePoint.md#normal)

***

### phi

```ts
phi: number;
```

Defined in: geom/sphereProjection.ts:33

#### Inherited from

[`SurfacePoint`](Interface.SurfacePoint.md).[`phi`](Interface.SurfacePoint.md#phi)

***

### theta

```ts
theta: number;
```

Defined in: geom/sphereProjection.ts:32

#### Inherited from

[`SurfacePoint`](Interface.SurfacePoint.md).[`theta`](Interface.SurfacePoint.md#theta)
