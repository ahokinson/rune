[**rune**](README.md)

***

[rune](README.md) / SurfacePoint

# Interface: SurfacePoint

Defined in: geom/sphereProjection.ts:31

A point on the sphere's surface: its spherical angles (radians, see sphere.ts
for the theta/phi convention) plus the camera-space surface normal (also the
unit screen-space direction, so it drives screen-fixed lighting directly).

## Extended by

- [`SurfaceSample`](Interface.SurfaceSample.md)

## Properties

### normal

```ts
normal: Vector3;
```

Defined in: geom/sphereProjection.ts:34

***

### phi

```ts
phi: number;
```

Defined in: geom/sphereProjection.ts:33

***

### theta

```ts
theta: number;
```

Defined in: geom/sphereProjection.ts:32
