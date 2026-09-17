# tomb

A DOOM-style first-person dungeon crawler. You walk tile-grid levels with height variation, textured walls, and baked lighting; hitscan-pistol imps that pathfind toward you when they have line of sight; pickups, decorations, and a level-exit that advances the campaign. Title → game → game-over → win screens swap via a scene switch.

## Run it

```sh
# From the repo root:
bun run example:tomb

# Or from the example directory:
cd examples/tomb
bun run dev
```

## What it showcases

The raycast FPS pipeline. A [`RaycastProjection`](../api/Class.RaycastProjection.md) camera is built once with [`createFirstPersonCamera`](../api/Function.createFirstPersonCamera.md) and re-synced to the player each frame with [`syncFirstPersonCamera`](../api/Function.syncFirstPersonCamera.md). `Level` ([`Entity2D`](../api/Class.Entity2D.md)) drives the whole render in `draw()`: it clears a [`ColumnDepthBuffer`](../api/Class.ColumnDepthBuffer.md), runs [`renderGridSurfaces`](../api/Function.renderGridSurfaces.md) for floors/ceilings/walls, then [`renderBillboards`](../api/Function.renderBillboards.md) for enemies, pickups, decorations, and the exit. The geometry seam is the engine's [`GridSurfaces`](../api/Interface.GridSurfaces.md) (a `TileMap<TombCell>` adapter) and the look is a custom [`SurfaceShader`](../api/Interface.SurfaceShader.md) — `TombSurfaceShader` writes each `wallPixel`/`floorPixel`/`ceilingPixel` with procedural colour, distance fog, side shading, and a baked light grid add. That is the contract any raycast game implements: hand the engine surfaces + a shader + a depth buffer, get a shaded view back.

Enemy AI. Each `Enemy` runs a [`StateMachine`](../api/Class.StateMachine.md) (`idle`/`walk`/`attack`/`die`) with [`lineOfSight`](../api/Function.lineOfSight.md) as the visibility gate and [`findPath`](../api/Function.findPath.md) (with `Heuristic.Chebyshev` and diagonal moves) for pursuit, re-pathed on a cooldown and constrained to its home floor. The player's pistol is a [`castRay`](../api/Function.castRay.md) hitscan throttled by a [`Cooldown`](../api/Class.Cooldown.md); the fire callback ray-tests enemies in screen space and spawns blood [`Particles`](../api/Class.Particles.md) at the hit. Static lighting is a game-side baked light grid (`game/render/lightGrid.ts`) — the engine's [`LightGrid`](../api/Class.LightGrid.md) and [`computeFieldOfView`](../api/Function.computeFieldOfView.md) are the general-purpose equivalents for the same job.

Structure and feel. [`SceneSwitch`](../api/Function.SceneSwitch.md) swaps the title/game/over/win [`Scene`](../api/Function.Scene.md)s; each game level mounts a fresh `GameScreen` that wires entities into the scene and runs [`updateTriggers`](../api/Function.updateTriggers.md) each frame so the exit's [`TriggerVolume`](../api/Class.TriggerVolume.md) fires `onOverlapEnter` when the player steps on it. All art/audio/data is loaded once through an [`AssetPack`](../api/Class.AssetPack.md) (`AssetPack.mount` over the `assets/` directory) and played through a [`SystemAudioContext`](../api/Class.SystemAudioContext.md). Damage feedback is a custom `DamageFlash` entity (a red border whose intensity tracks the hit and low health) plus a `CameraShake`; muzzle flash and blood are [`Particles`](../api/Class.Particles.md).

| Engine feature | Where in the example |
| --- | --- |
| [`createFirstPersonCamera`](../api/Function.createFirstPersonCamera.md) / [`syncFirstPersonCamera`](../api/Function.syncFirstPersonCamera.md) | `components/GameScreen.tsx` — builds the `RaycastProjection` camera, re-syncs it to the player each frame. |
| [`renderGridSurfaces`](../api/Function.renderGridSurfaces.md) | `game/Level.ts` — renders floor/ceiling/wall columns through the surface + shader + depth buffer. |
| [`renderBillboards`](../api/Function.renderBillboards.md) | `game/Level.ts` — draws enemies, pickups, decorations, and the exit as depth-tested billboards. |
| [`ColumnDepthBuffer`](../api/Class.ColumnDepthBuffer.md) | `game/Level.ts` — per-column raycaster depth buffer (`writeIfCloser`, smaller = nearer). |
| [`SurfaceShader`](../api/Interface.SurfaceShader.md) / [`GridSurfaces`](../api/Interface.GridSurfaces.md) | `game/render/surfaces.ts` — `TombSurfaceShader` (procedural colour + fog + light) and `TombSurfaces` (the `TileMap` adapter). |
| [`StateMachine`](../api/Class.StateMachine.md) | `game/Enemy.ts` — the `idle`/`walk`/`attack`/`die` brain driving animation and pursuit. |
| [`findPath`](../api/Function.findPath.md) / [`lineOfSight`](../api/Function.lineOfSight.md) | `game/Enemy.ts` — A* pursuit (diagonal, `Heuristic.Chebyshev`) gated by LOS to the player. |
| [`castRay`](../api/Function.castRay.md) / [`Cooldown`](../api/Class.Cooldown.md) | `game/Player.ts` — hitscan pistol + fire-rate cooldown. |
| [`Particles`](../api/Class.Particles.md) | `game/particles.ts` — muzzle-flash sparks and blood spray. |
| [`AssetPack`](../api/Class.AssetPack.md) | `assets/manifest.ts` — `AssetPack.mount` over levels/enemies/pickups/weapons/decorations/themes. |
| [`SceneSwitch`](../api/Function.SceneSwitch.md) / [`Scene`](../api/Function.Scene.md) / [`SceneRenderer`](../api/Function.SceneRenderer.md) | `App.tsx` + `components/*Screen.tsx` — title/game/over/win scene switching. |
| [`TriggerVolume`](../api/Class.TriggerVolume.md) / [`updateTriggers`](../api/Function.updateTriggers.md) | `game/Exit.ts` + `components/GameScreen.tsx` — the level exit fires `onOverlapEnter` when the player reaches it. |
| [`SystemAudioContext`](../api/Class.SystemAudioContext.md) | `App.tsx` + `components/GameScreen.tsx` — `audio.load(...)` + `audio.play(...)` for shots/hits/pickups. |

## Key files

| File | What it demonstrates |
| --- | --- |
| `App.tsx` | Bootstrap: `Application` + `FullscreenCanvas` render-prop, `SceneSwitch` over the four screens, `DebugOverlay`. |
| `components/GameScreen.tsx` | Wires a level: camera, player, enemies/pickups/decorations, particles, HUD, damage flash, the fixed/frame update loop. |
| `game/Level.ts` | The raycast pipeline entity — `renderGridSurfaces` + `renderBillboards` + crosshair, owning the depth buffer and surface shader. |
| `game/Player.ts` | First-person controller: yaw, tile collision with step-up, vertical physics, door toggle, hitscan fire. |
| `game/Enemy.ts` | State-machine + pathfinding + LOS enemy; the `BillboardEntry` interface implementation. |
| `game/render/surfaces.ts` | The `SurfaceShader` / `GridSurfaces` contract — procedural wall/floor/ceiling shading + baked light add. |
| `assets/manifest.ts` | `AssetPack.mount` registration of every asset class. |

## See also

- [Scenes & entities](../concepts/scenes-and-entities.md) — the `Entity2D`/`Scene` model `Level` and the actors build on.
- [Assets](../concepts/assets.md) — the `AssetPack` schema, slots, and two-phase parse.
- [light](../modules/light.md) — the engine's `LightGrid` / `computeFieldOfView` / `lineOfSight`.
