import { loadTileMap, type TileMap, TileMeta, Vector2 } from "@ahokinson/rune"

// One tile is a TILE×TILE block of terminal cells. The whole simulation works in
// "cells" (world units); a tile at column c, row r covers the cell rectangle
// (c*TILE, r*TILE, TILE, TILE).
export const TILE = 3

export type Cell = "empty" | "ground" | "brick" | "question" | "questionUsed" | "pipe" | "hidden"

// Cells the runner (and enemies) cannot pass through. "hidden" is intentionally
// absent: an invisible block is passable until the runner bonks it from below,
// at which point it is rewritten to a solid spent block.
export const SOLID = new Set<Cell>(["ground", "brick", "question", "questionUsed", "pipe"])

export function isSolid(cell: Cell | undefined): boolean {
  return cell !== undefined && SOLID.has(cell)
}

// What a "?"/brick/hidden block yields when bonked from below.
export enum BlockContent {
  Coin = "coin",
  MultiCoin = "multiCoin",
  Powerup = "powerup",
  Star = "star",
  OneUp = "oneUp",
}

// World 1-1 is 13 rows tall: the floor is rows 11–12, the bonk-able block line
// sits at row 6, platforms at row 3. The authored course lives in
// assets/world-1-1.yaml; these mirror its dimensions for camera clamping.
export const HEIGHT = 13
const WIDTH = 212

// World cell column of the flag, and of the castle the runner walks into after
// touching it.
export const GOAL_COLUMN = 198
export const CASTLE_COLUMN = 203

export interface LevelMarkers {
  // Foot position (bottom-center, in cells) the runner and enemies spawn on.
  playerSpawn: Vector2
  goombas: Vector2[]
  koopas: Vector2[]
  // Center (in cells) of each free-floating coin.
  coins: Vector2[]
  // World X (cells) of the goal flag; reaching it clears the course.
  goalX: number
}

// Legend specs are just the cell kind; marker specs name a spawn or a block
// payload. Payload symbols ("?", u, t, *, 1) appear in both the YAML legend and
// markers tables, so they become terrain that also drops an item when bonked.
type MarkerSpec =
  | "player"
  | "goomba"
  | "koopa"
  | "freeCoin"
  | "goal"
  | "coin"
  | "powerup"
  | "multiCoin"
  | "star"
  | "oneUp"

const CONTENT_OF: Partial<Record<MarkerSpec, BlockContent>> = {
  coin: BlockContent.Coin,
  powerup: BlockContent.Powerup,
  multiCoin: BlockContent.MultiCoin,
  star: BlockContent.Star,
  oneUp: BlockContent.OneUp,
}

// Load the course: terrain grid from the legend, plus the spawn markers and block
// payloads scanned out of the same layout. Block payloads land in `contents`,
// keyed by tile, for the bump logic to consult.
export function loadLevel(): { tiles: TileMap<Cell>; markers: LevelMarkers; contents: TileMeta<BlockContent> } {
  const data = loadTileMap<Cell, Cell, MarkerSpec>(`${import.meta.dir}/assets/world-1-1.yaml`, {
    cell: (spec) => spec,
    fallback: "empty",
  })

  const markers: LevelMarkers = { playerSpawn: new Vector2(0, 0), goombas: [], koopas: [], coins: [], goalX: 0 }
  const contents = new TileMeta<BlockContent>()
  for (const marker of data.markers) {
    const foot = new Vector2(marker.column * TILE + TILE / 2, (marker.row + 1) * TILE)
    const center = new Vector2(marker.column * TILE + TILE / 2, marker.row * TILE + TILE / 2)
    const content = CONTENT_OF[marker.spec]
    if (content !== undefined) contents.set(marker.column, marker.row, content)
    switch (marker.spec) {
      case "player":
        markers.playerSpawn = foot
        break
      case "goomba":
        markers.goombas.push(foot)
        break
      case "koopa":
        markers.koopas.push(foot)
        break
      case "freeCoin":
        markers.coins.push(center)
        break
      case "goal":
        markers.goalX = marker.column * TILE
        break
    }
  }
  return { tiles: data.tileMap, markers, contents }
}

export const WIDTH_CELLS = WIDTH * TILE
export const HEIGHT_CELLS = HEIGHT * TILE
