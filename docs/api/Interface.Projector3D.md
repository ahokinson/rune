[**rune**](README.md)

***

[rune](README.md) / Projector3D

# Interface: Projector3D

Defined in: geom/camera3d.ts:49

Strategy that maps between world space and screen space for a Camera3D. Both
directions are provided so forward (point -> screen) and inverse (cell -> ray)
projections can stay in lock-step. Implemented by OrthographicProjector3D and
PerspectiveProjector3D (generic), and SphereProjector (the globe).

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

Defined in: geom/camera3d.ts:55

Forward-project a world point. `altitude` (>= 1) optionally pushes the point
radially outward so arcs can bow off a surface; pass 1 for plain points.
Returns null when culled. Writes into `out` and returns it otherwise.

#### Parameters

##### out

[`ProjectedPoint`](Interface.ProjectedPoint.md)

##### worldPoint

[`Vector3`](Class.Vector3.md)

##### altitude

`number`

##### camera

[`Camera3D`](Class.Camera3D.md)

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

#### Returns

[`ProjectedPoint`](Interface.ProjectedPoint.md) \| `null`

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

Defined in: geom/camera3d.ts:67

Inverse: the world-space ray through a (sub)cell centre. Returns null when
the cell maps to nothing (e.g. outside a sphere's disc).

#### Parameters

##### out

[`ScreenRay`](Interface.ScreenRay.md)

##### screenX

`number`

##### screenY

`number`

##### camera

[`Camera3D`](Class.Camera3D.md)

##### viewport

[`Viewport3D`](Interface.Viewport3D.md)

#### Returns

[`ScreenRay`](Interface.ScreenRay.md) \| `null`
