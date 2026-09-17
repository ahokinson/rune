# Examples — engine conventions

These games double as the engine's documentation. They are meant to show **one
right way** to do each thing, so new code should match the patterns below. Code
that is reusable but not engine-level (overlay widgets, a particle-emitter
factory, procedural textures) lives in `examples/shared/`; specific effects
stay in their own example.
Full documentation lives in [`docs/`](../docs/index.md). The per-example pages
below walk through what each game showcases and which files to read:

- [Examples index](../docs/examples/index.md) — table of examples and the engine features each showcases.
- [tomb](../docs/examples/tomb.md) — dungeon-crawler FPS (raycast rendering).
- [attack-surface](../docs/examples/attack-surface.md) — rotating threat-globe (spherical projection).
- [tamagotui](../docs/examples/tamagotui.md) — virtual-pet life-sim (pixel sprites, AI, synth audio, post-FX).
- [overworld](../docs/examples/overworld.md) — side-scrolling platformer (kinematic body, tiles, collision).
- [teapot](../docs/examples/teapot.md) — 3D mesh viewer (CPU rasterizer).
- [git-3d](../docs/examples/git-3d.md) — 3D git history visualizer.

The pattern-level conventions (bootstrap, input timing, movement, collision,
animation, audio) are documented in [Concepts](../docs/concepts/) and
[Conventions](../docs/conventions.md).

## `shared/`

- `particles.ts` — shared manual-emit `Particles` factory (`emitter`): every action example builds burst FX (muzzle flashes, blood spray, coin sparkles, brick shatter, mood FX) the same way. The reusable primitive (`Particles`) lives in the engine; this is the example-side convenience wrapper.
- `overlay.ts` — shared screen-overlay widget kit: bezelled panels (block or line), fractional meters, sparklines/gauges/tickers, a "decoding" text reveal, and two-tone ASCII-font banners.
- `textures.ts` — game-side procedural texture (marble, built on the engine's `Noise3D`). The debug textures (checker, uv grid) live in the engine; marble is specific to the teapot demo.
