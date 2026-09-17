[**rune**](README.md)

***

[rune](README.md) / SphereProjector

# Class: SphereProjector

Defined in: geom/sphereProjector.ts:37

Adapts the proven SphereProjection (tilt/spin/aspect, lock-step forward and
inverse) to the generic Projector3D, so a Camera3D can drive the globe while
the actual pixels still come from the battle-tested sphere math. The spin
(`rotation`) is owned here and refreshed by the game each frame, like the old
per-call SphereView.rotation.

## Example

```ts
const proj = new SphereProjector(sphere, spin)
const cam = new Camera3D({ projector: proj })
```

## Implements

- [`Projector3D`](Interface.Projector3D.md)

## Constructors

### Constructor

```ts
new SphereProjector(sphere, rotation?): SphereProjector;
```

Defined in: geom/sphereProjector.ts:49

#### Parameters

##### sphere

[`SphereProjection`](Class.SphereProjection.md)

Sphere projection to adapt.

##### rotation?

`number` = `0`

Initial spin about the polar axis in radians (default 0).

#### Returns

`SphereProjector`

## Properties

### rotation

```ts
rotation: number;
```

Defined in: geom/sphereProjector.ts:41

Spin about the polar axis in radians, refreshed by the game each frame.

***

### sphere

```ts
readonly sphere: SphereProjection;
```

Defined in: geom/sphereProjector.ts:39

The wrapped sphere projection (owns tilt and aspect).

## Methods

### projectInto()

```ts
projectInto(
   out, 
   worldPoint, 
   altitude, 
   _camera, 
   viewport
): ProjectedPoint | null;
```

Defined in: geom/sphereProjector.ts:76

Forward-project a world point (treated as a unit surface direction) through
the wrapped sphere projection.

#### Parameters

##### out

[`ProjectedPoint`](Interface.ProjectedPoint.md)

Target projected point.

##### worldPoint

[`Vector3`](Class.Vector3.md)

Unit surface direction.

##### altitude

`number`

Radial lift (>= 1); pass 1 for surface points.

##### \_camera

[`Camera3D`](Class.Camera3D.md)

Unused (sphere placement comes from the viewport).

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

Screen placement.

#### Returns

[`ProjectedPoint`](Interface.ProjectedPoint.md) \| `null`

`out`, or `null` if culled.

#### Implementation of

[`Projector3D`](Interface.Projector3D.md).[`projectInto`](Interface.Projector3D.md#projectinto)

***

### rayInto()

```ts
rayInto(
   out, 
   screenX, 
   screenY, 
   camera, 
   viewport
): ScreenRay | null;
```

Defined in: geom/sphereProjector.ts:97

Inverse-project a screen cell to a world-space ray whose direction is the
surface point's unit direction.

#### Parameters

##### out

[`ScreenRay`](Interface.ScreenRay.md)

Target ray.

##### screenX

`number`

Screen column.

##### screenY

`number`

Screen row.

##### camera

[`Camera3D`](Class.Camera3D.md)

Camera providing the ray origin.

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

Screen placement.

#### Returns

[`ScreenRay`](Interface.ScreenRay.md) \| `null`

`out`, or `null` if the cell is off the disc.

#### Implementation of

[`Projector3D`](Interface.Projector3D.md).[`rayInto`](Interface.Projector3D.md#rayinto)

***

### surfaceInto()

```ts
surfaceInto(
   out, 
   screenX, 
   screenY, 
   viewport
): SurfaceSample | null;
```

Defined in: geom/sphereProjector.ts:116

Surface-specialised inverse used by SurfaceMesh3D: returns theta/phi/normal
(allocation-free, writing into `out`) plus depth = normal.z, the data an
implicit-surface sampler needs. Mirrors SphereProjection.screenToSurfaceInto.

#### Parameters

##### out

[`SurfaceSample`](Interface.SurfaceSample.md)

Target surface sample (its `normal` and `depth` are filled).

##### screenX

`number`

Screen column.

##### screenY

`number`

Screen row.

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

Screen placement.

#### Returns

[`SurfaceSample`](Interface.SurfaceSample.md) \| `null`

`out`, or `null` if the cell is off the disc.
