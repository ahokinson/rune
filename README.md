# rune

A small TUI game engine built on [OpenTUI](https://github.com/sst/opentui) and
[SolidJS](https://www.solidjs.com/). Games render to the terminal: sprites, raycast and
3D projection, collision, input, audio, particles, and a Solid component layer that ties a
scene to a fixed-timestep update loop.

## Getting started

Rune ships a CLI for the whole create → play → ship loop:

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

`rune dev` runs your game straight from TypeScript — there is no build step. `rune build`
compiles a self-contained executable with the current platform's native renderer embedded, so
you can ship it and run it anywhere.

> `bunx rune …` resolves to the local CLI through this repo's workspace. Outside the workspace,
> it resolves to the published [`@ahokinson/rune`](https://npm.pkg.github.com) package — see
> [Installing from GitHub Packages](docs/getting-started.md#installing-from-github-packages)
> for the registry/auth setup GitHub Packages requires.

The game itself is driven entirely by files and code — there is no visual editor. Inspection
instead lives in the CLI. `rune preview` opens a terminal browser of a project's structure
(metadata, YAML assets, scene/entity files) without running it. `rune inspect` attaches to a
game already running under `rune dev` (over a local socket) and shows its live scene/entity
tree in a second terminal, where you can drill in and tweak runtime values — toggle
`visible`/`enabled`, nudge transforms, pause/resume. Live edits affect the running process
only; they are never written back to files.

## Documentation

Full documentation lives in [`docs/`](docs/index.md):

- [Getting started](docs/getting-started.md) — install, scaffold, CLI tour.
- [Architecture](docs/architecture.md) — the Solid layer, the loop, the render pipeline.
- [Conventions](docs/conventions.md) — the style guide.
- [Concepts](docs/concepts/) — cross-cutting how-tos (application & loop, canvas & rendering, scenes & entities, input, audio, assets, inspection).
- [Modules](docs/modules/) — one overview page per engine module.
- [API reference](docs/api/README.md) — generated per-symbol reference.
- [CLI](docs/cli/) — one page per command.
- [Examples](docs/examples/index.md) — six complete games to read.
- [Testing](docs/testing.md) & [Contributing](docs/contributing.md).

## Working in this repo

This repository is a Bun workspace: the engine lives in `packages/rune`, and each game under
`examples/` is a standalone project that depends on it via `workspace:*`.

```sh
bun install                    # link the workspace
bun run build                  # build packages/rune's dist/ (examples resolve @ahokinson/rune through it)
bun test                       # run the engine test suite
bun run typecheck              # type-check the whole workspace
bun run check                  # Biome lint + format check (read-only)
bun run format                 # apply Biome formatting in place
bun run docs                   # regenerate the API reference (docs/api/)
bun run example:tomb           # play the dungeon-crawler FPS demo
bun run example:attack-surface # play the rotating threat-globe demo
bun run example:overworld      # play the platformer demo
bun run example:tamagotui      # raise the pixel-art virtual pet (autonomous AI + branching evolutions)
bun run example:teapot         # play the 3D mesh-rendering demo
bun run example:git-3d         # visualize a git repository in 3D
```

## Layout

```
packages/rune/   the engine
  src/           re-exported from src/index.ts
  cli/           the `rune` CLI (new / add / dev / build)
  templates/     project templates that `rune new` scaffolds from
  test/          bun:test suites (one per module area)
examples/        standalone games that depend on the engine via workspace:*
  shared/        reusable game-level code shared across examples (particle-emitter
                 factory, overlay widgets, procedural textures)
docs/            hand-authored guides + generated API reference (docs/api/)
```
