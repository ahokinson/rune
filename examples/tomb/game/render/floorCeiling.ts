import type { LevelTheme, TombCell } from "../map"
import { applyCeilingDecal, applyFloorDecal } from "./decals"

export interface RGB {
  r: number
  g: number
  b: number
}

export type PixelShader = (worldX: number, worldY: number, theme: LevelTheme, out: RGB) => void

export function floorPixel(worldX: number, worldY: number, cell: TombCell | null, theme: LevelTheme, out: RGB): void {
  const tileX = Math.floor(worldX)
  const tileY = Math.floor(worldY)
  const inX = worldX - tileX
  const inY = worldY - tileY
  const mortar = inX < 0.06 || inX > 0.94 || inY < 0.06 || inY > 0.94
  if (mortar) {
    out.r = theme.floorMortarR
    out.g = theme.floorMortarG
    out.b = theme.floorMortarB
  } else {
    const hash = ((tileX * 73856093) ^ (tileY * 19349663)) >>> 0
    const tone = (hash % 9) - 4
    out.r = Math.max(0, theme.floorR + tone * 4)
    out.g = Math.max(0, theme.floorG + tone * 3)
    out.b = Math.max(0, theme.floorB + tone * 2)
  }
  if (cell?.floorDecal) {
    const tileHash = ((tileX * 73856093) ^ (tileY * 19349663)) >>> 0
    applyFloorDecal(cell.floorDecal, inX, inY, tileHash, theme, out)
  }
}

export function ceilingPixel(worldX: number, worldY: number, cell: TombCell | null, theme: LevelTheme, out: RGB): void {
  const tileX = Math.floor(worldX)
  const tileY = Math.floor(worldY)
  const inX = worldX - tileX
  const inY = worldY - tileY
  const hash = ((Math.floor(worldX * 4) * 73856093) ^ (Math.floor(worldY * 4) * 19349663)) >>> 0
  const noise = (hash % 11) - 5
  out.r = Math.max(0, theme.ceilingR + noise)
  out.g = Math.max(0, theme.ceilingG + noise)
  out.b = Math.max(0, theme.ceilingB + noise * 2)
  if (cell?.ceilingDecal) {
    const tileHash = ((tileX * 73856093) ^ (tileY * 19349663)) >>> 0
    applyCeilingDecal(cell.ceilingDecal, inX, inY, tileHash, theme, out)
  }
}

export function applyHorizonFog(out: RGB, distance: number, isCeiling: boolean, theme: LevelTheme): void {
  const horizon = isCeiling ? theme.fogDistance + 4 : theme.fogDistance
  const fade = Math.max(0.08, 1 - distance / horizon)
  out.r = (out.r * fade) | 0
  out.g = (out.g * fade) | 0
  out.b = (out.b * fade) | 0
}
