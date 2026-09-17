# Getting started

## Prerequisites

- [Bun](https://bun.sh/) — rune ships as a Bun project and the CLI runs on Bun's runtime.
- A terminal with Unicode support (rune uses box-drawing and braille glyphs).

## Installing from GitHub Packages

The engine is published as `@ahokinson/rune` on [GitHub Packages](https://npm.pkg.github.com),
which requires an authenticated request for every install — even of public packages. Add to
your project's `.npmrc` (or `~/.npmrc`):

```
@ahokinson:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<a GitHub personal access token with read:packages>
```

## Scaffold a project

```sh
bunx rune new my-game
cd my-game
bun install
bunx rune dev
```

That's a working game. `rune new` copies the [starter template](https://github.com/ahokinson/rune/tree/main/packages/rune/templates/starter) — a minimal moving-glyph demo — and rewrites `package.json` to depend on the engine.

The starter layout:

```
my-game/
  package.json        # name, scripts dev/build → `rune dev`/`rune build`, deps rune + opentui + solid-js
  tsconfig.json       # strict, jsx preserve + jsxImportSource @opentui/solid
  bunfig.toml         # preload = ["@opentui/solid/preload"]
  main.tsx            # entry: render(() => <App />)
  App.tsx             # <Application ticksPerSecond={60}><Stage/></Application>
  actions.ts          # MoveAction + moveBindings (arrows + WASD)
  scene/
    World.tsx         # <Scene name="world"> + <SceneRenderer>; adds Banner + Mover in onMount
    Banner.ts         # static HUD Entity2D (title + controls hint)
    Mover.ts          # player-controlled glyph Entity2D: reads useActions in update(), paints in draw()
```

## The CLI

```sh
rune new <name> [--template <t>]   # scaffold a new game project
rune add <entity|scene> <Name>     # generate a game file in the current project
rune dev [--no-watch] [--no-inspect]  # run the game from source (watches by default)
rune preview                       # inspect a game's files/assets without running it
rune inspect [--socket <path>]     # attach to a running game and inspect live state
rune build [--bundle] [--outfile]  # build a standalone binary (or --bundle to dist/)
```

| Command | What it does |
| --- | --- |
| [`rune new`](cli/new.md) | Copies a template to `cwd/<name>`, rewrites `package.json`. |
| [`rune add`](cli/add.md) | Writes a convention-following entity or scene stub to `scene/<Name>.{ts,tsx}`. |
| [`rune dev`](cli/dev.md) | `bun [--watch] <entry>` with inherited TTY; sets `RUNE_DEV=1` and `RUNE_INSPECT_SOCKET`. |
| [`rune build`](cli/build.md) | `Bun.build` with the Solid plugin; default compiles a binary, `--bundle` emits `dist/main.js`. |
| [`rune preview`](cli/preview.md) | Scans a project without running it; opens the read-only inspector TUI. |
| [`rune inspect`](cli/inspect.md) | Connects to a running game over a Unix socket; opens the editable inspector TUI. |

`rune dev` runs your game straight from TypeScript — there is no build step. `rune build` compiles a self-contained executable with the current platform's native renderer embedded, so you can ship it and run it anywhere.

The game is driven entirely by files and code — there is no visual editor. Inspection lives in the CLI: `rune preview` opens a terminal browser of a project's structure (metadata, YAML assets, scene/entity files) without running it. `rune inspect` attaches to a game already running under `rune dev` (over a local socket) and shows its live scene/entity tree in a second terminal, where you can drill in and tweak runtime values — toggle `visible`/`enabled`, nudge transforms, pause/resume. Live edits affect the running process only; they are never written back to files.

## Your first entity

The starter's `Mover.ts` is the canonical shape of a rune entity:

```ts
import { type Camera, type CanvasSurface, Color, Entity2D, Vector2 } from "@ahokinson/rune"

export interface MoverOptions {
  position?: Vector2
}

export class Mover extends Entity2D {
  constructor(options: MoverOptions = {}) {
    super({ position: options.position ?? new Vector2(0, 0), size: new Vector2(1, 1) })
  }

  // Runs every fixed tick. Read input, move, resolve collisions, set state.
  override update(deltaMilliseconds: number): void {
    void deltaMilliseconds
  }

  // Runs every frame. Paint the entity through the scene camera.
  override draw(canvas: CanvasSurface, camera: Camera): void {
    const screen = camera.worldToScreen(this.position)
    canvas.setCell(Math.round(screen.x), Math.round(screen.y), "●", Color.WHITE)
  }
}
```

Every entity is constructed from a single options object. `update(deltaMilliseconds)` runs on the fixed step; `draw(canvas, camera)` runs every frame. See [Scenes & entities](concepts/scenes-and-entities.md) for the full model.

## Where to go next

- [Architecture](architecture.md) — how the pieces fit together.
- [Conventions](conventions.md) — the style guide.
- [Examples](examples/index.md) — six complete games to read.
