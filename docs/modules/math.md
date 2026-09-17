# math

Vectors, scalars, matrices, quaternions, noise, random, and easing — the numeric primitives every other module builds on. Reach for this when you need a vector or colour computation, a deterministic random source, a noise field for procedural placement, or an easing curve for a tween.

## Overview

The hot math types — [`Vector2`](../api/Class.Vector2.md), [`Vector3`](../api/Class.Vector3.md), [`Matrix4`](../api/Class.Matrix4.md), [`Quaternion`](../api/Class.Quaternion.md) — are **mutable** and follow the `*Into` out-param idiom: every allocating operation (`add`, `scale`, `normalize`) has an `*InPlace` sibling that mutates `this` and a static `*Into` variant that writes into a caller-supplied instance. Use the allocating forms for setup and one-shots; use `*InPlace` / `*Into` inside per-frame hot paths so a render loop never allocates. Screen space is Y-down (origin top-left), shared with `Vector3`.

Noise comes in three flavours. [`Noise2D`](../api/Class.Noise2D.md) shares one lattice hash between `sample` (value noise, blobby, `[0, 1)`) and `perlin` (gradient noise, flowing, `[-1, 1]`). [`Noise3D`](../api/Class.Noise3D.md) is value noise with built-in fractal-brownian-motion summation; sampling in 3D lets a unit surface vector wrap a field seamlessly over a sphere. [`Worley2D`](../api/Class.Worley2D.md) is cellular/Voronoi noise for cracked-stone and scales. The [`fbm`](../api/Function.fbm.md) / [`ridged`](../api/Function.ridged.md) / [`domainWarp`](../api/Function.domainWarp.md) fractal helpers compose any 2D sampler into richer fields.

[`Random`](../api/Class.Random.md) is a seedable 32-bit PRNG — deterministic for a given seed, which is what makes replays and procedural layouts reproduce exactly. [`poissonDisk`](../api/Function.poissonDisk.md) scatters points with organic-but-minimum spacing via Bridson's algorithm (the go-to distribution for tree/rock/star placement). [`Easing`](../api/Variable.Easing.md) and [`Angle`](../api/Variable.Angle.md) are helper namespaces of common curves and radian/degree conversions.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `scalar.ts` | [`lerp`](../api/Function.lerp.md), [`clamp`](../api/Function.clamp.md), [`mapRange`](../api/Function.mapRange.md), [`wrap`](../api/Function.wrap.md), [`sign`](../api/Function.sign.md) | Small scalar helpers. |
| `vector2.ts` | [`Vector2`](../api/Class.Vector2.md) | Mutable 2D vector with the `*Into` idiom. |
| `vector3.ts` | [`Vector3`](../api/Class.Vector3.md) | Mutable 3D vector. |
| `rectangle.ts` | [`Rectangle`](../api/Class.Rectangle.md) | Axis-aligned rectangle (half-open right/bottom edges). |
| `matrix4.ts` | [`Matrix4`](../api/Class.Matrix4.md) | Column-major 4×4 model matrix. |
| `quaternion.ts` | [`Quaternion`](../api/Class.Quaternion.md) | Unit quaternion for 3D orientation. |
| `random.ts` | [`Random`](../api/Class.Random.md) | Seedable deterministic PRNG. |
| `noise.ts` | [`Noise3D`](../api/Class.Noise3D.md) | Seeded 3D value noise with FBM. |
| `noise2d.ts` | [`Noise2D`](../api/Class.Noise2D.md) | Seeded 2D value + Perlin noise. |
| `worley.ts` | [`Worley2D`](../api/Class.Worley2D.md), [`WorleyDistance`](../api/Enumeration.WorleyDistance.md), [`WorleyResult`](../api/Interface.WorleyResult.md) | 2D Worley/cellular noise. |
| `fbm.ts` | [`fbm`](../api/Function.fbm.md), [`ridged`](../api/Function.ridged.md), [`domainWarp`](../api/Function.domainWarp.md), [`FbmOptions`](../api/Interface.FbmOptions.md), [`DomainWarpOptions`](../api/Interface.DomainWarpOptions.md), [`NoiseSampler2D`](../api/TypeAlias.NoiseSampler2D.md) | Fractal noise composers. |
| `poisson.ts` | [`poissonDisk`](../api/Function.poissonDisk.md), [`PoissonOptions`](../api/Interface.PoissonOptions.md) | Poisson-disk scatter (Bridson). |
| `easing.ts` | [`Easing`](../api/Variable.Easing.md), [`EasingFunction`](../api/TypeAlias.EasingFunction.md) | Common easing curves. |
| `angle.ts` | [`Angle`](../api/Variable.Angle.md) | Radian/degree conversion and shortest-arc interpolation. |

## Key types

### Classes
- [`Vector2`](../api/Class.Vector2.md) — Mutable 2D vector; the workhorse of 2D positions, velocities, and screen coordinates.
- [`Vector3`](../api/Class.Vector3.md) — Mutable 3D vector; positions, normals, directions.
- [`Rectangle`](../api/Class.Rectangle.md) — Axis-aligned rectangle; `contains`/`intersects` use half-open edges so adjacent rects don't overlap.
- [`Matrix4`](../api/Class.Matrix4.md) — Column-major 4×4 transform fed to the triangle rasterizer.
- [`Quaternion`](../api/Class.Quaternion.md) — Unit orientation; preferred over Euler angles for accumulated rotation (no gimbal lock).
- [`Random`](../api/Class.Random.md) — Seedable PRNG; deterministic for a given seed.
- [`Noise2D`](../api/Class.Noise2D.md) — Seeded 2D value + Perlin noise.
- [`Noise3D`](../api/Class.Noise3D.md) — Seeded 3D value noise with FBM summation.
- [`Worley2D`](../api/Class.Worley2D.md) — Seeded 2D Worley (cellular) noise.

### Functions
- [`lerp`](../api/Function.lerp.md) — Linear interpolation between two scalars.
- [`clamp`](../api/Function.clamp.md) — Clamp a value to `[low, high]`.
- [`mapRange`](../api/Function.mapRange.md) — Remap a value from one range to another.
- [`wrap`](../api/Function.wrap.md) — Wrap a value into `[minimum, maximum)`.
- [`sign`](../api/Function.sign.md) — Sign distinguishing zero (`-1` / `0` / `1`).
- [`fbm`](../api/Function.fbm.md) — Sum octaves of a sampler at rising frequency / falling amplitude.
- [`ridged`](../api/Function.ridged.md) — Ridged multifractal for eroded mountain ridges.
- [`domainWarp`](../api/Function.domainWarp.md) — Two-pass swirl: offset a sampler's lookup by an fbm of a warp sampler.
- [`poissonDisk`](../api/Function.poissonDisk.md) — Scatter points so no two are closer than `radius` (Bridson's algorithm).

### Types & interfaces
- [`EasingFunction`](../api/TypeAlias.EasingFunction.md) — `(t: number) => number` mapping `[0, 1]` to an eased value.
- [`NoiseSampler2D`](../api/TypeAlias.NoiseSampler2D.md) — `(x, y) => number` sampler accepted by the fractal helpers.
- [`FbmOptions`](../api/Interface.FbmOptions.md) — Octaves, lacunarity, gain shared by the fractal helpers.
- [`DomainWarpOptions`](../api/Interface.DomainWarpOptions.md) — `FbmOptions` plus a warp strength.
- [`PoissonOptions`](../api/Interface.PoissonOptions.md) — Width, height, radius, seed for `poissonDisk`.
- [`WorleyResult`](../api/Interface.WorleyResult.md) — Nearest and second-nearest distances from a `Worley2D` sample.

### Enums
- [`WorleyDistance`](../api/Enumeration.WorleyDistance.md) — Distance metric used by `Worley2D` (F1, F2, F2−F1, …).

### Constants
- [`Easing`](../api/Variable.Easing.md) — Collection of common easing functions (`linear`, `easeInQuad`, `easeOutCubic`, …).
- [`Angle`](../api/Variable.Angle.md) — Radians/degrees conversion and shortest-arc interpolation helpers.

## Usage

```ts
import { Easing, Random, Vector2, clamp, lerp, poissonDisk } from "@ahokinson/rune"

const random = new Random(12345)
const v = new Vector2(3, 4)
v.length()              // 5
v.normalizeInPlace()    // (0.6, 0.8)

// Hot path: reuse a scratch vector instead of allocating.
const scratch = new Vector2()
Vector2.fromAngleInto(scratch, random.nextFloat(0, Math.PI * 2))

// Procedural placement with organic spacing.
const trees = poissonDisk({ width: 80, height: 24, radius: 3, seed: random.next() })

// Eased interpolation.
const t = Easing.easeOutCubic(0.5)
const x = lerp(start, end, t)
```

## See also

- [Conventions](../conventions.md) — the `*Into` out-param idiom.
- [tween](tween.md) — drives scalars through [`Easing`](../api/Variable.Easing.md) curves.
- [worldgen](worldgen.md) — consumes [`Random`](../api/Class.Random.md) and noise for deterministic layouts.
