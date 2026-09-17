[**rune**](README.md)

***

[rune](README.md) / SphereProjection

# Class: SphereProjection

Defined in: geom/sphereProjection.ts:74

Maps between screen space and a tilted, spinning unit sphere. Owns both
directions of the transform so the forward (surface → screen) and inverse
(screen → surface) projections stay in lock-step.

## Example

```ts
const sphere = new SphereProjection({ tiltPitch: 0.3, aspectY: 0.5 })
const p = sphere.directionToScreen(dir, 1, view)
```

## Constructors

### Constructor

```ts
new SphereProjection(options?): SphereProjection;
```

Defined in: geom/sphereProjection.ts:88

#### Parameters

##### options?

[`SphereProjectionOptions`](Interface.SphereProjectionOptions.md) = `{}`

Tilt angles and aspect squash.

#### Returns

`SphereProjection`

## Properties

### aspectY

```ts
aspectY: number;
```

Defined in: geom/sphereProjection.ts:78

Vertical squash for non-square terminal cells.

## Accessors

### tiltPitch

#### Get Signature

```ts
get tiltPitch(): number;
```

Defined in: geom/sphereProjection.ts:96

Axial tilt pitch in radians.

##### Returns

`number`

#### Set Signature

```ts
set tiltPitch(value): void;
```

Defined in: geom/sphereProjection.ts:101

Set the axial tilt pitch (recomputes cached trig).

##### Parameters

###### value

`number`

##### Returns

`void`

***

### tiltRoll

#### Get Signature

```ts
get tiltRoll(): number;
```

Defined in: geom/sphereProjection.ts:107

Axial tilt roll in radians.

##### Returns

`number`

#### Set Signature

```ts
set tiltRoll(value): void;
```

Defined in: geom/sphereProjection.ts:112

Set the axial tilt roll (recomputes cached trig).

##### Parameters

###### value

`number`

##### Returns

`void`

## Methods

### directionToScreen()

```ts
directionToScreen(
   dir, 
   altitude, 
   view
): ScreenPoint | null;
```

Defined in: geom/sphereProjection.ts:180

Forward projection of a unit surface direction. `altitude` (>= 1) pushes the
point radially outward so arcs can bow off the surface; culling and the
returned depth use the true surface direction, so the far side of a bow hides
behind the sphere and shades correctly. Returns null when culled.

#### Parameters

##### dir

[`Vector3`](Class.Vector3.md)

Unit surface direction.

##### altitude

`number`

Radial lift (>= 1); pass 1 for surface points.

##### view

[`SphereView`](Interface.SphereView.md)

Sphere placement for this frame.

#### Returns

[`ScreenPoint`](Interface.ScreenPoint.md) \| `null`

Screen point with depth, or `null` if culled.

***

### directionToScreenInto()

```ts
directionToScreenInto(
   out, 
   dir, 
   altitude, 
   view
): ScreenPoint | null;
```

Defined in: geom/sphereProjection.ts:194

Allocation-free forward projection: writes into `out` and returns it, or
`null` when culled.

#### Parameters

##### out

[`ScreenPoint`](Interface.ScreenPoint.md)

Target screen point.

##### dir

[`Vector3`](Class.Vector3.md)

Unit surface direction.

##### altitude

`number`

Radial lift (>= 1); pass 1 for surface points.

##### view

[`SphereView`](Interface.SphereView.md)

Sphere placement for this frame.

#### Returns

[`ScreenPoint`](Interface.ScreenPoint.md) \| `null`

`out`, or `null` if culled.

***

### screenToSurface()

```ts
screenToSurface(
   screenX, 
   screenY, 
   view
): SurfacePoint | null;
```

Defined in: geom/sphereProjection.ts:133

Inverse projection: which surface point sits under a screen cell? Returns
null for cells outside the disc.

#### Parameters

##### screenX

`number`

Screen column.

##### screenY

`number`

Screen row.

##### view

[`SphereView`](Interface.SphereView.md)

Sphere placement for this frame.

#### Returns

[`SurfacePoint`](Interface.SurfacePoint.md) \| `null`

Surface point with angles and normal, or `null` off the disc.

***

### screenToSurfaceInto()

```ts
screenToSurfaceInto(
   out, 
   screenX, 
   screenY, 
   view
): SurfacePoint | null;
```

Defined in: geom/sphereProjection.ts:147

Allocation-free variant for per-cell sampling: writes into `out` (and its
`out.normal`) and returns it, or null when the cell is off the disc.

#### Parameters

##### out

[`SurfacePoint`](Interface.SurfacePoint.md)

Target surface point (its `normal` is also filled).

##### screenX

`number`

Screen column.

##### screenY

`number`

Screen row.

##### view

[`SphereView`](Interface.SphereView.md)

Sphere placement for this frame.

#### Returns

[`SurfacePoint`](Interface.SurfacePoint.md) \| `null`

`out`, or `null` off the disc.

***

### worldToScreen()

```ts
worldToScreen(
   theta, 
   phi, 
   altitude, 
   view
): ScreenPoint | null;
```

Defined in: geom/sphereProjection.ts:224

Convenience: project a spherical elevation/azimuth (radians) at a given altitude.

#### Parameters

##### theta

`number`

Elevation from the equatorial plane.

##### phi

`number`

Azimuth about the y axis.

##### altitude

`number`

Radial lift (>= 1); pass 1 for surface points.

##### view

[`SphereView`](Interface.SphereView.md)

Sphere placement for this frame.

#### Returns

[`ScreenPoint`](Interface.ScreenPoint.md) \| `null`

Screen point with depth, or `null` if culled.
