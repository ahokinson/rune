# light

Field of view and accumulated coloured lighting on a grid — the visibility and illumination layer for roguelikes and top-down games. Use this to compute what an actor can see, and to bake coloured light into a grid for shading tiles.

## Overview

Two concerns, two files. [`computeFieldOfView`](../api/Function.computeFieldOfView.md) is a symmetric, artifact-free recursive-shadowcasting FOV: it calls `reveal` once per visible cell (including the origin), gated by a `isBlocking` predicate so walls stop sight. [`fieldOfViewSet`](../api/Function.fieldOfViewSet.md) is the convenience wrapper that collects the same FOV into a `Set` of `"column,row"` keys for callers that want a membership test rather than a streaming callback. Both take [`FieldOfViewOptions`](../api/Interface.FieldOfViewOptions.md) (origin, radius, blocking predicate).

[`LightGrid`](../api/Class.LightGrid.md) is a baked grid of accumulated coloured light intensity: add [`LightSource`](../api/Interface.LightSource.md)s (a coloured point light), then sample accumulated intensity at a cell to tint whatever is drawn there. It pairs naturally with FOV — reveal what's visible, shade it by accumulated light.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `shadowcast.ts` | [`computeFieldOfView`](../api/Function.computeFieldOfView.md), [`fieldOfViewSet`](../api/Function.fieldOfViewSet.md), [`FieldOfViewOptions`](../api/Interface.FieldOfViewOptions.md) | Recursive-shadowcasting FOV. |
| `lightGrid.ts` | [`LightGrid`](../api/Class.LightGrid.md), [`LightSource`](../api/Interface.LightSource.md) | Accumulated coloured light grid. |

## Key types

### Classes
- [`LightGrid`](../api/Class.LightGrid.md) — Baked grid of accumulated coloured light intensity; add lights, sample a cell.

### Functions
- [`computeFieldOfView`](../api/Function.computeFieldOfView.md) — Streaming FOV via recursive shadowcasting; `reveal` called per visible cell.
- [`fieldOfViewSet`](../api/Function.fieldOfViewSet.md) — Collect an FOV into a `Set` of `"column,row"` keys for membership tests.

### Types & interfaces
- [`LightSource`](../api/Interface.LightSource.md) — A coloured point light source.
- [`FieldOfViewOptions`](../api/Interface.FieldOfViewOptions.md) — Origin, radius, and `isBlocking` predicate.

## Usage

```ts
import { computeFieldOfView, fieldOfViewSet, LightGrid, Color } from "@ahokinson/rune"

// Visibility: reveal what the player can see.
const visible = fieldOfViewSet({
  origin: { column: player.x, row: player.y },
  radius: 8,
  isBlocking: (c, r) => tiles.isSolid(c, r),
})
if (visible.has(`${coin.x},${coin.y}`)) coin.reveal()

// Lighting: bake coloured lights, shade tiles by accumulated intensity.
const lights = new LightGrid(width, height)
lights.add({ x: torch.x, y: torch.y, color: Color.fromHex("#ff8c42"), range: 6 })
const shade = lights.at(tile.x, tile.y) // accumulated colour/intensity
```

## See also

- [world](world.md) — tile grids the FOV predicate reads from.
- [physics](physics.md) — [`CellPredicate`](../api/TypeAlias.CellPredicate.md) / [`lineOfSight`](../api/Function.lineOfSight.md) for simpler ray checks.
- [draw](draw.md) — [`Color`](../api/Class.Color.md) used for light tinting.
