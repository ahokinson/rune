# Testing

The engine test suite uses [Bun's built-in test runner](https://bun.com/docs/test) (`bun:test`).

## Running tests

```sh
bun test              # run the whole suite
bun test packages/rune/test/vector2.test.ts   # run one file
bun test -t "Vector2"                          # run tests whose names match a regex
```

## Layout

Tests live in `packages/rune/test/` — a flat directory of 87 `.test.ts` files, one per source module (the naming is `<topic>.test.ts`, very close to 1:1 with source files). There are no `helpers/` or `fixtures/` directories and no shared non-test modules — each test is self-contained.

| Engine area | Test files |
| --- | --- |
| math | `angle`, `easing`, `fbm`, `matrix4`, `noise2d`, `poisson`, `quaternion`, `random`, `rectangle`, `vector2`, `vector3`, `worley` |
| geom | `camera3d`, `geomPrimitives`, `obj`, `orbitControl`, `sphere`, `sphereProjection` |
| draw | `animatedSprite`, `autotile`, `braille`, `pixelSprite`, `proceduralTexture`, `shapes`, `sprite`, `texture`, `textureBitmap`, `tileSet`, `mesh`, `shadowMap`, `billboard`, `columnDepthBuffer`, `pixelBillboard`, `projection`, `raycast` |
| scene | `scene`, `entityHierarchy`, `lifecycle`, `spriteState`, `tileLayer`, `detectCollisions` |
| core | `cooldown`, `loop`, `objectPool`, `pooledSet`, `rateCounter` |
| physics | `collision`, `collisionLayers`, `constraint`, `grid`, `kinematicBody2d`, `rigidBody2d`, `spatialGrid`, `spatialGrid3d`, `triggers` |
| input | `input` |
| audio | `audio`, `audioContext`, `mixer`, `spatialAudio`, `synth` |
| fx | `emitter`, `glitch`, `particles`, `particles3d`, `particlesAdvanced`, `postfx`, `scanlines`, `screen` |
| ai | `behaviorTree`, `blackboard`, `flowField`, `navmesh`, `pathfind`, `stateMachine`, `steering` |
| light | `lightGrid`, `shadowcast` |
| worldgen | `worldgen` |
| replay | `replay` |
| tween | `tween` |
| world | `tileDocument`, `tileMap`, `tileMeta` |
| assets | `assetPack` |
| inspect | `inspect`, `inspectModel` |

## Importing engine code in tests

Two ways:

```ts
// Via the public barrel (preferred for public API tests):
import { Vector2, InMemoryCanvas } from "@ahokinson/rune"

// Via the @/ path alias for internals:
import { InMemoryCanvas } from "@/draw/canvas"
```

The `@/*` alias is mapped to `packages/rune/src/*` in `tsconfig.json`.

## `InMemoryCanvas`

The standard canvas double. It's a non-rendering [`CanvasSurface`](api/Interface.CanvasSurface.md) implementation that records cells in memory — so you can assert what would be drawn without a terminal.

```ts
import { InMemoryCanvas, Color } from "@ahokinson/rune"

const canvas = new InMemoryCanvas(10, 5)
canvas.setCell(2, 3, "●", Color.WHITE)
canvas.cellAt(2, 3)  // { char: "●", fg: ..., bg: ... }
```

Most draw-module tests use this. See `packages/rune/test/shapes.test.ts` for a representative example.

## Stubbing `ApplicationHandle`

Tests that need an `ApplicationHandle` (e.g. for the inspect subsystem) build a minimal stub inline. See `packages/rune/test/inspect.test.ts`:

```ts
// A minimal handle exposing only what the inspect module reads.
const handle = {
  tick: () => 0,
  ticksPerSecond: () => 30,
  framesPerSecond: () => 60,
  paused: () => false,
  scenes: { current: scene, stack: [scene] },
  // ...
} satisfies ApplicationHandle
```

## Sockets

Tests that need a Unix socket use `node:os` `tmpdir()` and clean up in `afterEach`:

```ts
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

afterEach(() => {
  rmSync(socketPath, { force: true })
})
```

See `packages/rune/test/inspect.test.ts`.

## Example-embedded tests

A couple of examples carry their own tests:

- `examples/overworld/scene/gameplay.test.ts`
- `examples/git-3d/git/log.test.ts`

These are example-level, not engine tests. Run them with `bun test` from the example directory.

## See also

- [Contributing](contributing.md)
- [Bun test docs](https://bun.com/docs/test)
