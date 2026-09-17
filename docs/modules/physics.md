# physics

Collision, bodies, constraints, and triggers. Covers overlap detection, swept-AABB tile collision, kinematic and rigid bodies (2D and 3D), a Verlet constraint solver for cloth/ropes, grid raycasts and line-of-sight, and bitmask collision layers. Use this for everything that moves and reacts to the world.

## Overview

`physics/` offers several layered approaches so you pick the right fidelity. For **simple overlap** (pickups, triggers) give entities a `collisionLayer`/`collisionMask` and run [`detectCollisions`](../api/Function.detectCollisions.md) (in [scene](scene.md)) or [`updateTriggers`](../api/Function.updateTriggers.md) once per fixed step. For **tile-based platformer movement** use [`KinematicBody2D`](../api/Class.KinematicBody2D.md) or the lower-level [`moveAndCollide`](../api/Function.moveAndCollide.md) — both resolve each axis independently with the swept-AABB test so a body stops flush against terrain instead of tunnelling at speed. For **dynamic response** use [`RigidBody2D`](../api/Class.RigidBody2D.md) (translational AABB with gravity/restitution/friction) or [`RigidBody3D`](../api/Class.RigidBody3D.md) (impulse-based against a floor plane).

Collision layers are a 32-bit bitmask scheme: a [`CollisionLayer`](../api/Variable.CollisionLayer.md) is a single bit, a [`LayerMask`](../api/TypeAlias.LayerMask.md) ORs several, and the [`CollisionLayer`](../api/Variable.CollisionLayer.md) helper (`bit`, `mask`, `matches`) builds and tests them — this is what trigger volumes and broad-phase filters use to cheaply decide who interacts. Broad phase is a uniform hash grid: [`SpatialGrid`](../api/Class.SpatialGrid.md) buckets [`Entity2D`](../api/Class.Entity2D.md)s by bounds, [`SpatialGrid3D`](../api/Class.SpatialGrid3D.md) buckets by an explicit [`AABB3`](../api/Interface.AABB3.md). Grid queries — [`castRay`](../api/Function.castRay.md) (DDA), [`lineOfSight`](../api/Function.lineOfSight.md) (Bresenham), [`cellAt`](../api/Function.cellAt.md) — work against a `CellPredicate`.

The Verlet subsystem is separate: [`ConstraintSolver`](../api/Class.ConstraintSolver.md) integrates a network of [`PointMass`](../api/Class.PointMass.md)es and satisfies [`Constraint`](../api/Interface.Constraint.md)s over several relaxation passes per step — [`DistanceConstraint`](../api/Class.DistanceConstraint.md) (rigid/springy rods) and [`PinConstraint`](../api/Class.PinConstraint.md) (moving attachment points) ship built-in. 3D bodies rest on colliders built by [`colliderFor`](../api/Function.colliderFor.md) (box, sphere, or sampled-mesh silhouettes).

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `layers.ts` | [`CollisionLayer`](../api/Variable.CollisionLayer.md), [`LayerMask`](../api/TypeAlias.LayerMask.md) | 32-bit bitmask layers + helpers. |
| `boundingBox.ts` | [`intersects`](../api/Function.intersects.md), [`contains`](../api/Function.contains.md), [`sweep`](../api/Function.sweep.md), [`SweepHit`](../api/Interface.SweepHit.md) | Rectangle overlap + swept-AABB test. |
| `moveAndCollide.ts` | [`moveAndCollide`](../api/Function.moveAndCollide.md), [`CollisionResult`](../api/Interface.CollisionResult.md) | Swept-AABB tile collision for a moving box. |
| `kinematicBody2d.ts` | [`KinematicBody2D`](../api/Class.KinematicBody2D.md) | Kinematic platformer body (gravity, friction, coyote/buffered jump). |
| `rigidBody2d.ts` | [`RigidBody2D`](../api/Class.RigidBody2D.md) | Translational 2D rigid body (AABB). |
| `rigidBody.ts` | [`RigidBody3D`](../api/Class.RigidBody3D.md) | Impulse-based 3D rigid body against a floor plane. |
| `collider.ts` | [`colliderFor`](../api/Function.colliderFor.md), [`sphereCollider`](../api/Function.sphereCollider.md), [`boxCollider`](../api/Function.boxCollider.md), [`meshCollider`](../api/Function.meshCollider.md), [`meshBounds`](../api/Function.meshBounds.md), [`ColliderKind`](../api/Enumeration.ColliderKind.md), [`Collider`](../api/Interface.Collider.md) | 3D collision geometry + inertia. |
| `constraint.ts` | [`ConstraintSolver`](../api/Class.ConstraintSolver.md), [`PointMass`](../api/Class.PointMass.md), [`DistanceConstraint`](../api/Class.DistanceConstraint.md), [`PinConstraint`](../api/Class.PinConstraint.md) | Verlet particle + constraint solver. |
| `spatialGrid.ts` | [`SpatialGrid`](../api/Class.SpatialGrid.md) | Uniform 2D hash grid of `Entity2D`s. |
| `spatialGrid3d.ts` | [`SpatialGrid3D`](../api/Class.SpatialGrid3D.md), [`AABB3`](../api/Interface.AABB3.md) | Uniform 3D hash grid. |
| `raycast.ts` | [`castRay`](../api/Function.castRay.md), [`RaycastHit`](../api/Interface.RaycastHit.md) | DDA raycast through a cell grid. |
| `grid.ts` | [`cellAt`](../api/Function.cellAt.md), [`lineOfSight`](../api/Function.lineOfSight.md) | World→cell mapping + Bresenham LOS. |
| `triggers.ts` | [`TriggerVolume`](../api/Class.TriggerVolume.md), [`updateTriggers`](../api/Function.updateTriggers.md) | Overlap enter/stay/exit trigger entity. |

## Key types

### Collision layers & broad phase
- [`CollisionLayer`](../api/Variable.CollisionLayer.md) — Helpers (`bit`, `mask`, `matches`) for 32-bit layers (type: [`CollisionLayer`](../api/TypeAlias.CollisionLayer.md)).
- [`LayerMask`](../api/TypeAlias.LayerMask.md) — A 32-bit mask OR-ing any number of layers.
- [`SpatialGrid`](../api/Class.SpatialGrid.md) / [`SpatialGrid3D`](../api/Class.SpatialGrid3D.md) — Uniform hash grids for broad-phase bucketing.
- [`AABB3`](../api/Interface.AABB3.md) — 3D axis-aligned bounding box (min/max form).

### 2D kinematic & rigid bodies
- [`KinematicBody2D`](../api/Class.KinematicBody2D.md) — Kinematic platformer body; feed it input each fixed step and react to the result.
- [`KinematicInput`](../api/Interface.KinematicInput.md) / [`KinematicBody2DOptions`](../api/Interface.KinematicBody2DOptions.md) — Per-step input + construction options.
- [`RigidBody2D`](../api/Class.RigidBody2D.md) — Translational 2D rigid body with gravity, restitution, friction.
- [`moveAndCollide`](../api/Function.moveAndCollide.md) — Lower-level swept-AABB against axis-aligned obstacles; returns a [`CollisionResult`](../api/Interface.CollisionResult.md).
- [`intersects`](../api/Function.intersects.md) / [`contains`](../api/Function.contains.md) / [`sweep`](../api/Function.sweep.md) — Rectangle overlap/containment + the earliest-obstacle sweep test ([`SweepHit`](../api/Interface.SweepHit.md)).

### 3D rigid body & colliders
- [`RigidBody3D`](../api/Class.RigidBody3D.md) — Impulse-based 3D body resolved against a floor plane.
- [`RigidBody3DOptions`](../api/Interface.RigidBody3DOptions.md) — Construction options.
- [`colliderFor`](../api/Function.colliderFor.md) — Build a collider of a given [`ColliderKind`](../api/Enumeration.ColliderKind.md) for a mesh.
- [`boxCollider`](../api/Function.boxCollider.md) / [`sphereCollider`](../api/Function.sphereCollider.md) / [`meshCollider`](../api/Function.meshCollider.md) — Specific collider builders.
- [`meshBounds`](../api/Function.meshBounds.md) / [`boxInverseInertia`](../api/Function.boxInverseInertia.md) — Half-extents + bounding radius / box inertia tensor.
- [`Collider`](../api/Interface.Collider.md) — Precomputed collision geometry (contact points + inverse inertia).

### Constraints (Verlet)
- [`ConstraintSolver`](../api/Class.ConstraintSolver.md) — Integrates particles then satisfies constraints over relaxation passes.
- [`PointMass`](../api/Class.PointMass.md) — Verlet point (position + previous position → implied velocity).
- [`DistanceConstraint`](../api/Class.DistanceConstraint.md) / [`PinConstraint`](../api/Class.PinConstraint.md) — Hold-two-at-rest / pin-to-moving-anchor constraints.
- [`Constraint`](../api/Interface.Constraint.md) / [`ConstraintSolverOptions`](../api/Interface.ConstraintSolverOptions.md) — Constraint interface + solver config.

### Grid queries & triggers
- [`castRay`](../api/Function.castRay.md) — DDA raycast through a cell grid ([`RaycastHit`](../api/Interface.RaycastHit.md)).
- [`lineOfSight`](../api/Function.lineOfSight.md) / [`cellAt`](../api/Function.cellAt.md) — Bresenham LOS / world→cell mapping.
- [`TriggerVolume`](../api/Class.TriggerVolume.md) — `Entity2D` reporting enter/stay/exit overlaps against matching layers.
- [`updateTriggers`](../api/Function.updateTriggers.md) — Evaluate every `TriggerVolume` against every other enabled entity each step.
- [`GridCell`](../api/Interface.GridCell.md) / [`CellPredicate`](../api/TypeAlias.CellPredicate.md) — Cell coordinate + blocker predicate.

## Usage

```ts
import { CollisionLayer, KinematicBody2D, moveAndCollide, type KinematicInput } from "@ahokinson/rune"

// Tile platformer: feed input each fixed step, react to the result.
const body = new KinematicBody2D({ gravity: 0.002, jumpSpeed: 0.6, moveSpeed: 0.12 })

useFixedUpdate((delta) => {
  const input: KinematicInput = { move: controls.isDown("move") ? 1 : 0, jump: controls.wasPressed("jump") }
  const result = body.step(player.box, input, delta, solidTiles)
  if (result.hitX) player.velocityX = 0
  if (result.hitCeiling) player.bonkHead()
})
```

```ts
// Overlap layers for a pickup.
const PICKUP = CollisionLayer.bit(0)
const PLAYER = CollisionLayer.bit(1)

class Coin extends Entity2D {
  collisionLayer = PICKUP
}
class Player extends Entity2D {
  collisionMask = CollisionLayer.mask(PICKUP)
  onCollide(other) { if (other instanceof Coin) this.collect(other) }
}
// once per fixed step, after movement: detectCollisions(scene)
```

## See also

- [Conventions](../conventions.md) — the collision and movement conventions.
- [scene](scene.md) — [`detectCollisions`](../api/Function.detectCollisions.md), entity `collisionLayer`/`collisionMask`/`onCollide`.
- [Scenes & entities](../concepts/scenes-and-entities.md) — the collision section.
- [ai](ai.md) — [`castRay`](../api/Function.castRay.md) / [`lineOfSight`](../api/Function.lineOfSight.md) power line-of-sight checks; [light](light.md) shares [`CellPredicate`](../api/TypeAlias.CellPredicate.md).
