# @ahokinson/rune

A small TUI game engine built on [OpenTUI](https://github.com/sst/opentui) and
[SolidJS](https://www.solidjs.com/). Games render to the terminal: sprites, raycast and
3D projection, collision, input, audio, particles, and a Solid component layer that ties a
scene to a fixed-timestep update loop.

Full documentation, architecture notes, and six complete example games live in the
[GitHub repository](https://github.com/ahokinson/rune).

## Install

This package is published to [GitHub Packages](https://npm.pkg.github.com), which requires
an authenticated install even for public packages. Add to your project's `.npmrc` (or
`~/.npmrc`):

```
@ahokinson:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<a GitHub personal access token with read:packages>
```

Then install as usual:

```sh
bun add @ahokinson/rune
```

Or scaffold a new game with the bundled CLI:

```sh
bunx @ahokinson/rune new my-game
cd my-game
bun install
bunx rune dev
```

## Usage

```ts
import { type Camera, type CanvasSurface, Color, Entity2D, Vector2 } from "@ahokinson/rune"

export class Mover extends Entity2D {
  override draw(canvas: CanvasSurface, camera: Camera): void {
    const screen = camera.worldToScreen(this.position)
    canvas.setCell(Math.round(screen.x), Math.round(screen.y), "●", Color.WHITE)
  }
}
```

See the [getting started guide](https://github.com/ahokinson/rune/blob/main/docs/getting-started.md)
for the full CLI tour and entity model.

## License

MIT
