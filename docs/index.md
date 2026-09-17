# rune — documentation

A small TUI game engine built on [OpenTUI](https://github.com/sst/opentui) and
[SolidJS](https://www.solidjs.com/). Games render to the terminal: sprites,
raycast and 3D projection, collision, input, audio, particles, and a Solid
component layer that ties a scene to a fixed-timestep update loop.

```sh
bunx rune new my-game          # scaffold a project from the starter template
cd my-game
bun install
bunx rune dev                  # run from source, watching for changes
bunx rune add entity Player    # generate a new entity (or: add scene Title)
bunx rune preview              # inspect a game's files/assets without running it
bunx rune inspect              # attach to a running game and inspect live state
bunx rune build                # compile a standalone binary (or --bundle → dist/main.js)
```

## Start here

- [Getting started](getting-started.md) — install, scaffold your first game, run the CLI.
- [Architecture](architecture.md) — the Solid layer, the fixed-timestep loop, the render pipeline, and the package layout.
- [Conventions](conventions.md) — the style guide every rune codebase follows.

## Concepts

Cross-cutting how-tos that span modules.

- [Application & loop](concepts/application-and-loop.md) — `<Application>`, the fixed step vs. the frame step, `renderAlpha`, pause/quit.
- [Canvas & rendering](concepts/canvas-and-rendering.md) — `<Canvas>`, `<FullscreenCanvas>`, `<SceneRenderer>`, the draw order.
- [Scenes & entities](concepts/scenes-and-entities.md) — the `Entity`/`Entity2D`/`Entity3D` model, `Scene`/`Scene3D`, `WorldView3D`, the options-object convention.
- [Input](concepts/input.md) — keyboard/mouse dual edge buffers, `InputPhase`, action mapping, `useInput`/`useActions`.
- [Gamepad](concepts/gamepad.md) — controller state model, `pollWebGamepads`, `"gamepad:"` action bindings, analog axes.
- [Audio](concepts/audio.md) — `AudioContext` backends, the software synth, the mixer, spatial audio.
- [Assets](concepts/assets.md) — `AssetPack`, the YAML schema, slots, refs, the two-phase parse.
- [Inspection](concepts/inspection.md) — `rune inspect` and `rune preview`, the wire protocol, the snapshot shape, the edit model.

## Modules

One overview page per engine module, each linking into the generated API reference.

- [math](modules/math.md) — vectors, scalars, noise, easing, random, Poisson disk.
- [geom](modules/geom.md) — 3D cameras, projections, sphere math, mesh builders.
- [draw](modules/draw.md) — canvas, color, sprites, shapes, braille, autotiling, tilesets.
- [scene](modules/scene.md) — the entity model, scenes, the 2D/3D bridge.
- [core](modules/core.md) — loop, scheduler, events, timers, pooling.
- [physics](modules/physics.md) — collision, rigid bodies, constraints, triggers.
- [input](modules/input.md) — keyboard, mouse, action mapping, input phases.
- [audio](modules/audio.md) — playback backends, synth, mixer, spatial.
- [fx](modules/fx.md) — particles, emitters, force fields, screen filters, post-processing.
- [ai](modules/ai.md) — pathfinding, flow fields, navmesh, state machines, behaviour trees, steering.
- [light](modules/light.md) — field of view, light grid.
- [worldgen](modules/worldgen.md) — maze, dungeon (BSP), wave-function collapse.
- [replay](modules/replay.md) — input record/playback, timeline, state hashing, save/load.
- [tween](modules/tween.md) — eased tweens with delay/loop/yoyo.
- [world](modules/world.md) — tile maps, authored tile documents, per-cell metadata.
- [assets](modules/assets.md) — YAML-backed asset loading, packs, sprites, refs.

## API reference

The full per-symbol API reference, generated from the engine source by TypeDoc.

- [API index](api/README.md) — every exported class, function, interface, type, and enum.

## CLI

One page per command.

- [rune new](cli/new.md) — scaffold a project.
- [rune add](cli/add.md) — generate an entity or scene file.
- [rune dev](cli/dev.md) — run from source.
- [rune build](cli/build.md) — compile a standalone binary or bundle.
- [rune preview](cli/preview.md) — browse a project's files without running it.
- [rune inspect](cli/inspect.md) — attach to a running game and inspect live state.

## Examples

Each example is a standalone game that doubles as documentation for the patterns it demonstrates.

- [Examples index](examples/index.md) — table of examples and the engine features each showcases.
- [tomb](examples/tomb.md) — dungeon-crawler FPS (raycast rendering).
- [attack-surface](examples/attack-surface.md) — rotating threat-globe (spherical projection).
- [tamagotui](examples/tamagotui.md) — virtual-pet life-sim (pixel sprites, AI, synth audio, post-FX).
- [overworld](examples/overworld.md) — side-scrolling platformer (kinematic body, tiles, collision).
- [teapot](examples/teapot.md) — 3D mesh viewer (CPU rasterizer).
- [git-3d](examples/git-3d.md) — 3D git history visualizer.

## Contributing

- [Testing](testing.md) — the test layout, the `InMemoryCanvas` pattern, stubbing `ApplicationHandle`.
- [Contributing](contributing.md) — repo layout, commands, how to regenerate the API reference.
