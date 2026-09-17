import type { FlatSample, GridSurfaces, SurfaceColor, SurfaceShader, TileMap, WallSample } from "@ahokinson/rune"
import { getCeilingHeight, getFloorHeight, type LevelTheme, type LightGrid, type TombCell } from "../map"
import { applyHorizonFog, ceilingPixel, floorPixel } from "./floorCeiling"
import { addLightAt } from "./lightGrid"
import { TOMB_WALL_TEXTURES } from "./textures"
import { wallBaseColor } from "./wallShaders"

const textureSample: SurfaceColor = { r: 0, g: 0, b: 0 }

function themeFor(themes: LevelTheme[], cell: TombCell | null | undefined): LevelTheme {
  const id = cell?.themeId ?? 0
  return themes[id] ?? themes[0]!
}

/** Adapts a `TileMap<TombCell>` to the engine's geometry seam. Out-of-bounds
 *  cells read as solid with floor 0 / ceiling 1, matching the map helpers. */
export class TombSurfaces implements GridSurfaces {
  constructor(private readonly tileMap: TileMap<TombCell>) {}

  isSolid(column: number, row: number): boolean {
    return this.tileMap.get(column, row)?.solid ?? true
  }

  floorHeight(column: number, row: number): number {
    return getFloorHeight(this.tileMap, column, row)
  }

  ceilingHeight(column: number, row: number): number {
    return getCeilingHeight(this.tileMap, column, row)
  }
}

/** Tomb's look as an engine {@link SurfaceShader}: procedural wall/floor/ceiling
 *  colour plus the game's distance fog, side shading, and baked lighting. */
export class TombSurfaceShader implements SurfaceShader {
  constructor(
    private readonly tileMap: TileMap<TombCell>,
    private readonly themes: LevelTheme[],
    private readonly lightGrid: LightGrid,
  ) {}

  wallPixel(sample: WallSample, out: SurfaceColor): void {
    const cell = this.tileMap.get(sample.mapColumn, sample.mapRow)
    const textureId = cell?.textureId ?? 1
    const theme = themeFor(this.themes, cell)
    // Bitmap-textured materials sample a Texture; everything else is procedural.
    const bitmap = TOMB_WALL_TEXTURES.get(textureId)
    let base: SurfaceColor
    if (bitmap) {
      bitmap.sampleInto(sample.u, sample.v, textureSample)
      base = textureSample
    } else {
      const cellKey = sample.mapColumn * 73856093 + sample.mapRow * 19349663
      base = wallBaseColor(textureId, sample.u, sample.v, sample.distance, cellKey, theme)
    }
    const fade = Math.max(0.15, 1 - sample.distance / theme.fogDistance)
    const side = sample.isSide ? 0.7 : 1
    const k = fade * side
    out.r = (base.r * k) | 0
    out.g = (base.g * k) | 0
    out.b = (base.b * k) | 0
    addLightAt(this.lightGrid, sample.mapColumn, sample.mapRow, out)
  }

  floorPixel(sample: FlatSample, out: SurfaceColor): void {
    const cell = this.tileMap.get(sample.mapColumn, sample.mapRow) ?? null
    const theme = themeFor(this.themes, cell)
    floorPixel(sample.worldX, sample.worldY, cell, theme, out)
    applyHorizonFog(out, sample.distance, false, theme)
    addLightAt(this.lightGrid, sample.mapColumn, sample.mapRow, out)
  }

  ceilingPixel(sample: FlatSample, out: SurfaceColor): void {
    const cell = this.tileMap.get(sample.mapColumn, sample.mapRow) ?? null
    const theme = themeFor(this.themes, cell)
    ceilingPixel(sample.worldX, sample.worldY, cell, theme, out)
    applyHorizonFog(out, sample.distance, true, theme)
    addLightAt(this.lightGrid, sample.mapColumn, sample.mapRow, out)
  }
}
