# fx

Effects: 2D and 3D particles, self-managing emitters, force fields, the `FilterCanvas` screen-effect shim, and a post-processing pipeline of full-frame passes (bloom, CRT, dither, chromatic aberration, scanlines, glitch). Reach for this when something should appear, live briefly, and expire — or when a finished frame needs a retro look.

## Overview

`fx/` has two halves. The **simulation** half is about churn: [`Particles`](../api/Class.Particles.md) is a pooled 2D particle emitter drawn as an [`Entity2D`](../api/Class.Entity2D.md), [`Particles3D`](../api/Class.Particles3D.md) is the 3D counterpart drawn as a world-space geometry (each particle projected/culled/depth-tested like a [`PointCloud3D`](../api/Class.PointCloud3D.md) point), and [`Emitter`](../api/Class.Emitter.md) is the general self-managing population underneath — `update` expires finished items and probabilistically spawns more up to `capacity`. Movement comes from composable [`ForceField`](../api/TypeAlias.ForceField.md)s: [`directionalForce`](../api/Function.directionalForce.md) (wind/gravity), [`pointAttractor`](../api/Function.pointAttractor.md) (pull/push with 1/d falloff), [`vortex`](../api/Function.vortex.md) (perpendicular swirl), and [`drag`](../api/Function.drag.md). All pooling builds on [core](core.md)'s [`ObjectPool`](../api/Class.ObjectPool.md) / [`PooledSet`](../api/Class.PooledSet.md).

The **screen** half is [`FilterCanvas`](../api/Class.FilterCanvas.md), a canvas wrapper that runs a stack of [`ScreenEffect`](../api/Interface.ScreenEffect.md)s over everything drawn through it: each draw call is shifted by the summed `rowOffset(y)` and tinted by the product of every `brightness()`, then `postPass` lets effects overlay artifacts after the frame is drawn. [`GlitchEffect`](../api/Class.GlitchEffect.md) is the CRT/retro glitch as a `ScreenEffect` (tears, static, flicker, chroma, block corruption). For whole-frame post-processing, [`PostProcessPipeline`](../api/Class.PostProcessPipeline.md) runs an ordered chain of [`PostEffect`](../api/TypeAlias.PostEffect.md)s against the composited canvas — [`bloom`](../api/Function.bloom.md), [`crt`](../api/Function.crt.md), [`dither`](../api/Function.dither.md), [`chromaticAberration`](../api/Function.chromaticAberration.md) — with [`snapshotFrame`](../api/Function.snapshotFrame.md) providing the reusable [`FramePlanes`](../api/Interface.FramePlanes.md) snapshot neighbour-sampling passes need. [`drawScanlines`](../api/Function.drawScanlines.md) paints CRT scanlines directly.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `emitter.ts` | [`Emitter`](../api/Class.Emitter.md), [`EmitterOptions`](../api/Interface.EmitterOptions.md), [`EmitterUpdate`](../api/Interface.EmitterUpdate.md) | Self-managing pooled population. |
| `particles.ts` | [`Particles`](../api/Class.Particles.md), [`ParticlesOptions`](../api/Interface.ParticlesOptions.md) | Pooled 2D particle entity. |
| `particles3d.ts` | [`Particles3D`](../api/Class.Particles3D.md), [`Particle3DStyle`](../api/Interface.Particle3DStyle.md) | Pooled 3D particle entity. |
| `forceField.ts` | [`directionalForce`](../api/Function.directionalForce.md), [`pointAttractor`](../api/Function.pointAttractor.md), [`vortex`](../api/Function.vortex.md), [`drag`](../api/Function.drag.md), [`ForceField`](../api/TypeAlias.ForceField.md) | Composable particle forces. |
| `screen.ts` | [`FilterCanvas`](../api/Class.FilterCanvas.md), [`ScreenEffect`](../api/Interface.ScreenEffect.md) | Effect-shifting canvas wrapper. |
| `glitch.ts` | [`GlitchEffect`](../api/Class.GlitchEffect.md), [`GlitchKind`](../api/Enumeration.GlitchKind.md) | CRT/retro glitch `ScreenEffect`. |
| `scanlines.ts` | [`drawScanlines`](../api/Function.drawScanlines.md), [`ScanlineOptions`](../api/Interface.ScanlineOptions.md) | Direct CRT scanline painter. |
| `pipeline.ts` | [`PostProcessPipeline`](../api/Class.PostProcessPipeline.md), [`snapshotFrame`](../api/Function.snapshotFrame.md), [`PostEffect`](../api/TypeAlias.PostEffect.md), [`FramePlanes`](../api/Interface.FramePlanes.md) | Ordered full-frame post passes. |
| `bloom.ts` | [`bloom`](../api/Function.bloom.md), [`BloomOptions`](../api/Interface.BloomOptions.md) | Bloom `PostEffect`. |
| `crt.ts` | [`crt`](../api/Function.crt.md), [`CrtOptions`](../api/Interface.CrtOptions.md) | CRT vignette + scanline `PostEffect`. |
| `dither.ts` | [`dither`](../api/Function.dither.md), [`DitherOptions`](../api/Interface.DitherOptions.md) | Ordered-dithering `PostEffect`. |
| `chromaticAberration.ts` | [`chromaticAberration`](../api/Function.chromaticAberration.md), [`ChromaticAberrationOptions`](../api/Interface.ChromaticAberrationOptions.md) | Chromatic-aberration `PostEffect`. |

## Key types

### Particles & emitters
- [`Particles`](../api/Class.Particles.md) — Pooled 2D particle emitter drawn as an [`Entity2D`](../api/Class.Entity2D.md).
- [`Particles3D`](../api/Class.Particles3D.md) — Pooled 3D particles drawn as world-space geometry (host-driven `update`, draw-only).
- [`Emitter`](../api/Class.Emitter.md) — General self-managing pooled population (Particles is one concrete emitter).
- [`ParticlesOptions`](../api/Interface.ParticlesOptions.md) / [`Particles3DOptions`](../api/Interface.Particles3DOptions.md) / [`EmitterOptions`](../api/Interface.EmitterOptions.md) / [`EmitterUpdate`](../api/Interface.EmitterUpdate.md) — Construction + per-tick callbacks.
- [`Particle3DStyle`](../api/Interface.Particle3DStyle.md) — Per-particle 3D draw callback (game controls glyph/colour).

### Force fields
- [`ForceField`](../api/TypeAlias.ForceField.md) — `(position, velocity, out) => void` adding acceleration.
- [`directionalForce`](../api/Function.directionalForce.md) — Constant directional force (wind, buoyancy, gravity).
- [`pointAttractor`](../api/Function.pointAttractor.md) — Pull (positive) / push (negative) toward a point, 1/d falloff.
- [`vortex`](../api/Function.vortex.md) — Perpendicular swirl about a centre (whirlpool/tornado).
- [`drag`](../api/Function.drag.md) — Velocity-proportional drag (air resistance).

### Screen effects & FilterCanvas
- [`FilterCanvas`](../api/Class.FilterCanvas.md) — Canvas wrapper running a stack of `ScreenEffect`s (summed `rowOffset`, product `brightness`, `postPass` overlay).
- [`ScreenEffect`](../api/Interface.ScreenEffect.md) — Screen-space hook set (`rowOffset`, `brightness`, `postPass`); implement only what an effect needs.
- [`GlitchEffect`](../api/Class.GlitchEffect.md) — Idles, fires a transient glitch, idles again; drives a `FilterCanvas`.
- [`GlitchKind`](../api/Enumeration.GlitchKind.md) — Transient glitch kinds (tear, static, flicker, chroma, blocks).
- [`drawScanlines`](../api/Function.drawScanlines.md) — Paint horizontal CRT scanlines directly onto a canvas.

### Post-processing pipeline
- [`PostProcessPipeline`](../api/Class.PostProcessPipeline.md) — Ordered chain of [`PostEffect`](../api/TypeAlias.PostEffect.md)s over a finished frame.
- [`PostEffect`](../api/TypeAlias.PostEffect.md) — `(canvas, tick?) => void` full-frame pass.
- [`snapshotFrame`](../api/Function.snapshotFrame.md) — Snapshot glyphs + fg/bg bytes into reusable [`FramePlanes`](../api/Interface.FramePlanes.md).
- [`bloom`](../api/Function.bloom.md) / [`crt`](../api/Function.crt.md) / [`dither`](../api/Function.dither.md) / [`chromaticAberration`](../api/Function.chromaticAberration.md) — Built-in `PostEffect` factories.

## Usage

```ts
import { Particles, type ParticlesOptions, pointAttractor, drag } from "@ahokinson/rune"

const sparks = new Particles({
  position: new Vector2(40, 12),
  capacity: 64,
  spawnChance: 0.8,
  lifetime: { min: 0.3, max: 0.8 },
  speed: { min: 0.2, max: 0.6 },
  glyph: "*",
  forces: [pointAttractor(40, 6, -2.0), drag(0.9)],
})
scene.add(sparks)
```

```ts
import { PostProcessPipeline, bloom, crt } from "@ahokinson/rune"

const post = new PostProcessPipeline(canvas, [bloom({ threshold: 0.6 }), crt()])
// each frame, after the scene is drawn: post.run(tick)
```

## See also

- [core](core.md) — [`ObjectPool`](../api/Class.ObjectPool.md) / [`PooledSet`](../api/Class.PooledSet.md) the emitters build on.
- [scene](scene.md) — [`Entity2D`](../api/Class.Entity2D.md) / [`Entity3D`](../api/Class.Entity3D.md) the particle entities extend.
- [draw](draw.md) — [`CanvasSurface`](../api/Interface.CanvasSurface.md) / [`InMemoryCanvas`](../api/Class.InMemoryCanvas.md) the post pipeline targets.
