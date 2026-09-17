# teapot

A 3D mesh viewer built on the engine's CPU rasterizer. The headline is the Utah teapot, loaded from a bundled OBJ and shaded Lambert/Phong/toon/normals with cast shadows onto a floor; the viewer also cycles procedural cube/sphere/torus meshes, flat/checker/uv-grid/marble textures, a wireframe x-ray mode, and a free-body physics drop. Drag to orbit; release and it auto-spins.

## Run it

```sh
# From the repo root:
bun run example:teapot

# Or from the example directory:
cd examples/teapot
bun run dev
```

## What it showcases

The 3D bridge and the rasterizer. `MeshView.tsx` is the [`WorldView3D`](../api/Class.WorldView3D.md) pattern: a [`Scene3D`](../api/Class.Scene3D.md) with `subpixel: true` and a [`Camera3D`](../api/Class.Camera3D.md) + [`PerspectiveProjector3D`](../api/Class.PerspectiveProjector3D.md) is composited into the 2D scene by a `WorldView3D` instance, with the HUD layered on top by `zIndex`. The mesh stage itself is a custom [`Entity3D`](../api/Class.Entity3D.md) (`MeshStage`) that draws through [`renderMesh`](../api/Function.renderMesh.md) into the scene's shared subpixel target — the engine's per-triangle rasterizer. Shading is a [`LitMeshShader`](../api/Class.LitMeshShader.md) cycled through its [`LitMeshShaderMode`](../api/TypeAlias.LitMeshShaderMode.md)s (`lambert`/`phong`/`toon`/`normals`); the view position is synced to the scene camera each frame so highlights track. Wireframe mode swaps in a flat unlit [`MeshShader`](../api/Interface.MeshShader.md) and draws the mesh shell only.

Shadows, meshes, and physics. A [`ShadowMap`](../api/Class.ShadowMap.md) does the depth pass from the shared light direction (only the spinning mesh casts); the shader's `shadowMap` lookup is nulled when shadows are toggled off, and the floor is rendered with the same shader so the cast shadow lands on it. Meshes come from three places: the bundled teapot is [`parseObj`](../api/Function.parseObj.md) → [`normalizeMesh`](../api/Function.normalizeMesh.md) (recentre, scale, Z-up→Y-up axis map) → [`reverseWinding`](../api/Function.reverseWinding.md) to match the engine's front-face convention (`geometry/load.ts`), with a procedural fallback; that fallback is the curve-driven teapot built from [`lathe`](../api/Function.lathe.md) (body + lid) and [`sweepTube`](../api/Function.sweepTube.md) (spout + handle) merged with [`mergeParts`](../api/Function.mergeParts.md) (`geometry/teapot.ts`); and the primitives [`cubeMesh`](../api/Function.cubeMesh.md)/[`sphereMesh`](../api/Function.sphereMesh.md)/[`torusMesh`](../api/Function.torusMesh.md)/[`planeMesh`](../api/Function.planeMesh.md). Textures are procedural [`Texture`](../api/Class.Texture.md)s — the engine's [`checkerTexture`](../api/Function.checkerTexture.md)/[`uvGridTexture`](../api/Function.uvGridTexture.md) plus the shared `makeMarbleTexture` (veined marble via [`Noise3D`](../api/Class.Noise3D.md)). The free-body mode seeds a [`RigidBody3D`](../api/Class.RigidBody3D.md) from the current mesh and turntable pose — [`colliderFor`](../api/Function.colliderFor.md) picks a [`ColliderKind`](../api/Enumeration.ColliderKind.md) per mesh (box/sphere/mesh) so the sphere rolls and the cube settles — and the model matrix is rebuilt each frame from the body's pose via [`Matrix4`](../api/Class.Matrix4.md).composeQuaternionInto.

Orbit and HUD. Turntable control is [`OrbitControl`](../api/Class.OrbitControl.md) (drag yaw/pitch, auto-spin, tilt resume ease); the model matrix for the non-physics mode is `Matrix4.composeInto(translation, eulerRotation, scale)`. The HUD reads live state off the stage and reports [`triangleCount`](../api/Function.triangleCount.md), the current look, fps ([`FramesPerSecondCounter`](../api/Class.FramesPerSecondCounter.md)), and the control legend.

| Engine feature | Where in the example |
| --- | --- |
| [`renderMesh`](../api/Function.renderMesh.md) / [`Draw3DContext`](../api/Interface.Draw3DContext.md) | `scene/MeshEntity.ts` — the rasterizer draw call into the shared subpixel target. |
| [`LitMeshShader`](../api/Class.LitMeshShader.md) / [`MeshShader`](../api/Interface.MeshShader.md) / [`LitMeshShaderMode`](../api/TypeAlias.LitMeshShaderMode.md) | `scene/MeshEntity.ts` — the four lit modes + the flat wireframe shader. |
| [`ShadowMap`](../api/Class.ShadowMap.md) / [`ShadowCaster`](../api/Interface.ShadowCaster.md) | `scene/MeshEntity.ts` — light-depth pass; mesh casts onto the lit floor. |
| [`Scene3D`](../api/Class.Scene3D.md) / [`WorldView3D`](../api/Class.WorldView3D.md) / [`Entity3D`](../api/Class.Entity3D.md) | `scene/MeshView.tsx` + `scene/MeshEntity.ts` — the 3D-in-2D bridge + a custom stage entity. |
| [`Camera3D`](../api/Class.Camera3D.md) / [`PerspectiveProjector3D`](../api/Class.PerspectiveProjector3D.md) | `scene/MeshView.tsx` — the perspective camera feeding the rasterizer. |
| [`parseObj`](../api/Function.parseObj.md) / [`normalizeMesh`](../api/Function.normalizeMesh.md) / [`reverseWinding`](../api/Function.reverseWinding.md) | `geometry/load.ts` — the bundled teapot's load + reorient + winding-fix pipeline. |
| [`lathe`](../api/Function.lathe.md) / [`sweepTube`](../api/Function.sweepTube.md) / [`mergeParts`](../api/Function.mergeParts.md) | `geometry/teapot.ts` — the procedural teapot fallback (surfaces of revolution + swept tubes). |
| [`cubeMesh`](../api/Function.cubeMesh.md) / [`sphereMesh`](../api/Function.sphereMesh.md) / [`torusMesh`](../api/Function.torusMesh.md) / [`planeMesh`](../api/Function.planeMesh.md) | `scene/MeshEntity.ts` — the primitive mesh cycle + the floor. |
| [`RigidBody3D`](../api/Class.RigidBody3D.md) / [`colliderFor`](../api/Function.colliderFor.md) / [`ColliderKind`](../api/Enumeration.ColliderKind.md) | `scene/MeshEntity.ts` — the physics drop with per-mesh collider shapes. |
| [`OrbitControl`](../api/Class.OrbitControl.md) / [`Matrix4`](../api/Class.Matrix4.md) | `scene/MeshEntity.ts` — turntable + model-matrix composition from pose. |
| [`checkerTexture`](../api/Function.checkerTexture.md) / [`uvGridTexture`](../api/Function.uvGridTexture.md) / [`Texture`](../api/Class.Texture.md) | `scene/MeshEntity.ts` — procedural textures (marble comes from `examples/shared/textures.ts`). |

## Key files

| File | What it demonstrates |
| --- | --- |
| `App.tsx` | Bootstrap at 60 tps. |
| `scene/MeshView.tsx` | The `WorldView3D` bridge — `Scene3D { subpixel: true }` composited with the HUD. |
| `scene/MeshEntity.ts` | The full pipeline: rasterizer + lit shader + shadow map + orbit + physics + viewer state. |
| `geometry/load.ts` | OBJ parsing + normalize + winding fix, with a procedural fallback. |
| `geometry/teapot.ts` | The curve-driven procedural teapot (`lathe` + `sweepTube` + `mergeParts`). |
| `scene/Hud.ts` | Live status panel + control legend (`triangleCount`, fps). |

## See also

- [Scenes & entities](../concepts/scenes-and-entities.md) — `Scene3D`, `WorldView3D`, the 3D-in-2D bridge.
- [geom](../modules/geom.md) — 3D cameras, projectors, mesh builders.
- [physics](../modules/physics.md) — `RigidBody3D` and colliders.
