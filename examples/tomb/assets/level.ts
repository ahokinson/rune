import {
  data,
  type Ref,
  ref,
  TileAnchor,
  type TileMap,
  TileMapAsset,
  type TileMapDocument,
  type TileMarker,
  Vector2,
} from "@ahokinson/rune"
import { bakeLightGrid, type LightAuthor, type LightGrid } from "../game/render/lightGrid"
import type { LevelTheme, ThemeAsset } from "./theme"

export interface TombCell {
  solid: boolean
  textureId: number
  floorHeight: number
  ceilingHeight: number
  floorDecal: number
  ceilingDecal: number
  themeId: number
  hazard: number
  isDoor: boolean
  doorClosedTextureId: number
  doorOpenTextureId: number
  doorClosedCeilingHeight: number
  doorOpenCeilingHeight: number
}

export type SpawnKind = "imp" | "hellknight" | "health" | "ammo" | "decoration"

export interface SpawnPoint {
  position: Vector2
  kind: SpawnKind
  amount: number
  spawnRef?: string
}

export interface LevelLayout {
  tileMap: TileMap<TombCell>
  playerStart: Vector2
  exitCenter: Vector2
  spawns: SpawnPoint[]
  theme: LevelTheme
  extraThemeNames: string[]
  authoredLights: LightAuthor[]
  lightGrid: LightGrid
  levelWidth: number
  levelHeight: number
}

// A legend entry: the static properties of a cell kind.
interface CharEntry {
  solid: boolean
  textureId: number
  floorHeight?: number
  ceilingHeight?: number
  floorDecal?: number
  ceilingDecal?: number
  themeId?: number
  hazard?: number
  door?: {
    closedTextureId?: number
    openTextureId?: number
  }
}

// A marker entry: a bare spawn name, or a pickup/decoration with its detail.
interface SpawnEntry {
  pickup?: string
  amount?: number
  decoration?: string
}

// The authored level document: the engine tile-map shape (legend/markers/layout)
// plus tomb's level-specific fields.
interface LevelDocument extends TileMapDocument<CharEntry, string | SpawnEntry> {
  name: string
  theme: string
  extraThemes?: string[]
  lights?: LightAuthor[]
}

const DEFAULT_CEILING = 1.7
const FLOOR: TombCell = {
  solid: false,
  textureId: 0,
  floorHeight: 0,
  ceilingHeight: DEFAULT_CEILING,
  floorDecal: 0,
  ceilingDecal: 0,
  themeId: 0,
  hazard: 0,
  isDoor: false,
  doorClosedTextureId: 0,
  doorOpenTextureId: 0,
  doorClosedCeilingHeight: DEFAULT_CEILING,
  doorOpenCeilingHeight: DEFAULT_CEILING,
}

export class LevelAsset extends TileMapAsset<CharEntry, string | SpawnEntry> {
  declare theme: Ref<ThemeAsset>
  declare document: LevelDocument
  declare layout: LevelLayout

  static override schema = {
    theme: ref<ThemeAsset>(),
    document: data<LevelDocument>((raw) => raw as LevelDocument),
  } as const

  static finalize(asset: LevelAsset) {
    asset.layout = buildLayout(asset, asset.theme.get().theme)
  }
}

export function isBlocking(tileMap: TileMap<TombCell>, column: number, row: number): boolean {
  const cell = tileMap.get(column, row)
  return cell?.solid ?? true
}

export function getFloorHeight(tileMap: TileMap<TombCell>, column: number, row: number): number {
  return tileMap.get(column, row)?.floorHeight ?? 0
}

export function getCeilingHeight(tileMap: TileMap<TombCell>, column: number, row: number): number {
  return tileMap.get(column, row)?.ceilingHeight ?? 1
}

export function getHazard(tileMap: TileMap<TombCell>, column: number, row: number): number {
  return tileMap.get(column, row)?.hazard ?? 0
}

export function getThemeId(tileMap: TileMap<TombCell>, column: number, row: number): number {
  return tileMap.get(column, row)?.themeId ?? 0
}

/** World-space Z of the floor under a position, plus an entity-specific offset. */
export function floorWorldZ(tileMap: TileMap<TombCell>, position: Vector2, offset: number): number {
  return getFloorHeight(tileMap, Math.floor(position.x), Math.floor(position.y)) + offset
}

/**
 * Open or close the door cell at (column, row). Returns true if it just opened,
 * false if it just closed, or null if the cell is not a door.
 */
export function toggleDoor(tileMap: TileMap<TombCell>, column: number, row: number): boolean | null {
  const cell = tileMap.get(column, row)
  if (!cell?.isDoor) return null
  const opening = cell.solid
  cell.solid = !opening
  cell.textureId = opening ? cell.doorOpenTextureId : cell.doorClosedTextureId
  cell.ceilingHeight = opening ? cell.doorOpenCeilingHeight : cell.doorClosedCeilingHeight
  return opening
}

function tombCell(entry: CharEntry): TombCell {
  const isDoor = entry.door !== undefined
  return {
    solid: entry.solid,
    textureId: entry.textureId,
    floorHeight: entry.floorHeight ?? 0,
    ceilingHeight: entry.ceilingHeight ?? DEFAULT_CEILING,
    floorDecal: entry.floorDecal ?? 0,
    ceilingDecal: entry.ceilingDecal ?? 0,
    themeId: entry.themeId ?? 0,
    hazard: entry.hazard ?? 0,
    isDoor,
    doorClosedTextureId: entry.door?.closedTextureId ?? entry.textureId,
    doorOpenTextureId: entry.door?.openTextureId ?? entry.textureId,
    doorClosedCeilingHeight: entry.ceilingHeight ?? DEFAULT_CEILING,
    doorOpenCeilingHeight: DEFAULT_CEILING,
  }
}

function collectSpawns(markers: TileMarker<string | SpawnEntry>[]): {
  playerStart: Vector2
  exitCenter: Vector2
  spawns: SpawnPoint[]
} {
  let playerStart = new Vector2(1.5, 1.5)
  let exitCenter = new Vector2(1.5, 1.5)
  const spawns: SpawnPoint[] = []
  for (const marker of markers) {
    const def = marker.spec
    const position = marker.position
    if (typeof def === "string") {
      if (def === "player") {
        playerStart = position
      } else if (def === "exit") {
        exitCenter = position
      } else {
        spawns.push({ position, kind: def as SpawnKind, amount: 0 })
      }
    } else if (def.decoration) {
      spawns.push({ position, kind: "decoration", amount: 0, spawnRef: def.decoration })
    } else {
      spawns.push({ position, kind: def.pickup as SpawnKind, amount: def.amount ?? 0 })
    }
  }
  return { playerStart, exitCenter, spawns }
}

function buildLayout(asset: LevelAsset, theme: LevelTheme): LevelLayout {
  const document = asset.document
  // Pad ragged rows with solid wall so the right edge stays enclosed, and default
  // an undeclared exit pad to the exit texture — both preserved from the original.
  document.layout = padMap(document.layout)
  if (!("E" in document.legend)) document.legend.E = { solid: false, textureId: 9 }

  const data = asset.build<TombCell>({
    cell: (entry) => tombCell(entry),
    fallback: FLOOR,
    anchor: TileAnchor.Center,
  })
  const tileMap = data.tileMap
  // TileMap.fromString stores one shared object per symbol; give each door cell
  // its own copy so doors open independently.
  for (let row = 0; row < tileMap.height; row++) {
    for (let col = 0; col < tileMap.width; col++) {
      const cell = tileMap.get(col, row)
      if (cell?.isDoor) tileMap.set(col, row, { ...cell })
    }
  }

  const { playerStart, exitCenter, spawns } = collectSpawns(data.markers)
  const authoredLights = document.lights ?? []
  const lightGrid = bakeLightGrid(tileMap.width, tileMap.height, authoredLights)
  return {
    tileMap,
    playerStart,
    exitCenter,
    spawns,
    theme,
    extraThemeNames: document.extraThemes ?? [],
    authoredLights,
    lightGrid,
    levelWidth: tileMap.width,
    levelHeight: tileMap.height,
  }
}

function padMap(map: string): string {
  const lines = map.split("\n").filter((l) => l.length > 0)
  const maxWidth = Math.max(...lines.map((l) => l.length))
  return lines.map((l) => l.padEnd(maxWidth, "#")).join("\n")
}
