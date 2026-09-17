[**rune**](README.md)

***

[rune](README.md) / Camera3D

# Class: Camera3D

Defined in: geom/camera3d.ts:97

A free 3D camera: a position + orientation in world space plus a pluggable
projector. Geometry is projected/culled through `projector`, so the same
camera can drive an orthographic, perspective, or spherical view.

## Example

```ts
const cam = new Camera3D({ projector: new OrthographicProjector3D() })
const p = cam.projectInto(out, worldPoint, 1, viewport)
```

## Constructors

### Constructor

```ts
new Camera3D(options?): Camera3D;
```

Defined in: geom/camera3d.ts:110

#### Parameters

##### options?

[`Camera3DOptions`](Interface.Camera3DOptions.md) = `{}`

Position, orientation, and projector.

#### Returns

`Camera3D`

## Properties

### forward

```ts
forward: Vector3;
```

Defined in: geom/camera3d.ts:101

Forward look direction (unit).

***

### position

```ts
position: Vector3;
```

Defined in: geom/camera3d.ts:99

Camera position in world space.

***

### projector

```ts
projector: Projector3D | null;
```

Defined in: geom/camera3d.ts:105

Pluggable projector strategy; `null` disables projection.

***

### up

```ts
up: Vector3;
```

Defined in: geom/camera3d.ts:103

Up hint used to derive the right axis.

## Methods

### projectInto()

```ts
projectInto(
   out, 
   worldPoint, 
   altitude, 
   viewport
): ProjectedPoint | null;
```

Defined in: geom/camera3d.ts:126

Forward-project a world point through the camera's projector.

#### Parameters

##### out

[`ProjectedPoint`](Interface.ProjectedPoint.md)

Target projected point to fill.

##### worldPoint

[`Vector3`](Class.Vector3.md)

Point in world space.

##### altitude

`number`

Radial lift (>= 1); pass 1 for plain points.

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

Screen placement for this frame.

#### Returns

[`ProjectedPoint`](Interface.ProjectedPoint.md) \| `null`

`out` with screen coordinates and depth, or `null` if culled / no projector.

***

### rayInto()

```ts
rayInto(
   out, 
   screenX, 
   screenY, 
   viewport
): ScreenRay | null;
```

Defined in: geom/camera3d.ts:140

Inverse-project a screen cell to a world-space ray through the camera's projector.

#### Parameters

##### out

[`ScreenRay`](Interface.ScreenRay.md)

Target ray to fill.

##### screenX

`number`

Screen column (sub-cell centre).

##### screenY

`number`

Screen row (sub-cell centre).

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

Screen placement for this frame.

#### Returns

[`ScreenRay`](Interface.ScreenRay.md) \| `null`

`out` with origin and unit direction, or `null` if culled / no projector.
