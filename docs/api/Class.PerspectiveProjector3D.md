[**rune**](README.md)

***

[rune](README.md) / PerspectiveProjector3D

# Class: PerspectiveProjector3D

Defined in: geom/camera3d.ts:267

Pinhole perspective: closer points project larger. Culls points at/behind the
near plane and beyond `far`. `altitude` scales the projected offset outward
for arc bowing, mirroring the orthographic/sphere behaviour.

## Implements

- [`Projector3D`](Interface.Projector3D.md)

## Constructors

### Constructor

```ts
new PerspectiveProjector3D(options?): PerspectiveProjector3D;
```

Defined in: geom/camera3d.ts:281

#### Parameters

##### options?

[`PerspectiveProjector3DOptions`](Interface.PerspectiveProjector3DOptions.md) = `{}`

FOV, near, and far clip distances.

#### Returns

`PerspectiveProjector3D`

## Properties

### far

```ts
far: number;
```

Defined in: geom/camera3d.ts:273

Far clip distance.

***

### fieldOfView

```ts
fieldOfView: number;
```

Defined in: geom/camera3d.ts:269

Vertical field of view in radians.

***

### near

```ts
near: number;
```

Defined in: geom/camera3d.ts:271

Near clip distance.

## Methods

### projectInto()

```ts
projectInto(
   out, 
   worldPoint, 
   altitude, 
   camera, 
   viewport
): ProjectedPoint | null;
```

Defined in: geom/camera3d.ts:297

Forward-project a world point with perspective division.

#### Parameters

##### out

[`ProjectedPoint`](Interface.ProjectedPoint.md)

Target projected point.

##### worldPoint

[`Vector3`](Class.Vector3.md)

Point in world space.

##### altitude

`number`

Radial lift (>= 1); pass 1 for plain points.

##### camera

[`Camera3D`](Class.Camera3D.md)

Camera providing position and orientation.

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

Screen placement.

#### Returns

[`ProjectedPoint`](Interface.ProjectedPoint.md) \| `null`

`out` with screen coordinates and depth, or `null` if culled by near/far.

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

Defined in: geom/camera3d.ts:335

Inverse-project a screen cell to a perspective world-space ray.

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

Camera providing position and orientation.

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

Screen placement.

#### Returns

[`ScreenRay`](Interface.ScreenRay.md) \| `null`

`out` with origin at the camera and a unit direction through the cell.

#### Implementation of

[`Projector3D`](Interface.Projector3D.md).[`rayInto`](Interface.Projector3D.md#rayinto)
