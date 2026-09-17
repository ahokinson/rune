# scene

The entity model: the abstract [`Entity`](../api/Class.Entity.md) base, its 2D/3D renderable subclasses, the scenes that hold them, and the 2D/3D bridge. Every game object is a class extending an engine primitive and overriding `update`/`draw`; you compose complexity by subclassing and nesting children, not by wiring loose objects together.

## Overview

Every entity shares a lifecycle (`onEnter` / `update(deltaMilliseconds)` / `onExit`), `visible` / `enabled` flags, a `zIndex`, and a parent/child tree whose transforms compose down the tree. Construction is always from a single options object — the one convention all entities share, and what `rune add entity` generates.

[`Entity2D`](../api/Class.Entity2D.md) adds a 2D transform (position, rotation, scale, size) with **render-frame interpolation**: the scene snapshots the transform each fixed tick, and during `draw(canvas, renderAlpha)` the interpolated transform is available so motion stays smooth at frame rates higher than the tick rate. [`Entity3D`](../api/Class.Entity3D.md) carries position/quaternion/scale and computes a [`Matrix4`](../api/Class.Matrix4.md) model matrix for the rasterizer. Ready-made subclasses cover the common cases — [`SpriteEntity`](../api/Class.SpriteEntity.md), [`AnimatedSpriteEntity`](../api/Class.AnimatedSpriteEntity.md), [`MeshEntity3D`](../api/Class.MeshEntity3D.md), [`TileLayer`](../api/Class.TileLayer.md) — and [`Particles`](../api/Class.Particles.md) / [`Particles3D`](../api/Class.Particles3D.md) / [`TriggerVolume`](../api/Class.TriggerVolume.md) live in [fx](fx.md) / [physics](physics.md).

[`SceneInstance`](../api/Class.SceneInstance.md) (`Scene` in source, re-exported as `SceneInstance` so it doesn't shadow the `<Scene>` component) is the top-level 2D container drawn through one [`Camera`](../api/Class.Camera.md); [`Scene3D`](../api/Class.Scene3D.md) is the 3D counterpart projected against a [`Camera3D`](../api/Class.Camera3D.md). [`WorldView3D`](../api/Class.WorldView3D.md) is the bridge: an `Entity2D` that owns and ticks a `Scene3D` and draws it at a viewport, so HUD and effect entities layer around the 3D view by `zIndex`. [`SceneManager`](../api/Class.SceneManager.md) is the push/pop scene stack. Collision overlaps are dispatched by [`detectCollisions`](../api/Function.detectCollisions.md); clip-from-state animation by [`playClipForState`](../api/Function.playClipForState.md).

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `entity.ts` | [`Entity`](../api/Class.Entity.md) | Abstract base: lifecycle, visibility, tree. |
| `entity2d.ts` | [`Entity2D`](../api/Class.Entity2D.md) | 2D transform + render-frame interpolation. |
| `entity3d.ts` | [`Entity3D`](../api/Class.Entity3D.md), [`Draw3DContext`](../api/Interface.Draw3DContext.md) | 3D transform → model matrix. |
| `spriteEntity.ts` | [`SpriteEntity`](../api/Class.SpriteEntity.md) | `Entity2D` drawing one [`Sprite`](../api/Class.Sprite.md). |
| `animatedSpriteEntity.ts` | [`AnimatedSpriteEntity`](../api/Class.AnimatedSpriteEntity.md) | `Entity2D` backed by an [`AnimatedSprite`](../api/Class.AnimatedSprite.md). |
| `meshEntity3d.ts` | [`MeshEntity3D`](../api/Class.MeshEntity3D.md) | `Entity3D` drawing an indexed mesh via [`renderMesh`](../api/Function.renderMesh.md). |
| `tileLayer.ts` | [`TileLayer`](../api/Class.TileLayer.md) | `Entity2D` rendering a tile grid through a [`TileSet`](../api/Class.TileSet.md). |
| `worldView3d.ts` | [`WorldView3D`](../api/Class.WorldView3D.md) | `Entity2D` owning/ticking/drawing a `Scene3D` (the 2D/3D bridge). |
| `scene.ts` | [`SceneInstance`](../api/Class.SceneInstance.md) | Top-level 2D container + camera. |
| `scene3d.ts` | [`Scene3D`](../api/Class.Scene3D.md) | 3D entity tree projected against a `Camera3D`. |
| `sceneManager.ts` | [`SceneManager`](../api/Class.SceneManager.md) | Stack of scenes with one active top. |
| `collision.ts` | [`detectCollisions`](../api/Function.detectCollisions.md) | Dispatch `onCollide` to overlapping entity pairs. |
| `spriteState.ts` | [`playClipForState`](../api/Function.playClipForState.md) | Drive an `AnimatedSprite` clip from a `StateMachine` state. |

## Key types

### Classes
- [`Entity`](../api/Class.Entity.md) — Abstract base for every game object.
- [`Entity2D`](../api/Class.Entity2D.md) — 2D node with transform + render interpolation; `bounds` returns an [`Rectangle`](../api/Class.Rectangle.md) AABB.
- [`Entity3D`](../api/Class.Entity3D.md) — 3D node with position/quaternion/scale → [`Matrix4`](../api/Class.Matrix4.md) model matrix.
- [`SpriteEntity`](../api/Class.SpriteEntity.md) — Simplest renderable: one [`Sprite`](../api/Class.Sprite.md) at its position.
- [`AnimatedSpriteEntity`](../api/Class.AnimatedSpriteEntity.md) — `Entity2D` backed by an [`AnimatedSprite`](../api/Class.AnimatedSprite.md).
- [`MeshEntity3D`](../api/Class.MeshEntity3D.md) — `Entity3D` drawing an indexed mesh through the rasterizer.
- [`TileLayer`](../api/Class.TileLayer.md) — Camera-culled tile-grid renderer.
- [`WorldView3D`](../api/Class.WorldView3D.md) — The 2D/3D bridge; owns a `Scene3D`.
- [`SceneInstance`](../api/Class.SceneInstance.md) — Top-level 2D container drawn through one [`Camera`](../api/Class.Camera.md).
- [`Scene3D`](../api/Class.Scene3D.md) — 3D entity tree projected/culled/depth-ordered against one [`Camera3D`](../api/Class.Camera3D.md).
- [`SceneManager`](../api/Class.SceneManager.md) — Push/pop scene stack; `current` is updated and drawn each frame.

### Functions
- [`detectCollisions`](../api/Function.detectCollisions.md) — Dispatch `onCollide()` to overlapping entities (run once per fixed step after movement).
- [`playClipForState`](../api/Function.playClipForState.md) — Play the clip mapped to a [`StateMachine`](../api/Class.StateMachine.md)'s current state.

### Types & interfaces
- [`EntityOptions`](../api/Interface.EntityOptions.md) / [`Entity2DOptions`](../api/Interface.Entity2DOptions.md) / [`Entity3DOptions`](../api/Interface.Entity3DOptions.md) — Construction options shared by every entity.
- [`SpriteEntityOptions`](../api/Interface.SpriteEntityOptions.md) / [`AnimatedSpriteEntityOptions`](../api/Interface.AnimatedSpriteEntityOptions.md) / [`MeshEntity3DOptions`](../api/Interface.MeshEntity3DOptions.md) / [`TileLayerOptions`](../api/Interface.TileLayerOptions.md) / [`WorldView3DOptions`](../api/Interface.WorldView3DOptions.md) — Subclass options.
- [`Scene3DOptions`](../api/Interface.Scene3DOptions.md) — `Scene3D` config (`camera`, `subpixel`, `clearColor`, `occlude`).
- [`Draw3DContext`](../api/Interface.Draw3DContext.md) — Everything a `Scene3D` hands an `Entity3D` to draw one frame.
- [`SceneEventMap`](../api/TypeAlias.SceneEventMap.md) — Events emitted by a scene's [`EventEmitter`](../api/Class.EventEmitter.md).

## Usage

```ts
import { AnimatedSpriteEntity, type AnimatedSpriteEntityOptions, Vector2 } from "@ahokinson/rune"

export interface PlayerOptions extends AnimatedSpriteEntityOptions {
  spawn: Vector2
}

export class Player extends AnimatedSpriteEntity {
  constructor(options: PlayerOptions) {
    super({ animation: buildPlayerSprite(), position: options.spawn, zIndex: 10 })
  }

  override update(deltaMilliseconds: number): void {
    // movement, collision, set this.animation clip
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    super.draw(canvas, camera) // default sprite draw, or paint your own
  }
}

scene.add(new Player({ spawn: new Vector2(10, 5) }))
```

## See also

- [Scenes & entities](../concepts/scenes-and-entities.md) — the full hierarchy, the options-object convention, collision.
- [Application & loop](../concepts/application-and-loop.md) — fixed update vs. frame update, `renderAlpha`.
- [physics](physics.md) — [`KinematicBody2D`](../api/Class.KinematicBody2D.md), [`TriggerVolume`](../api/Class.TriggerVolume.md), [`moveAndCollide`](../api/Function.moveAndCollide.md).
- [draw](draw.md) — sprites, tile sets, the rasterizer entities draw through.
- [geom](geom.md) — [`PointCloud3D`](../api/Class.PointCloud3D.md), [`Polyline3D`](../api/Class.Polyline3D.md), [`SurfaceMesh3D`](../api/Class.SurfaceMesh3D.md).
