[**rune**](README.md)

***

[rune](README.md) / OrthographicProjector3D

# Class: OrthographicProjector3D

Defined in: geom/camera3d.ts:178

Parallel projection: depth does not affect screen scale. `altitude` lifts the
projected offset radially from the viewport centre (so it bows arcs the same
way the sphere does). Culls points behind the camera.

## Implements

- [`Projector3D`](Interface.Projector3D.md)

## Constructors

### Constructor

```ts
new OrthographicProjector3D(options?): OrthographicProjector3D;
```

Defined in: geom/camera3d.ts:188

#### Parameters

##### options?

[`OrthographicProjector3DOptions`](Interface.OrthographicProjector3DOptions.md) = `{}`

Scale multiplier.

#### Returns

`OrthographicProjector3D`

## Properties

### scale

```ts
scale: number;
```

Defined in: geom/camera3d.ts:180

Extra scale multiplier on top of `viewport.radius`.

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

Defined in: geom/camera3d.ts:202

Forward-project a world point orthographically.

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

`out` with screen coordinates and depth, or `null` if behind the camera.

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

Defined in: geom/camera3d.ts:238

Inverse-project a screen cell to an orthographic world-space ray.

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

`out` with origin on the camera plane and unit forward direction.

#### Implementation of

[`Projector3D`](Interface.Projector3D.md).[`rayInto`](Interface.Projector3D.md#rayinto)
