# ai

Pathfinding, flow fields, navigation meshes, state machines, behaviour trees, and steering behaviours — the decision and movement layer for agents. Pick the tool that fits the problem: a state machine for animation-driven behaviour, a behaviour tree for composable multi-step goals, steering for flock movement, A*/flow fields for grid navigation.

## Overview

Grid navigation offers two complementary tools. [`findPath`](../api/Function.findPath.md) is A* over grid cells with a choice of [`Heuristic`](../api/Enumeration.Heuristic.md); [`FlowField`](../api/Class.FlowField.md) computes a grid of cost-to-goal and steepest-descent directions so many agents can share one field instead of each running A*. [`NavMesh`](../api/Class.NavMesh.md) is the polygon alternative for continuous worlds — funnel-string-pulled paths between any two walkable points across convex [`NavPolygon`](../api/TypeAlias.NavPolygon.md)s. [`Blackboard`](../api/Class.Blackboard.md) is the typed key/value store shared between agents for coordination.

Decision-making has two layers. [`StateMachine`](../api/Class.StateMachine.md) is a string-keyed state machine with [`StateDefinition`](../api/Interface.StateDefinition.md) callbacks — pair it with [`playClipForState`](../api/Function.playClipForState.md) (in [scene](scene.md)) so each state drives an [`AnimatedSprite`](../api/Class.AnimatedSprite.md) clip. The behaviour tree is the composable counterpart: [`Sequence`](../api/Class.Sequence.md) (do A then B), [`Selector`](../api/Class.Selector.md) (try A, else B), [`Parallel`](../api/Class.Parallel.md) (run children each tick, resolve per [`ParallelPolicy`](../api/Enumeration.ParallelPolicy.md)), plus decorators [`Inverter`](../api/Class.Inverter.md) / [`Repeater`](../api/Class.Repeater.md) and leaves [`Action`](../api/Class.Action.md) / [`Condition`](../api/Class.Condition.md). Nodes return a [`BehaviorStatus`](../api/Enumeration.BehaviorStatus.md) each tick and progress one tick at a time.

Steering covers both arrival and flocks. [`seek`](../api/Function.seek.md) / [`flee`](../api/Function.flee.md) / [`arrive`](../api/Function.arrive.md) / [`pursue`](../api/Function.pursue.md) are single-agent; [`Wander`](../api/Class.Wander.md) holds the drifting target angle for smooth roaming; [`separation`](../api/Function.separation.md) / [`alignment`](../api/Function.alignment.md) / [`cohesion`](../api/Function.cohesion.md) are the Reynolds flock rules over a [`Boid`](../api/Interface.Boid.md) shape.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `pathfind.ts` | [`findPath`](../api/Function.findPath.md), [`Heuristic`](../api/Enumeration.Heuristic.md), [`PathfindOptions`](../api/Interface.PathfindOptions.md) | A* over grid cells. |
| `flowField.ts` | [`FlowField`](../api/Class.FlowField.md), [`FlowFieldOptions`](../api/Interface.FlowFieldOptions.md) | Cost-to-goal + descent directions. |
| `navmesh.ts` | [`NavMesh`](../api/Class.NavMesh.md), [`NavPolygon`](../api/TypeAlias.NavPolygon.md) | Polygon navmesh with funnel paths. |
| `stateMachine.ts` | [`StateMachine`](../api/Class.StateMachine.md), [`StateDefinition`](../api/Interface.StateDefinition.md) | String-keyed state machine. |
| `behaviorTree.ts` | [`Sequence`](../api/Class.Sequence.md), [`Selector`](../api/Class.Selector.md), [`Parallel`](../api/Class.Parallel.md), [`Inverter`](../api/Class.Inverter.md), [`Repeater`](../api/Class.Repeater.md), [`Action`](../api/Class.Action.md), [`Condition`](../api/Class.Condition.md), [`BehaviorStatus`](../api/Enumeration.BehaviorStatus.md) | Composable behaviour tree. |
| `steering.ts` | [`seek`](../api/Function.seek.md), [`flee`](../api/Function.flee.md), [`arrive`](../api/Function.arrive.md), [`pursue`](../api/Function.pursue.md), [`Wander`](../api/Class.Wander.md), [`separation`](../api/Function.separation.md), [`alignment`](../api/Function.alignment.md), [`cohesion`](../api/Function.cohesion.md) | Single-agent + flock steering. |
| `blackboard.ts` | [`Blackboard`](../api/Class.Blackboard.md) | Typed shared key/value store. |

## Key types

### Pathfinding & flow fields
- [`findPath`](../api/Function.findPath.md) — A* path of grid cells from `start` to `goal`.
- [`PathfindOptions`](../api/Interface.PathfindOptions.md) / [`Heuristic`](../api/Enumeration.Heuristic.md) — Options + distance heuristic (`Manhattan`, `Euclidean`, …).
- [`FlowField`](../api/Class.FlowField.md) — Grid of cost-to-goal and steepest-descent directions from `compute`.
- [`FlowFieldOptions`](../api/Interface.FlowFieldOptions.md) — Cost grid + goal + options.

### Navigation mesh
- [`NavMesh`](../api/Class.NavMesh.md) — Polygon navmesh; funnel-string-pulled paths between walkable points.
- [`NavPolygon`](../api/TypeAlias.NavPolygon.md) — Convex polygon as a vertex list.

### State machines
- [`StateMachine`](../api/Class.StateMachine.md) — State machine keyed by string state names.
- [`StateDefinition`](../api/Interface.StateDefinition.md) — `onEnter` / `onUpdate` / `onExit` callbacks for one state.

### Behaviour trees
- [`BehaviorNode`](../api/Interface.BehaviorNode.md) — A node that progresses one tick at a time.
- [`BehaviorStatus`](../api/Enumeration.BehaviorStatus.md) — `Success` / `Failure` / `Running`.
- [`Sequence`](../api/Class.Sequence.md) / [`Selector`](../api/Class.Selector.md) / [`Parallel`](../api/Class.Parallel.md) — Composites (all / first-success / parallel-with-policy).
- [`Inverter`](../api/Class.Inverter.md) / [`Repeater`](../api/Class.Repeater.md) — Decorators (flip status / re-run).
- [`Action`](../api/Class.Action.md) / [`Condition`](../api/Class.Condition.md) — Leaves (run a function / guard predicate).
- [`ParallelPolicy`](../api/Enumeration.ParallelPolicy.md) — How `Parallel` resolves children's statuses.

### Steering
- [`Boid`](../api/Interface.Boid.md) — Lightweight agent shape used by the flock rules.
- [`seek`](../api/Function.seek.md) / [`flee`](../api/Function.flee.md) — Steer toward / away from a target at full speed.
- [`arrive`](../api/Function.arrive.md) — Seek with speed ramp inside `slowRadius` (eases to a stop).
- [`pursue`](../api/Function.pursue.md) — Seek where the target will be (leads a moving quarry).
- [`Wander`](../api/Class.Wander.md) — Drifting target angle for smooth random roaming.
- [`separation`](../api/Function.separation.md) / [`alignment`](../api/Function.alignment.md) / [`cohesion`](../api/Function.cohesion.md) — Reynolds flock rules (avoid crowding / match heading / pull together).

### Blackboard
- [`Blackboard`](../api/Class.Blackboard.md) — Typed key/value store shared between agents for coordination.

## Usage

```ts
import { StateMachine, playClipForState, findPath, Heuristic } from "@ahokinson/rune"

// State machine drives animation clips.
const ai = new StateMachine<"idle" | "patrol" | "chase">({ initial: "idle" })
ai.define({ idle: { onUpdate: () => ai.transition("patrol") } })
playClipForState(ai, sprite, { idle: "idle", patrol: "walk", chase: "run" })

// A* over a grid of solid/empty cells.
const path = findPath({
  start: { column: 1, row: 1 },
  goal: { column: 10, row: 8 },
  isWalkable: (c, r) => !tiles.isSolid(c, r),
  heuristic: Heuristic.Manhattan,
})
```

## See also

- [scene](scene.md) — [`playClipForState`](../api/Function.playClipForState.md) ties a state machine to an [`AnimatedSprite`](../api/Class.AnimatedSprite.md).
- [physics](physics.md) — [`castRay`](../api/Function.castRay.md) / [`lineOfSight`](../api/Function.lineOfSight.md) for vision checks; [`SpatialGrid`](../api/Class.SpatialGrid.md) for neighbour queries.
- [Conventions](../conventions.md) — drive animation from a `StateMachine` with `playClipForState`.
