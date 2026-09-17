# geom

3D maths and geometry: cameras, projectors, the unit-sphere transform, mesh builders and loaders, and the `Entity3D` subclasses that draw point clouds, polylines, and implicit surfaces. Use this for anything 3D that isn't the triangle rasterizer itself (that lives in [draw](draw.md)).

## Overview

`geom/` splits along two axes. The first is **projection**: a [`Camera3D`](../api/Class.Camera3D.md) is a free 3D camera (position + orientation) that defers all screen-space work to a pluggable [`Projector3D`](../api/Interface.Projector3D.md). Two generic projectors ship — [`OrthographicProjector3D`](../api/Class.OrthographicProjector3D.md) (parallel, no perspective) and [`PerspectiveProjector3D`](../api/Class.PerspectiveProjector3D.md) (pinhole) — plus [`SphereProjector`](../api/Class.SphereProjector.md), which adapts the battle-tested [`SphereProjection`](../api/Class.SphereProjection.md) tilt/spin/aspect math so a `Camera3D` can drive the globe. Projectors own both the forward (point → screen) and inverse (cell → ray) directions so they stay in lock-step.

The second axis is **meshes**: [`solids.ts`](../api/Function.cubeMesh.md) builds analytic primitives (cube, sphere, torus, plane), [`meshBuilder.ts`](../api/Function.lathe.md) composes surfaces of revolution and swept tubes, and [`obj.ts`](../api/Function.parseObj.md) loads Wavefront OBJ files and normalises them onto the origin. All return the flat typed-array [`Mesh`](../api/Interface.Mesh.md) shape the rasterizer consumes. The sphere math in [`sphere.ts`](../api/Function.sphericalToVector3.md) (spherical↔cartesian, slerp, great-circle arcs) is kept separate from projection so depth/culling stay tied to the true surface.

Three `Entity3D` subclasses live here because they're projection-coupled rather than mesh-rasterized: [`PointCloud3D`](../api/Class.PointCloud3D.md), [`Polyline3D`](../api/Class.Polyline3D.md), and the implicit-surface [`SurfaceMesh3D`](../api/Class.SurfaceMesh3D.md). [`OrbitControl`](../api/Class.OrbitControl.md) is the click-and-drag turntable camera for 3D viewers.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `camera3d.ts` | [`Camera3D`](../api/Class.Camera3D.md), [`Projector3D`](../api/Interface.Projector3D.md), [`OrthographicProjector3D`](../api/Class.OrthographicProjector3D.md), [`PerspectiveProjector3D`](../api/Class.PerspectiveProjector3D.md) | Free 3D camera + pluggable projectors. |
| `sphereProjection.ts` | [`SphereProjection`](../api/Class.SphereProjection.md), [`SphereView`](../api/Interface.SphereView.md), [`SurfacePoint`](../api/Interface.SurfacePoint.md), [`ScreenPoint`](../api/Interface.ScreenPoint.md) | Tilt/spin unit-sphere transform (lock-step forward + inverse). |
| `sphereProjector.ts` | [`SphereProjector`](../api/Class.SphereProjector.md), [`SurfaceSample`](../api/Interface.SurfaceSample.md) | Adapts `SphereProjection` to the `Projector3D` interface. |
| `sphere.ts` | [`sphericalToVector3`](../api/Function.sphericalToVector3.md), [`vector3ToSpherical`](../api/Function.vector3ToSpherical.md), [`slerp`](../api/Function.slerp.md), [`greatCircleAngle`](../api/Function.greatCircleAngle.md), [`sampleGreatCircleArc`](../api/Function.sampleGreatCircleArc.md) | Spherical↔cartesian + great-circle maths. |
| `solids.ts` | [`cubeMesh`](../api/Function.cubeMesh.md), [`sphereMesh`](../api/Function.sphereMesh.md), [`torusMesh`](../api/Function.torusMesh.md), [`planeMesh`](../api/Function.planeMesh.md) | Analytic primitive mesh generators. |
| `meshBuilder.ts` | [`lathe`](../api/Function.lathe.md), [`sweepTube`](../api/Function.sweepTube.md), [`mergeParts`](../api/Function.mergeParts.md), [`reverseWinding`](../api/Function.reverseWinding.md), [`triangleCount`](../api/Function.triangleCount.md), [`MeshPart`](../api/Interface.MeshPart.md) | Compose/combine indexed meshes. |
| `obj.ts` | [`parseObj`](../api/Function.parseObj.md), [`normalizeMesh`](../api/Function.normalizeMesh.md), [`NormalizeOptions`](../api/Interface.NormalizeOptions.md) | Wavefront OBJ loader + recentre/scale. |
| `spline.ts` | [`catmullRom`](../api/Function.catmullRom.md), [`sampleSpline`](../api/Function.sampleSpline.md) | Catmull–Rom interpolation (any dimension). |
| `geometry3d.ts` | [`PointCloud3D`](../api/Class.PointCloud3D.md), [`Polyline3D`](../api/Class.Polyline3D.md), [`SurfaceMesh3D`](../api/Class.SurfaceMesh3D.md) | Projection-coupled 3D geometry entities. |
| `shading.ts` | [`lambert`](../api/Function.lambert.md), [`directionToScreenPlane`](../api/Function.directionToScreenPlane.md) | Lambert diffuse term + screen-plane projection of a direction. |
| `texture.ts` | [`equirectTexel`](../api/Function.equirectTexel.md) | Equirectangular (θ, φ) → texel mapping. |
| `orbitControl.ts` | [`OrbitControl`](../api/Class.OrbitControl.md), [`OrbitOptions`](../api/Interface.OrbitOptions.md) | Click-and-drag turntable orbit for viewers. |

## Key types

### Cameras & projectors
- [`Camera3D`](../api/Class.Camera3D.md) — Free 3D camera: position + orientation + a pluggable `Projector3D`.
- [`Projector3D`](../api/Interface.Projector3D.md) — Strategy mapping world ↔ screen for a `Camera3D` (forward + inverse).
- [`OrthographicProjector3D`](../api/Class.OrthographicProjector3D.md) — Parallel projection; depth doesn't affect screen scale.
- [`PerspectiveProjector3D`](../api/Class.PerspectiveProjector3D.md) — Pinhole perspective; closer points project larger.
- [`SphereProjection`](../api/Class.SphereProjection.md) — Tilt/spin unit-sphere transform, owns both projection directions.
- [`SphereProjector`](../api/Class.SphereProjector.md) — `SphereProjection` exposed through the `Projector3D` interface.
- [`OrbitControl`](../api/Class.OrbitControl.md) — Drag/spin/resume turntable; exposes absolute `yaw`/`pitch`.
- [`Viewport3D`](../api/Interface.Viewport3D.md), [`ProjectedPoint`](../api/Interface.ProjectedPoint.md), [`ScreenRay`](../api/Interface.ScreenRay.md), [`SphereView`](../api/Interface.SphereView.md), [`SurfacePoint`](../api/Interface.SurfacePoint.md), [`ScreenPoint`](../api/Interface.ScreenPoint.md), [`SurfaceSample`](../api/Interface.SurfaceSample.md) — Projection I/O shapes.

### Sphere maths
- [`sphericalToVector3`](../api/Function.sphericalToVector3.md) / [`sphericalToVector3Into`](../api/Function.sphericalToVector3Into.md) — Unit direction for an elevation/azimuth (the `*Into` form writes into `out`).
- [`vector3ToSpherical`](../api/Function.vector3ToSpherical.md) — Recover elevation/azimuth from a direction.
- [`slerp`](../api/Function.slerp.md) / [`slerpInto`](../api/Function.slerpInto.md) — Spherical linear interpolation along a great circle.
- [`greatCircleAngle`](../api/Function.greatCircleAngle.md) / [`sampleGreatCircleArc`](../api/Function.sampleGreatCircleArc.md) — Arc angle and sampled arc points (unit directions).

### Mesh builders & loaders
- [`cubeMesh`](../api/Function.cubeMesh.md), [`sphereMesh`](../api/Function.sphereMesh.md), [`torusMesh`](../api/Function.torusMesh.md), [`planeMesh`](../api/Function.planeMesh.md) — Analytic primitives returning a [`Mesh`](../api/Interface.Mesh.md).
- [`lathe`](../api/Function.lathe.md) — Revolve a `[radius, height]` profile around the Y axis.
- [`sweepTube`](../api/Function.sweepTube.md) — Sweep a circular cross-section along a 3D Catmull–Rom path.
- [`mergeParts`](../api/Function.mergeParts.md) — Concatenate [`MeshPart`](../api/Interface.MeshPart.md)s into one indexed mesh.
- [`reverseWinding`](../api/Function.reverseWinding.md) / [`triangleCount`](../api/Function.triangleCount.md) — Flip facing / count triangles.
- [`parseObj`](../api/Function.parseObj.md) — Minimal Wavefront OBJ → [`Mesh`](../api/Interface.Mesh.md).
- [`normalizeMesh`](../api/Function.normalizeMesh.md) — Recentre on origin and uniformly scale to `size`.
- [`catmullRom`](../api/Function.catmullRom.md) / [`sampleSpline`](../api/Function.sampleSpline.md) — Spline maths shared by `lathe`/`sweepTube`.

### 3D geometry entities
- [`PointCloud3D`](../api/Class.PointCloud3D.md) — World-space points projected to single glyphs.
- [`Polyline3D`](../api/Class.Polyline3D.md) — World-space polyline; integer-interpolated, depth-tested per cell.
- [`SurfaceMesh3D`](../api/Class.SurfaceMesh3D.md) — Implicit surface via per-cell raycast against the sphere.

### Shading & textures
- [`lambert`](../api/Function.lambert.md) — Lambertian diffuse term for a normal lit by a directional light.
- [`directionToScreenPlane`](../api/Function.directionToScreenPlane.md) — Project a 3D direction onto the screen XY plane.
- [`equirectTexel`](../api/Function.equirectTexel.md) — Map spherical angles to equirectangular texel coordinates.

## Usage

```ts
import { Camera3D, PerspectiveProjector3D, cubeMesh, parseObj, normalizeMesh, MeshEntity3D, LambertMeshShader, SubpixelTarget, renderMesh, Color } from "@ahokinson/rune"

const camera = new Camera3D({
  position: new Vector3(0, 2, 5),
  projector: new PerspectiveProjector3D({ near: 0.1, far: 100, fov: 1.2 }),
})

const mesh = normalizeMesh(parseObj(objText), { size: 4 })
const target = new SubpixelTarget(width, height)
const shader = new LambertMeshShader({ color: Color.fromHex("#c0c0c0"), light: new Vector3(-1, 1, -1).normalizeInPlace() })

renderMesh({
  target,
  model: Matrix4.identity(),
  view: camera.viewMatrix,
  projection: camera.projection,
  mesh,
  shader,
})
target.resolveTo(canvas)
```

## See also

- [draw](draw.md) — the [`renderMesh`](../api/Function.renderMesh.md) rasterizer, [`Mesh`](../api/Interface.Mesh.md) shape, and [`SubpixelTarget`](../api/Class.SubpixelTarget.md).
- [scene](scene.md) — [`Entity3D`](../api/Class.Entity3D.md), [`Scene3D`](../api/Class.Scene3D.md), [`MeshEntity3D`](../api/Class.MeshEntity3D.md).
- [Scenes & entities](../concepts/scenes-and-entities.md) — the 2D/3D bridge via [`WorldView3D`](../api/Class.WorldView3D.md).
