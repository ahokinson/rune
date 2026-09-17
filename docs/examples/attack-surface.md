# attack-surface

A rotating threat-globe: a braille-sub-pixel Earth with city markers, live attack arcs that bow along great-circles and burn comet trails toward their targets, drifting cloud cover, a CRT scanline/glitch post layer, and a HUD of meters, sparklines, gauges, tickers, and a "decrypting" event feed. Drag to spin and tilt the globe; release and it auto-rotates again.

## Run it

```sh
# From the repo root:
bun run example:attack-surface

# Or from the example directory:
cd examples/attack-surface
bun run dev
```

## What it showcases

Spherical projection. The whole scene shares one [`SphereProjection`](../api/Class.SphereProjection.md) (tilt + aspect-y squash for terminal cells) bound to a generic 3D camera through a [`SphereProjector`](../api/Class.SphereProjector.md) (`globe/projection.ts`). `GlobeEntity` ([`Entity2D`](../api/Class.Entity2D.md)) owns a [`Scene3D`](../api/Class.Scene3D.md) directly — deliberately not the [`WorldView3D`](../api/Class.WorldView3D.md) bridge, because the globe draw is sandwiched between custom 2D background and foreground passes that all share one glitch canvas. The globe surface is a [`SurfaceMesh3D`](../api/Class.SurfaceMesh3D.md) backed by a custom [`SurfaceSampler`](../api/Interface.SurfaceSampler.md): the engine walks the disc, inverse-projects each cell, and runs the 2×4 braille sub-pixel grid; the sampler's `subpixel`/`finishCell` hooks do all the land-mask sampling, [`lambert`](../api/Function.lambert.md) lighting, phosphor sweep, and colour. Cities are a [`PointCloud3D`](../api/Class.PointCloud3D.md); the comet trail is a [`Particles3D`](../api/Class.Particles3D.md) whose origin the update loop sweeps along each active arc.

Arcs and motion. Each attack is a great-circle bow: [`slerpInto`](../api/Function.slerpInto.md) interpolates between the endpoint directions and [`greatCircleAngle`](../api/Function.greatCircleAngle.md) sets how far the arc lifts off the surface (`globe/connections.ts`). The comet head is derived analytically from the attack's age, so emission is stateless; trail particles drop between the previous and current head positions so the streak stays continuous. An [`Emitter`](../api/Class.Emitter.md) owns the pooled spawn/expire lifecycle and the per-second rate window (`globe/attacks.ts`); cloud cover is a seamless-on-the-sphere [`Noise3D`](../api/Class.Noise3D.md) fbm field advected by a zonal wind (`globe/clouds.ts`). Turntable control is [`OrbitControl`](../api/Class.OrbitControl.md) with a `canStartDrag` disc hit-test so only grabs on the globe pause the auto-spin.

Post and HUD. Each frame wraps the canvas in a [`FilterCanvas`](../api/Class.FilterCanvas.md) over a [`GlitchEffect`](../api/Class.GlitchEffect.md), paints [`drawScanlines`](../api/Function.drawScanlines.md) (skipping the border and the globe disc), draws the directional atmosphere halo, then composites the 3D world, attack endpoints, and the targeting reticle through the same glitch canvas so the post pass applies to all of it. The HUD is the shared overlay kit from `examples/shared/overlay.ts` — `drawBar`, `drawGauge`, `drawSparkline`, `drawTicker`, `scrambleReveal`, `drawBigText` — driven off wall-clock time so motion stays smooth at the render rate independent of the 30 Hz sim tick.

| Engine feature | Where in the example |
| --- | --- |
| [`SphereProjection`](../api/Class.SphereProjection.md) / [`SphereProjector`](../api/Class.SphereProjector.md) / [`Camera3D`](../api/Class.Camera3D.md) | `globe/projection.ts` — the shared screen↔sphere projection bound to the 3D camera. |
| [`SurfaceMesh3D`](../api/Class.SurfaceMesh3D.md) / [`SurfaceSampler`](../api/Interface.SurfaceSampler.md) | `globe/render.ts` — the braille sub-pixel land-mask surface; the engine owns inverse projection + depth, the sampler owns shading. |
| [`PointCloud3D`](../api/Class.PointCloud3D.md) | `globe/connections.ts` — `createCityPoints`, near-side-culled city markers. |
| [`Particles3D`](../api/Class.Particles3D.md) / [`Particle3DStyle`](../api/Interface.Particle3DStyle.md) | `globe/GlobeEntity.ts` + `globe/connections.ts` — the shared comet trail + its glow falloff style. |
| [`OrbitControl`](../api/Class.OrbitControl.md) | `globe/GlobeEntity.ts` — click-and-drag turntable with auto-spin resume and a disc hit-test gate. |
| [`FilterCanvas`](../api/Class.FilterCanvas.md) / [`GlitchEffect`](../api/Class.GlitchEffect.md) / [`drawScanlines`](../api/Function.drawScanlines.md) | `globe/GlobeEntity.ts` — the CRT post layer over the whole composited frame. |
| [`Noise3D`](../api/Class.Noise3D.md) | `globe/clouds.ts` — seamless 3D-sampled cloud fbm advected by a zonal wind. |
| [`Emitter`](../api/Class.Emitter.md) | `globe/attacks.ts` — `AttackFeed` pooled spawn/expire + per-second rate window. |
| [`slerpInto`](../api/Function.slerpInto.md) / [`greatCircleAngle`](../api/Function.greatCircleAngle.md) / [`sphericalToVector3`](../api/Function.sphericalToVector3.md) | `globe/connections.ts` — great-circle arc sampling and city unit directions. |
| [`lambert`](../api/Function.lambert.md) / [`directionToScreenPlane`](../api/Function.directionToScreenPlane.md) | `globe/render.ts` + `globe/projection.ts` — surface lighting and the atmosphere's screen-plane light direction. |
| [`Scene3D`](../api/Class.Scene3D.md) / [`Entity2D`](../api/Class.Entity2D.md) | `globe/GlobeEntity.ts` — a self-contained entity that owns its 3D world and all 2D passes. |

## Key files

| File | What it demonstrates |
| --- | --- |
| `App.tsx` | Bootstrap + `FullscreenCanvas` render-prop sizing the globe to the terminal. |
| `globe/GlobeEntity.ts` | The whole demo in one `Entity2D`: the 3D world, orbit, glitch/scanline post, HUD, and the per-tick attack sweep. |
| `globe/projection.ts` | The shared `SphereProjection`/`SphereProjector`/`Camera3D` + fixed light direction. |
| `globe/render.ts` | The `SurfaceSampler` contract — braille sub-pixel land mask, lighting, sweep, atmosphere halo. |
| `globe/connections.ts` | Cities as `PointCloud3D`, great-circle arc sampling, comet trail style, reticle/endpoints. |
| `globe/attacks.ts` | `AttackFeed` on `Emitter` — spawn/expire, per-type counts, recent-events ring. |
| `globe/clouds.ts` | `Noise3D` fbm cloud field sampled on the unit sphere. |

## See also

- [Scenes & entities](../concepts/scenes-and-entities.md) — the `Entity2D`/`Scene3D` model and when to use `WorldView3D` vs. owning a `Scene3D` directly.
- [geom](../modules/geom.md) — 3D cameras, projections, sphere math.
- [fx](../modules/fx.md) — particles, emitters, screen filters, post-processing.
