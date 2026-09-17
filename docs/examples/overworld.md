# overworld

A side-scrolling platformer in the World 1-1 mould. A runner with small/big/fire power states runs and jumps across a tiled course with question blocks, bricks, pipes, coins, and a goal flag; Goombas walk off ledges and Koopas retract into kickable shells. The camera tracks the runner with smoothing and clamps at the course edges.

## Run it

```sh
# From the repo root:
bun run example:overworld

# Or from the example directory:
cd examples/overworld
bun run dev
```

## What it showcases

Kinematic platformer movement. `Player` extends [`AnimatedSpriteEntity`](../api/Class.AnimatedSpriteEntity.md) and delegates all platformer physics to a [`KinematicBody2D`](../api/Class.KinematicBody2D.md) — gravity, friction, max walk, coyote time, buffered jump, and swept-AABB tile collision all live in the engine. The entity just feeds it input each fixed step and reacts to the result: it syncs its `Rectangle` box, asks `Level.collidersNear` for the small obstacle set around it, calls `body.step(box, { move, jump }, dt, obstacles)`, and writes the resolved box back. That is the canonical [`KinematicBody2D`](../api/Class.KinematicBody2D.md) usage pattern (see `scene/Player.ts`).

Tiles and collision. The course is a [`TileMap`](../api/Class.TileMap.md) loaded from YAML with [`loadTileMap`](../api/Function.loadTileMap.md) (`level.ts`), rendered by a [`TileLayer`](../api/Class.TileLayer.md) over a [`TileSet`](../api/Class.TileSet.md) (`scene/terrain.ts`). The pipe tile is neighbour-aware through a [`TileContext`](../api/Interface.TileContext.md) appearance function (its rim only caps an exposed top); the question block is an [`animatedTile`](../api/Function.animatedTile.md) shimmering between two glyph colours; everything else is a [`fillTile`](../api/Function.fillTile.md) sprite with edge accents. [`TileMeta`](../api/Class.TileMeta.md) carries per-tile block payloads (coin / powerup / star / 1-up / multi-coin) the bonk logic consults. Pickups use the engine's overlap pass: [`detectCollisions`](../api/Function.detectCollisions.md) runs once per fixed step in `World.tsx`, a `Coin` carries a `collisionMask: PLAYER_LAYER` and collects itself in `onCollide()` — so no entity polls the player. Layers come from [`CollisionLayer`](../api/Variable.CollisionLayer.md) (`scene/layers.ts`).

Enemies and feel. A `Koopa` is the [`StateMachine`](../api/Class.StateMachine.md) + [`playClipForState`](../api/Function.playClipForState.md) reference: its `walk`/`shell`/`slide` lifecycle drives the sprite clip in lockstep, so transition methods never touch the animation directly. Enemy movement is [`moveAndCollide`](../api/Function.moveAndCollide.md) (the non-jumping sibling of the kinematic body), with walls turning a walker and ricocheting a sliding shell. Coin bob and other eased motion use [`Tween`](../api/Class.Tween.md) with [`Easing`](../api/Variable.Easing.md); sparkle/shatter/puff bursts are [`Particles`](../api/Class.Particles.md). Rich combat (stomp vs. hit vs. star, shell kicks) stays bespoke in `Player.handleEnemies` — it's game logic, not a layer test.

| Engine feature | Where in the example |
| --- | --- |
| [`KinematicBody2D`](../api/Class.KinematicBody2D.md) | `scene/Player.ts` — gravity/friction/coyote/buffered-jump/swept-tiles; the canonical user. |
| [`TileLayer`](../api/Class.TileLayer.md) / [`TileSet`](../api/Class.TileSet.md) / [`TileContext`](../api/Interface.TileContext.md) | `scene/Level.ts` + `scene/terrain.ts` — rendering, `collidersNear`, neighbour-aware pipe, bonk bounce. |
| [`loadTileMap`](../api/Function.loadTileMap.md) / [`TileMap`](../api/Class.TileMap.md) / [`TileMeta`](../api/Class.TileMeta.md) | `level.ts` — course loaded from `assets/world-1-1.yaml`; block payloads keyed by tile. |
| [`animatedTile`](../api/Function.animatedTile.md) / [`fillTile`](../api/Function.fillTile.md) | `scene/terrain.ts` — the shimmering question block and the body sprites. |
| [`detectCollisions`](../api/Function.detectCollisions.md) / [`CollisionLayer`](../api/Variable.CollisionLayer.md) | `scene/World.tsx` + `scene/Coin.ts` + `scene/layers.ts` — overlap pickups self-collect via `onCollide`. |
| [`AnimatedSpriteEntity`](../api/Class.AnimatedSpriteEntity.md) / [`playClipForState`](../api/Function.playClipForState.md) | `scene/Player.ts` + `scene/Koopa.ts` — state-driven clip selection. |
| [`moveAndCollide`](../api/Function.moveAndCollide.md) | `scene/Koopa.ts` — enemy walking/sliding with wall ricochet. |
| [`StateMachine`](../api/Class.StateMachine.md) | `scene/Koopa.ts` — the `walk`/`shell`/`slide` lifecycle. |
| [`Particles`](../api/Class.Particles.md) | `scene/World.tsx` — sparkle/shatter/puff bursts. |
| [`Tween`](../api/Class.Tween.md) / [`Easing`](../api/Variable.Easing.md) | `scene/Coin.ts` — looping yoyo bob. |

## Key files

| File | What it demonstrates |
| --- | --- |
| `App.tsx` | Bootstrap at 60 tps. |
| `scene/World.tsx` | `detectCollisions` in the fixed step, camera follow in `useUpdate`, hazard resolution, entity wiring. |
| `scene/Player.ts` | The canonical `KinematicBody2D` user — input → `step` → react, power states, bespoke enemy combat. |
| `scene/Level.ts` | `TileLayer` + colliders + bonk rules + parallax backdrop/flag/castle. |
| `scene/Koopa.ts` | `playClipForState` reference — `StateMachine` + `moveAndCollide` + shell ricochet. |
| `scene/Coin.ts` | Overlap collision — `collisionMask` + `onCollide` + `Tween` bob. |
| `scene/terrain.ts` | `TileSet` with neighbour-aware pipe (`TileContext`) and `animatedTile` question block. |
| `level.ts` | `loadTileMap` from YAML + marker/content extraction. |

## See also

- [Scenes & entities](../concepts/scenes-and-entities.md) — the entity model `Player`/`Koopa`/`Coin` build on.
- [physics](../modules/physics.md) — `KinematicBody2D`, `moveAndCollide`, `detectCollisions`, collision layers.
- [world](../modules/world.md) — tile maps, authored tile documents, per-cell metadata.
