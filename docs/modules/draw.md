# draw

The 2D rendering layer: the cell-grid canvas, colours, sprites and animation, shapes, braille sub-pixels, tile sets, procedural textures, plus two 3D-on-terminal pipelines — the first-person **raycaster** (`raycast/`) and the CPU triangle **mesh rasterizer** (`mesh/`). This is where everything you draw to the screen ultimately goes through.

## Overview

`draw/` is the bridge between geometry and terminal cells. The [`CanvasSurface`](../api/Interface.CanvasSurface.md) interface (`Canvas` in source, re-exported as `CanvasSurface` so it doesn't shadow the `<Canvas>` component) is a 2D buffer of coloured glyphs; [`InMemoryCanvas`](../api/Class.InMemoryCanvas.md) is the test double, and the real `FrameDiffCanvas` backing `<Canvas>` only flushes cells that changed frame-to-frame. [`Color`](../api/Class.Color.md) is the immutable RGBA type (channels normalised 0–1); [`SurfaceColor`](../api/Interface.SurfaceColor.md) is the mutable 0–255 RGB out-param shared by the raycaster and mesh pipelines.

Sprites come in two resolutions. [`Sprite`](../api/Class.Sprite.md) is a grid of coloured glyphs (one cell = one sprite cell); [`PixelSprite`](../api/Class.PixelSprite.md) paints two stacked pixels per terminal cell through the ▀/▄ half-blocks, doubling vertical resolution. [`AnimatedSprite`](../api/Class.AnimatedSprite.md) is the time-driven clip player over either. Tile rendering goes through [`TileSet`](../api/Class.TileSet.md) — a legend mapping cell values to appearances, with neighbour-aware [`autoTile`](../api/Function.autoTile.md) and animated tiles built in.

The two 3D pipelines are deliberately separate. **`raycast/`** is the first-person raycaster: per-column DDA against a grid of variable-height floor/ceiling cells ([`renderGridSurfaces`](../api/Function.renderGridSurfaces.md)), billboarded sprites, and depth buffers. **`mesh/`** is the perspective-correct triangle rasterizer ([`renderMesh`](../api/Function.renderMesh.md)) writing into a [`SubpixelTarget`](../api/Class.SubpixelTarget.md) at twice the terminal's vertical resolution, with pluggable [`MeshShader`](../api/Interface.MeshShader.md)s and a [`ShadowMap`](../api/Class.ShadowMap.md). Two depth-buffer conventions coexist by design — [`GridDepthBuffer`](../api/Class.GridDepthBuffer.md) (LARGER = NEARER) and [`ColumnDepthBuffer`](../api/Class.ColumnDepthBuffer.md) (SMALLER = NEARER) — with deliberately distinct method names so they can't be confused at a call site.

## Files

### Top level

| File | Exports | Purpose |
| --- | --- | --- |
| `canvas.ts` | [`CanvasSurface`](../api/Interface.CanvasSurface.md), [`CellBytes`](../api/Interface.CellBytes.md), [`InMemoryCanvas`](../api/Class.InMemoryCanvas.md) | Cell-grid render target + test double. |
| `color.ts` | [`Color`](../api/Class.Color.md), [`SurfaceColor`](../api/Interface.SurfaceColor.md) | Immutable RGBA colour + mutable RGB out-param. |
| `rgba.ts` | [`colorToRGBA`](../api/Function.colorToRGBA.md), [`rgbaToColor`](../api/Function.rgbaToColor.md) | opentui `RGBA` ↔ rune `Color`. |
| `camera.ts` | [`Camera`](../api/Class.Camera.md) | 2D view camera (world position + projection). |
| `palette.ts` | [`Palette`](../api/Variable.Palette.md) | Built-in palettes + `define` helper. |
| `sprite.ts` | [`Sprite`](../api/Class.Sprite.md), [`drawSprite`](../api/Function.drawSprite.md) | Terminal-grid sprite + blit. |
| `pixelSprite.ts` | [`PixelSprite`](../api/Class.PixelSprite.md), [`drawPixelSprite`](../api/Function.drawPixelSprite.md) | Half-block pixel sprite + blit. |
| `animatedSprite.ts` | [`AnimatedSprite`](../api/Class.AnimatedSprite.md) | Time-driven clip player. |
| `texture.ts` | [`Texture`](../api/Class.Texture.md) | Sampleable RGBA bitmap (nearest-neighbour, wrapping). |
| `proceduralTexture.ts` | [`checkerTexture`](../api/Function.checkerTexture.md), [`uvGridTexture`](../api/Function.uvGridTexture.md) | Debug/look textures generated at runtime. |
| `shapes.ts` | [`drawLine`](../api/Function.drawLine.md), [`drawRectangle`](../api/Function.drawRectangle.md), [`drawFilledRectangle`](../api/Function.drawFilledRectangle.md), [`drawBox`](../api/Function.drawBox.md), [`drawCircle`](../api/Function.drawCircle.md) | Single-glyph shape primitives. |
| `box.ts` | [`boxStyles`](../api/Variable.boxStyles.md), [`BoxStyle`](../api/Interface.BoxStyle.md) | Named box-drawing glyph sets. |
| `braille.ts` | [`rasterizeBrailleCell`](../api/Function.rasterizeBrailleCell.md), [`brailleGlyph`](../api/Function.brailleGlyph.md) | 2×4 braille sub-pixel helpers. |
| `charRamp.ts` | [`brightnessToChar`](../api/Function.brightnessToChar.md), [`DEFAULT_CHAR_RAMP`](../api/Variable.DEFAULT_CHAR_RAMP.md) | Brightness → ASCII ramp. |
| `tileSet.ts` | [`TileSet`](../api/Class.TileSet.md), [`fillTile`](../api/Function.fillTile.md), [`animatedTile`](../api/Function.animatedTile.md) | Tile legend + appearance helpers. |
| `autotile.ts` | [`autoTile`](../api/Function.autoTile.md), [`edgeMask`](../api/Function.edgeMask.md), [`EdgeBit`](../api/Enumeration.EdgeBit.md) | Neighbour-aware tile appearances. |

### `raycast/`

| File | Exports | Purpose |
| --- | --- | --- |
| `projection.ts` | [`RaycastProjection`](../api/Class.RaycastProjection.md), [`OrthographicProjection`](../api/Class.OrthographicProjection.md) | First-person + orthographic projections. |
| `firstPersonCamera.ts` | [`createFirstPersonCamera`](../api/Function.createFirstPersonCamera.md), [`syncFirstPersonCamera`](../api/Function.syncFirstPersonCamera.md) | First-person camera factory + view sync. |
| `grid.ts` | [`renderGridSurfaces`](../api/Function.renderGridSurfaces.md), [`GridSurfaces`](../api/Interface.GridSurfaces.md), [`SurfaceShader`](../api/Interface.SurfaceShader.md) | Per-column DDA raycaster. |
| `gridDepthBuffer.ts` | [`GridDepthBuffer`](../api/Class.GridDepthBuffer.md) | LARGER = NEARER depth buffer. |
| `columnDepthBuffer.ts` | [`ColumnDepthBuffer`](../api/Class.ColumnDepthBuffer.md) | SMALLER = NEARER depth buffer. |
| `columnSpanBuffer.ts` | [`ColumnSpanBuffer`](../api/Class.ColumnSpanBuffer.md) | Packed per-column filled row spans. |
| `billboard.ts` / `billboards.ts` | [`drawBillboard`](../api/Function.drawBillboard.md), [`renderBillboards`](../api/Function.renderBillboards.md) | Camera-facing sprite billboard + batched render. |
| `pixelBillboard.ts` | [`drawPixelBillboard`](../api/Function.drawPixelBillboard.md) | Half-block pixel-sprite billboard. |
| `textureShader.ts` | [`TextureSurfaceShader`](../api/Class.TextureSurfaceShader.md) | `SurfaceShader` that paints from `Texture`s. |

### `mesh/`

| File | Exports | Purpose |
| --- | --- | --- |
| `rasterizer.ts` | [`renderMesh`](../api/Function.renderMesh.md), [`Mesh`](../api/Interface.Mesh.md), [`MeshShader`](../api/Interface.MeshShader.md), [`Fragment`](../api/Interface.Fragment.md) | Perspective-correct triangle rasterizer. |
| `subpixelTarget.ts` | [`SubpixelTarget`](../api/Class.SubpixelTarget.md) | 2×-vertical RGB + depth render target (▀ half-block). |
| `shader.ts` | [`LambertMeshShader`](../api/Class.LambertMeshShader.md), [`LitMeshShader`](../api/Class.LitMeshShader.md) | Built-in mesh shaders. |
| `shadowMap.ts` | [`ShadowMap`](../api/Class.ShadowMap.md) | Directional/spot shadow map. |

## Key types

### Canvas & colour
- [`CanvasSurface`](../api/Interface.CanvasSurface.md) — Cell-grid render target (`setCell`, `drawText`, `fillRectangle`, `clear`, `flush`).
- [`InMemoryCanvas`](../api/Class.InMemoryCanvas.md) — Non-rendering `CanvasSurface` for tests.
- [`CellBytes`](../api/Interface.CellBytes.md) — Allocation-free byte-range view of a cell (for post-processing read-back).
- [`Color`](../api/Class.Color.md) — Immutable RGBA, channels 0–1; `fromHex`, `lerp`, `withAlpha`.
- [`SurfaceColor`](../api/Interface.SurfaceColor.md) — Mutable 0–255 RGB out-param shared by the 3D pipelines.
- [`Camera`](../api/Class.Camera.md) — 2D view camera (world position + projection).
- [`Palette`](../api/Variable.Palette.md) — Built-in palettes + `define` helper (type: [`Palette`](../api/TypeAlias.Palette.md)).
- [`colorToRGBA`](../api/Function.colorToRGBA.md) / [`rgbaToColor`](../api/Function.rgbaToColor.md) — opentui `RGBA` conversions.

### Sprites & animation
- [`Sprite`](../api/Class.Sprite.md) — 2D grid of coloured glyphs; blit with [`drawSprite`](../api/Function.drawSprite.md).
- [`PixelSprite`](../api/Class.PixelSprite.md) — Pixel-art sprite (▀/▄ half-block doubles vertical resolution); blit with [`drawPixelSprite`](../api/Function.drawPixelSprite.md).
- [`AnimatedSprite`](../api/Class.AnimatedSprite.md) — Clip player over `Sprite` or `PixelSprite` frames.
- [`AnimationClip`](../api/Interface.AnimationClip.md) / [`AnimatedSpriteOptions`](../api/Interface.AnimatedSpriteOptions.md) — Clip shape + construction options.
- [`SpriteCell`](../api/Interface.SpriteCell.md) / [`SpriteLegendEntry`](../api/Interface.SpriteLegendEntry.md) — Per-cell / per-legend-entry shapes.

### Tiles & autotiling
- [`TileSet`](../api/Class.TileSet.md) — Legend mapping cell values to appearances; one shared animated appearance per type.
- [`TileDefinition`](../api/Interface.TileDefinition.md) / [`TileContext`](../api/Interface.TileContext.md) / [`TileAppearance`](../api/TypeAlias.TileAppearance.md) — Definition + neighbour context + appearance union.
- [`fillTile`](../api/Function.fillTile.md) / [`animatedTile`](../api/Function.animatedTile.md) — Solid / animated tile-appearance builders.
- [`autoTile`](../api/Function.autoTile.md) / [`edgeMask`](../api/Function.edgeMask.md) / [`EdgeBit`](../api/Enumeration.EdgeBit.md) — 16-entry neighbour-mask autotiling.

### Shapes, boxes, braille, char ramps
- [`drawLine`](../api/Function.drawLine.md) / [`drawRectangle`](../api/Function.drawRectangle.md) / [`drawFilledRectangle`](../api/Function.drawFilledRectangle.md) / [`drawCircle`](../api/Function.drawCircle.md) — Single-glyph primitives.
- [`drawBox`](../api/Function.drawBox.md) / [`boxStyles`](../api/Variable.boxStyles.md) — Bordered box with named glyph sets (`single`, `double`, `rounded`, …).
- [`rasterizeBrailleCell`](../api/Function.rasterizeBrailleCell.md) / [`brailleGlyph`](../api/Function.brailleGlyph.md) — 2×4 braille sub-pixel sampling.
- [`brightnessToChar`](../api/Function.brightnessToChar.md) / [`DEFAULT_CHAR_RAMP`](../api/Variable.DEFAULT_CHAR_RAMP.md) — 0..1 brightness → ASCII glyph.

### Textures
- [`Texture`](../api/Class.Texture.md) — Sampleable RGBA bitmap (nearest-neighbour, wrapping).
- [`checkerTexture`](../api/Function.checkerTexture.md) / [`uvGridTexture`](../api/Function.uvGridTexture.md) — Procedural debug textures.

### Raycaster (`raycast/`)
- [`renderGridSurfaces`](../api/Function.renderGridSurfaces.md) — Per-column DDA against variable-height floor/ceiling cells.
- [`GridSurfaces`](../api/Interface.GridSurfaces.md) — Geometry sampler (the domain is infinite).
- [`SurfaceShader`](../api/Interface.SurfaceShader.md) — Per-pixel colour seam for walls/floors/ceilings.
- [`TextureSurfaceShader`](../api/Class.TextureSurfaceShader.md) — `SurfaceShader` painting from [`Texture`](../api/Class.Texture.md)s.
- [`RaycastProjection`](../api/Class.RaycastProjection.md) / [`OrthographicProjection`](../api/Class.OrthographicProjection.md) — First-person + orthographic projections.
- [`createFirstPersonCamera`](../api/Function.createFirstPersonCamera.md) / [`syncFirstPersonCamera`](../api/Function.syncFirstPersonCamera.md) — First-person camera factory + view sync.
- [`drawBillboard`](../api/Function.drawBillboard.md) / [`renderBillboards`](../api/Function.renderBillboards.md) / [`drawPixelBillboard`](../api/Function.drawPixelBillboard.md) — Camera-facing sprite billboards (single + batched + pixel).
- [`GridDepthBuffer`](../api/Class.GridDepthBuffer.md) / [`ColumnDepthBuffer`](../api/Class.ColumnDepthBuffer.md) — The two depth-buffer conventions.
- [`ColumnSpanBuffer`](../api/Class.ColumnSpanBuffer.md) — Packed per-column filled row spans.

### Mesh rasterizer (`mesh/`)
- [`renderMesh`](../api/Function.renderMesh.md) — Perspective-correct triangle rasterizer into a [`SubpixelTarget`](../api/Class.SubpixelTarget.md).
- [`SubpixelTarget`](../api/Class.SubpixelTarget.md) — 2×-vertical RGB + depth target resolved through the ▀ half-block.
- [`Mesh`](../api/Interface.Mesh.md) — Indexed triangle mesh in flat typed arrays.
- [`MeshShader`](../api/Interface.MeshShader.md) / [`Fragment`](../api/Interface.Fragment.md) — Per-fragment colour seam + fragment shape.
- [`LambertMeshShader`](../api/Class.LambertMeshShader.md) — Default Lambert diffuse shader.
- [`LitMeshShader`](../api/Class.LitMeshShader.md) — Lambert / Blinn-Phong / toon / normal-debug modes with shadows + emissive.
- [`ShadowMap`](../api/Class.ShadowMap.md) — Directional/spot shadow map (reuses `renderMesh` for the depth pass).
- [`MESH_DEFAULT_CLEAR`](../api/Variable.MESH_DEFAULT_CLEAR.md) — Default clear colour.

## Usage

```ts
import { Color, Sprite, drawSprite, drawBox, drawLine } from "@ahokinson/rune"

// 2D: draw a bordered box with a line under the title.
drawBox(canvas, 4, 2, 30, 10, { style: "rounded" })
drawLine(canvas, 6, 4, 32, 4, "─", Color.fromHex("#888"))

// Blit a sprite through the scene camera.
drawSprite(canvas, playerSprite, x, y, camera)
```

```ts
// 3D mesh: render a cube into a subpixel target and resolve to the canvas.
import { renderMesh, SubpixelTarget, LambertMeshShader, cubeMesh, Color, Matrix4 } from "@ahokinson/rune"

const target = new SubpixelTarget(width, height)
target.clear(Color.BLACK)
renderMesh({
  target,
  model: Matrix4.identity(),
  view,
  projection,
  mesh: cubeMesh(2),
  shader: new LambertMeshShader({ color: Color.fromHex("#c0c0c0"), light }),
})
target.resolveTo(canvas)
```

## See also

- [Canvas & rendering](../concepts/canvas-and-rendering.md) — `<Canvas>`, `<FullscreenCanvas>`, `<SceneRenderer>`, the draw order.
- [geom](geom.md) — mesh generators and 3D cameras feeding the rasterizer.
- [fx](fx.md) — [`FilterCanvas`](../api/Class.FilterCanvas.md) and post-processing over a finished frame.
- [Conventions](../conventions.md) — the two depth-buffer conventions.
