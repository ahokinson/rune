# Scenes & entities

Entities are the basis of every game. A game object is a class that **extends an engine primitive** and overrides `update`/`draw`; you compose complexity by subclassing and by nesting children, not by wiring loose objects together.

## The entity hierarchy

```
Entity (abstract base)
  ├── Entity2D  (2D node with transform + render interpolation)
  │     ├── SpriteEntity
  │     ├── AnimatedSpriteEntity
  │     ├── TileLayer
  │     ├── Particles
  │     ├── TriggerVolume
  │     └── WorldView3D  (owns a Scene3D)
  └── Entity3D  (3D node with position/quaternion/scale → model matrix)
        ├── MeshEntity3D
        ├── PointCloud3D
        ├── Polyline3D
        ├── SurfaceMesh3D
        └── Particles3D
```

## `Entity` — the abstract base

Every entity shares:

- **Lifecycle**: `onEnter()` / `onExit()` / `update(deltaMilliseconds)`. The scene calls `onEnter` when the entity is added, `update` on each fixed tick, and `onExit` when removed.
- **Visibility**: `visible` (bool) — skipped by the draw pass when false.
- **Enabled**: `enabled` (bool) — skipped by the update pass when false.
- **`zIndex`**: draw order within the scene (ascending).
- **Parent/child tree**: `add(child)` / `remove(child)`. Transforms compose down the tree — a child's world position is its local position plus the parent's world transform.
- **Options-object constructor**: every entity is constructed from a single options object. This is the one convention all entities share.

```ts
import { type Camera, type CanvasSurface, Color, Entity2D, Vector2 } from "@ahokinson/rune"

export interface PlayerOptions {
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
    // paint through the scene camera
  }
}
```

## `Entity2D`

A 2D node with a full transform: `position` ([`Vector2`](../api/Class.Vector2.md)), `rotation` (radians), `scale` ([`Vector2`](../api/Class.Vector2.md)), `size` ([`Vector2`](../api/Class.Vector2.md)).

- **Render-frame interpolation**: the scene snapshots the entity's transform each fixed tick; during `draw(canvas, renderAlpha)`, the interpolated transform is available so motion stays smooth at frame rates higher than the tick rate.
- **Bounds**: `this.bounds` returns an [`Rectangle`](../api/Class.Rectangle.md) AABB derived from `position` and `size`.
- **Ready-made subclasses**: [`SpriteEntity`](../api/Class.SpriteEntity.md), [`AnimatedSpriteEntity`](../api/Class.AnimatedSpriteEntity.md), [`TileLayer`](../api/Class.TileLayer.md), [`Particles`](../api/Class.Particles.md), [`TriggerVolume`](../api/Class.TriggerVolume.md).

### Adding children

```ts
const player = new Player({ spawn: new Vector2(10, 5) })
const hud = new Hud()
scene.add(player)
scene.add(hud)

// Or nest:
const muzzle = new MuzzleFlash()
player.add(muzzle)  // muzzle's world transform follows player's
```

Children are updated and drawn after their parent, in `zIndex` order among siblings.

## `Entity3D`

A 3D node with `position` ([`Vector3`](../api/Class.Vector3.md)), `rotation` ([`Quaternion`](../api/Class.Quaternion.md)), `scale` ([`Vector3`](../api/Class.Vector3.md)). The `modelMatrix` ([`Matrix4`](../api/Class.Matrix4.md)) is computed from these and passed to the rasterizer.

Ready-made subclasses: [`MeshEntity3D`](../api/Class.MeshEntity3D.md), [`PointCloud3D`](../api/Class.PointCloud3D.md), [`Polyline3D`](../api/Class.Polyline3D.md), [`SurfaceMesh3D`](../api/Class.SurfaceMesh3D.md), [`Particles3D`](../api/Class.Particles3D.md).

3D entities live in a [`Scene3D`](../api/Class.Scene3D.md) and are projected/culled against a [`Camera3D`](../api/Class.Camera3D.md).

## `Scene` and `Scene3D`

### `Scene`

A [`Scene`](../api/Class.SceneInstance.md) holds the 2D entity tree and is drawn by `<SceneRenderer>` through one [`Camera`](../api/Class.Camera.md). It owns:

- The entity tree (added/removed via `scene.add(entity)` / `scene.remove(entity)`).
- A `camera` ([`Camera`](../api/Class.Camera.md)) with position/yaw and render-frame interpolation.
- `update(deltaMilliseconds)` — advances all enabled entities on the fixed tick.
- `draw(canvas, renderAlpha)` — draws all visible entities in `zIndex` order.

The Solid `<Scene>` component pushes a scene onto the application's scene stack on mount and pops on cleanup. If you don't pass a `scene` prop, it constructs `new Scene(name)`.

### `Scene3D`

A [`Scene3D`](../api/Class.Scene3D.md) is the 3D counterpart: a tree of `Entity3D` projected/culled vs a [`Camera3D`](../api/Class.Camera3D.md). Options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `camera` | [`Camera3D`](../api/Class.Camera3D.md) | (required) | The 3D camera. |
| `subpixel?` | `boolean` | `false` | Render through a [`SubpixelTarget`](../api/Class.SubpixelTarget.md) for 2×-vertical resolution via ▀ half-blocks. |
| `clearColor?` | [`Color`](../api/Class.Color.md) | — | Background clear color. |
| `occlude?` | `boolean` | `false` | Depth-test entities against a [`GridDepthBuffer`](../api/Class.GridDepthBuffer.md). |

You don't usually mount a `Scene3D` directly — you drop one into a 2D scene with a `WorldView3D` entity.

## `WorldView3D` — the 2D/3D bridge

[`WorldView3D`](../api/Class.WorldView3D.md) is an `Entity2D` that owns and ticks a `Scene3D` and draws it at a viewport within the 2D scene. This lets HUD and effect entities layer around the 3D view by `zIndex`.

```ts
const world3d = new WorldView3D({
  world: new Scene3D({ camera, subpixel: true, clearColor: Color.fromHex("#000") }),
  viewport: new Rectangle(0, 0, canvasWidth, canvasHeight),
  zIndex: 0,
})
scene.add(world3d)

// HUD on top:
const hud = new Hud({ zIndex: 10 })
scene.add(hud)
```

Subclass it and override `viewportFor(canvas)` if you need a dynamic viewport (e.g. the y-squash 0.5 cell aspect used by `git-3d`).

## `SceneManager`

A [`SceneManager`](../api/Class.SceneManager.md) is a stack of scenes with `push`/`pop`/`replace`. The top scene (`current`) is updated and drawn each frame. `<Scene>` pushes on mount and pops on cleanup.

For title/game/over/win style switching, use `<SceneSwitch>`:

```tsx
<SceneSwitch active={state.screen}>
  {{
    title: () => <TitleScreen />,
    game:  () => <GameScreen />,
    over:  () => <GameOverScreen />,
    win:   () => <WinScreen />,
  }}
</SceneSwitch>
```

Only the child matching `active()` is mounted.

## Collision

Entities opt into collision with two fields:

- `collisionLayer` — which layer this entity is on (a bit from [`CollisionLayer`](../api/Variable.CollisionLayer.md)).
- `collisionMask` — which layers this entity collides *with* (a bitmask).
- `onCollide(other)` — called when an overlap is detected.

Run [`detectCollisions(scene)`](../api/Function.detectCollisions.md) once per fixed step (after movement) to dispatch `onCollide` for all overlapping pairs:

```tsx
useFixedUpdate(() => {
  // …move all entities…
  detectCollisions(scene)
})
```

For rich resolution (stomp vs. hit vs. star), keep that logic in the entity's `onCollide` — it's game logic, not a layer test. See `examples/overworld/scene/Player.ts`.

For swept-AABB tile collision, use [`moveAndCollide`](../api/Function.moveAndCollide.md) or [`KinematicBody2D`](../api/Class.KinematicBody2D.md). See [the physics module](../modules/physics.md).

## `rune add entity` / `rune add scene`

The CLI generates convention-following stubs:

- `rune add entity Player` → writes `scene/Player.ts` with a class extending `Entity2D`, an `*Options` interface, and `update`/`draw` stubs.
- `rune add scene Title` → writes `scene/Title.tsx` with a `<Scene>` + `<SceneRenderer>` component.

See [`rune add`](../cli/add.md).

## See also

- [`Entity` class](../api/Class.Entity.md)
- [`Entity2D` class](../api/Class.Entity2D.md)
- [`Entity3D` class](../api/Class.Entity3D.md)
- [`SceneInstance` class](../api/Class.SceneInstance.md)
- [`Scene3D` class](../api/Class.Scene3D.md)
- [`WorldView3D` class](../api/Class.WorldView3D.md)
- [`SceneManager` class](../api/Class.SceneManager.md)
- [Canvas & rendering](canvas-and-rendering.md)
- [Conventions](../conventions.md)
