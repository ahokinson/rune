[**rune**](README.md)

***

[rune](README.md) / SphereProjectionOptions

# Interface: SphereProjectionOptions

Defined in: geom/sphereProjection.ts:48

Options for constructing a [SphereProjection](Class.SphereProjection.md).

## Properties

### aspectY?

```ts
optional aspectY?: number;
```

Defined in: geom/sphereProjection.ts:57

Vertical squash for non-square cells (e.g. 0.5 for 2:1 terminal cells).

***

### tiltPitch?

```ts
optional tiltPitch?: number;
```

Defined in: geom/sphereProjection.ts:53

Axial tilt applied as Rz(roll)·Rx(pitch) on the sphere so it reads as tilted
while still spinning about its own axis; screen-space lighting is unaffected.

***

### tiltRoll?

```ts
optional tiltRoll?: number;
```

Defined in: geom/sphereProjection.ts:55

Roll component of the axial tilt (radians).
