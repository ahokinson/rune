# git-3d

A 3D git history visualizer in the Gource mould. Run it inside a repository and it streams the commit log oldest-first, growing a tree whose branches are directories and whose leaves are files (coloured by extension); each commit blooms the files it touched and puffs author-coloured pollen, while deletions drop leaves. A replay clock scrubs through git time at a adjustable days/sec rate.

## Run it

```sh
# From the repo root:
bun run example:git-3d

# Or from the example directory:
cd examples/git-3d
bun run dev
```

The visualizer reads the repository containing the current directory (or `GIT3D_REPO` / `GIT3D_MAX_COMMITS` if set), so run it from inside a git work tree.

## What it showcases

The 3D scene and the y-squash bridge. `TreeView.tsx` builds a [`Scene3D`](../api/Class.Scene3D.md) with `subpixel: true`, a [`Camera3D`](../api/Class.Camera3D.md) + [`PerspectiveProjector3D`](../api/Class.PerspectiveProjector3D.md), and composites it into the 2D scene through a **subclass** of [`WorldView3D`](../api/Class.WorldView3D.md) that overrides `viewportFor` to squash `aspectY` to 0.5 — the cell-space equivalent of the rasterizer viewport, so the pollen projects onto the same tree as the lit branches. Branch instancing is all [`Matrix4`](../api/Class.Matrix4.md)/[`Quaternion`](../api/Class.Quaternion.md): one unit cylinder is reused for every branch, oriented along its growth direction (`Quaternion.setFromDirection`) and scaled to its length/thickness by `Matrix4.composeQuaternionInto` (`scene/trunk.ts`).

Lit branches and pollen. `Grove` is an [`Entity3D`](../api/Class.Entity3D.md) that draws the tree each frame: a [`ShadowMap`](../api/Class.ShadowMap.md) depth pass from the key light, then the ground and every branch tube through [`renderMesh`](../api/Function.renderMesh.md) with a [`LitMeshShader`](../api/Class.LitMeshShader.md) (bark colour mixed by depth, shadow lookup wired to the shadow map). Branch/leaf counts are bounded by a budget so a huge repo costs a bounded amount per frame (the rest are sampled out). Leaves/blossoms are projected points — `camera.projectInto` + `canvas.setCell`, coloured by file extension and glowing while a commit's heat fades. Pollen is a [`Particles3D`](../api/Class.Particles3D.md) drifting up off blossoms in the committing author's accent colour. The camera eases around the tree's growing centroid at a distance that frames the whole crown; turntable control is [`OrbitControl`](../api/Class.OrbitControl.md).

The replay and git streaming. `Tree` (`scene/Tree.ts`) is the engine-agnostic model: directories are branches, files are leaves, geometry is deterministic from the hierarchy (recomputed only when the file set changes) so the tree grows in place instead of jittering. `Replay` advances a clock across commit timestamps and applies each commit as its moment arrives — `kill` for deletions, `touch` for adds/edits — so history plays forward; commits are fed in oldest-first as they stream, so playback starts on the first commit instead of waiting for the whole history. That streaming is `Bun.spawn` plumbing (`git/log.ts`): `git rev-list --reverse` enumerates hashes and pipes them into `git log --stdin --no-walk --name-status` so per-commit diffs are computed lazily and parsed line-at-a-time as they arrive. The custom cylinder geometry lives in `scene/cylinder.ts`; file-type and author colours in `palette.ts`.

| Engine feature | Where in the example |
| --- | --- |
| [`Camera3D`](../api/Class.Camera3D.md) / [`PerspectiveProjector3D`](../api/Class.PerspectiveProjector3D.md) / [`Scene3D`](../api/Class.Scene3D.md) | `scene/TreeView.tsx` — the subpixel 3D world + eased framing camera. |
| [`WorldView3D`](../api/Class.WorldView3D.md) | `scene/TreeView.tsx` — `TreeWorldView` subclasses it to override `viewportFor` for the 0.5 y-squash. |
| [`renderMesh`](../api/Function.renderMesh.md) / [`LitMeshShader`](../api/Class.LitMeshShader.md) / [`ShadowMap`](../api/Class.ShadowMap.md) | `scene/Grove.ts` — lit, shadowed branch tubes + ground into the shared target. |
| [`Matrix4`](../api/Class.Matrix4.md) / [`Quaternion`](../api/Class.Quaternion.md) | `scene/trunk.ts` + `scene/Grove.ts` — per-branch cylinder instancing (`setFromDirection` + `composeQuaternionInto`). |
| [`Particles3D`](../api/Class.Particles3D.md) | `scene/TreeView.tsx` — author-coloured pollen drifting up off blossoms. |
| [`OrbitControl`](../api/Class.OrbitControl.md) | `scene/TreeView.tsx` — drag yaw/pitch + auto-spin. |
| [`Entity3D`](../api/Class.Entity3D.md) / [`Draw3DContext`](../api/Interface.Draw3DContext.md) | `scene/Grove.ts` — the tree-drawing entity + its draw context. |
| [`Vector3`](../api/Class.Vector3.md) / [`Color`](../api/Class.Color.md) | `scene/Tree.ts` + `palette.ts` — tree geometry scratch and the extension/author palette. |
| [`useFixedUpdate`](../api/Function.useFixedUpdate.md) | `scene/TreeView.tsx` — replay toggles + orbit + camera update on the fixed step. |

## Key files

| File | What it demonstrates |
| --- | --- |
| `App.tsx` | Bootstrap at 60 tps. |
| `scene/TreeView.tsx` | The orchestrator: 3D scene, `WorldView3D` subclass, pollen, orbit, replay wiring, git streaming kickoff, HUD model. |
| `scene/Tree.ts` | The engine-agnostic tree model — branch/leaf geometry, deterministic layout, growth/heat/life animation. |
| `scene/Grove.ts` | The `Entity3D` renderer — branch instancing + shadowed lit tubes + projected leaf points. |
| `scene/Replay.ts` | The replay clock — days/sec scrubbing, commit application, restart. |
| `git/log.ts` | `Bun.spawn` `rev-list | log` streaming + line-at-a-time parser. |
| `palette.ts` | File-extension colours, stable per-author colours, district tints. |

## See also

- [Scenes & entities](../concepts/scenes-and-entities.md) — `Scene3D`, `WorldView3D`, `Entity3D`, the 3D-in-2D bridge.
- [geom](../modules/geom.md) — 3D cameras, projectors, mesh builders, `Matrix4`/`Quaternion`.
- [Application & loop](../concepts/application-and-loop.md) — the fixed step where replay/orbit input is read.
