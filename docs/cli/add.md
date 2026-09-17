# rune add

Generate a convention-following entity or scene file in the current project's `scene/` directory, with the imports, class skeleton, and Solid component shape the engine expects.

## Synopsis

```sh
rune add entity <Name>
rune add scene <Name>
```

## Flags

`rune add` takes no flags. It reads two positional arguments: a kind (`entity` or `scene`) and a PascalCase name.

## Description

`rune add` writes one new source file under `<cwd>/scene/` and nothing else. It is the fastest way to get a correctly-shaped stub; it never modifies existing files.

### Argument validation

The first positional must be `entity` or `scene` — anything else exits with code 1 and prints the usage line. The second positional is validated against `/^[A-Za-z][A-Za-z0-9]*$/` — a PascalCase identifier beginning with a letter, then letters and digits only. (Dashes, underscores, and a leading digit are rejected.) Names like `Player`, `Boss2`, or `Title` are accepted; `player`, `boss-2`, or `2Boss` are not.

### File placement and overwrite policy

Entities are written to `scene/<Name>.ts`; scenes to `scene/<Name>.tsx`. The `scene/` directory is created with `mkdir -p` semantics if needed. If the target file already exists, the command refuses to overwrite it and exits with code 1 — there is no `--force`.

### The entity stub

`rune add entity <Name>` writes a class extending `Entity2D` with an `<Name>Options` interface and `update`/`draw` stubs — the canonical shape from the [conventions](../conventions.md) and [getting started](../getting-started.md) docs:

```ts
import { type Camera, type CanvasSurface, Color, Entity2D, Vector2 } from "@ahokinson/rune"

export interface PlayerOptions {
  position?: Vector2
}

export class Player extends Entity2D {
  constructor(options: PlayerOptions = {}) {
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

### The scene stub

`rune add scene <Name>` writes a Solid component wrapping `<Scene>` + `<SceneRenderer>`. The `<Scene name="...">` prop is the name lowercased (e.g. `Title` → `title`). An inner component holds the hooks and entity wiring:

```tsx
import { Color, Scene, SceneRenderer } from "@ahokinson/rune"
import type { JSX } from "solid-js"

export function Title(): JSX.Element {
  return (
    <Scene name="title">
      <TitleInner />
    </Scene>
  )
}

function TitleInner(): JSX.Element {
  // Use hooks here, e.g. const scene = useScene(), const controls = useActions(...).
  // Create entities and add them in onMount, remove them in onCleanup.
  return <SceneRenderer clearColor={Color.fromHex("#0f172a")} />
}
```

On success the command prints `created scene/<Name>.{ts,tsx}`.

## Examples

```sh
# Generate a player entity
rune add entity Player

# Generate a title screen scene
rune add scene Title
```

## See also

- [Scenes & entities](../concepts/scenes-and-entities.md) — the entity model these stubs follow.
- [Conventions](../conventions.md) — the options-object convention enforced by the stub.
- [rune new](new.md) — scaffold the project you'd run this inside.
