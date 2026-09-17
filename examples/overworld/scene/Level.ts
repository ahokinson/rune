import { type Camera, type CanvasSurface, Entity2D, type Rectangle, TileLayer, type TileMap, TileMeta } from "@ahokinson/rune"
import {
  BlockContent,
  CASTLE_COLUMN,
  type Cell,
  HEIGHT,
  HEIGHT_CELLS,
  type LevelMarkers,
  TILE,
  WIDTH_CELLS,
} from "../level"
import * as theme from "../theme"
import { buildTerrainTileSet } from "./terrain"

// How many coins the ten-coin brick yields before it spends itself.
const MULTI_COIN_TOTAL = 10

// What the runner should do with a bonk: play a coin pop, shatter a brick, or
// nothing (a plain nudge). Items that leave the block (mushroom/flower/star/1-up)
// come back in `spawn` so the caller can drop the entity into the scene.
export interface BumpResult {
  effect: "none" | "coin" | "shatter"
  spawn: BlockContent | null
  // World cell center of the bumped tile (for spawning effects/items).
  x: number
  y: number
}

// The static course: terrain tiles, the parallax backdrop, the goal flag, and the
// end castle. It owns the collision query the moving entities sweep against, and
// animates blocks the runner bonks from below. Terrain rendering and the bonk
// bounce are delegated to a TileLayer; this class keeps the game-specific decor
// (backdrop/flag/castle) and the bonk rules.
export interface LevelOptions {
  tiles: TileMap<Cell>
  markers: LevelMarkers
  contents: TileMeta<BlockContent>
}

export class Level extends Entity2D {
  private readonly layer: TileLayer<Cell>
  private readonly tiles: TileMap<Cell>
  private readonly contents: TileMeta<BlockContent>
  // Remaining coins in each ten-coin brick.
  private readonly multiCoins = new TileMeta<number>()
  readonly markers: LevelMarkers

  constructor(options: LevelOptions) {
    super({ zIndex: 0 })
    this.tiles = options.tiles
    this.markers = options.markers
    this.contents = options.contents
    this.layer = new TileLayer<Cell>({ tileMap: this.tiles, tileSet: buildTerrainTileSet(), tileSize: TILE })
  }

  // Solid tile rectangles overlapping `box` expanded by `pad` on every side — the
  // small obstacle set the swept-AABB resolver needs, instead of the whole map.
  collidersNear(box: Rectangle, pad: number): Rectangle[] {
    return this.layer.collidersNear(box, pad)
  }

  // The cell at a world position (cells), or undefined off-map.
  cellAt(x: number, y: number): Cell | undefined {
    return this.tiles.get(Math.floor(x / TILE), Math.floor(y / TILE))
  }

  // React to a tile bonked from below. `canBreak` is true for big/fire Mario, who
  // smashes plain bricks; small Mario only nudges them. Question blocks spend into
  // a used block (and may release an item); the ten-coin brick dribbles coins;
  // the star brick releases the Starman; hidden blocks pop into existence.
  bumpAt(tile: Rectangle, canBreak: boolean): BumpResult {
    const column = Math.round(tile.x / TILE)
    const row = Math.round(tile.y / TILE)
    const cell = this.tiles.get(column, row)
    const x = column * TILE + TILE / 2
    const y = row * TILE + TILE / 2
    const none: BumpResult = { effect: "none", spawn: null, x, y }

    if (cell === "question" || cell === "hidden") {
      this.tiles.set(column, row, "questionUsed")
      this.layer.bump(column, row)
      const content = this.contents.get(column, row) ?? BlockContent.Coin
      if (content === BlockContent.Coin) return { effect: "coin", spawn: null, x, y }
      return { effect: "none", spawn: content, x, y }
    }

    if (cell === "brick") {
      const content = this.contents.get(column, row)
      if (content === BlockContent.MultiCoin) {
        const left = this.multiCoins.get(column, row) ?? MULTI_COIN_TOTAL
        this.layer.bump(column, row)
        if (left <= 1) this.tiles.set(column, row, "questionUsed")
        else this.multiCoins.set(column, row, left - 1)
        return { effect: "coin", spawn: null, x, y }
      }
      if (content === BlockContent.Star) {
        this.tiles.set(column, row, "questionUsed")
        this.layer.bump(column, row)
        return { effect: "none", spawn: BlockContent.Star, x, y }
      }
      if (canBreak) {
        this.tiles.set(column, row, "empty")
        return { effect: "shatter", spawn: null, x, y }
      }
      this.layer.bump(column, row)
      return none
    }

    return none
  }

  override update(deltaMilliseconds: number): void {
    this.layer.update(deltaMilliseconds)
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    const cameraX = camera.position.x
    const cameraY = camera.position.y
    this.drawBackdrop(canvas, cameraX, cameraY)
    this.layer.draw(canvas, camera)
    this.drawCastle(canvas, cameraX, cameraY)
    this.drawFlag(canvas, cameraX, cameraY)
  }

  // Two parallax layers: distant clouds drift slowest, nearer hills a bit faster,
  // so depth reads as the camera tracks the runner across the course.
  private drawBackdrop(canvas: CanvasSurface, cameraX: number, cameraY: number): void {
    const hillBase = Math.round((HEIGHT - 2) * TILE - cameraY)
    const hillSpacing = 22
    const hillFirst = Math.floor((cameraX * 0.5) / hillSpacing) - 1
    const hillLast = Math.ceil((cameraX * 0.5 + canvas.width) / hillSpacing) + 1
    for (let i = hillFirst; i <= hillLast; i++) {
      this.drawHill(canvas, Math.round(i * hillSpacing - cameraX * 0.5), hillBase)
    }

    const cloudSpacing = 30
    const cloudFirst = Math.floor((cameraX * 0.25) / cloudSpacing) - 1
    const cloudLast = Math.ceil((cameraX * 0.25 + canvas.width) / cloudSpacing) + 1
    for (let i = cloudFirst; i <= cloudLast; i++) {
      const screenY = 2 + (((i % 3) + 3) % 3)
      this.drawCloud(canvas, Math.round(i * cloudSpacing - cameraX * 0.25), screenY)
    }
  }

  private drawHill(canvas: CanvasSurface, x: number, baseY: number): void {
    const rows = ["  ▄▄▄▄▄  ", " ▟███████▙", "▟█████████▙"]
    for (let r = 0; r < rows.length; r++) {
      const line = rows[r]!
      const y = baseY - (rows.length - r)
      for (let c = 0; c < line.length; c++) {
        if (line[c] === " ") continue
        canvas.setCell(x + c, y, line[c]!, r === 0 ? theme.HILL : theme.HILL_DARK)
      }
    }
  }

  private drawCloud(canvas: CanvasSurface, x: number, y: number): void {
    canvas.drawText(x, y, " ▟██▙", theme.CLOUD)
    canvas.drawText(x, y + 1, "██████", theme.CLOUD)
  }

  private drawFlag(canvas: CanvasSurface, cameraX: number, cameraY: number): void {
    const poleX = Math.round(this.markers.goalX + TILE / 2 - cameraX)
    if (poleX < -4 || poleX > canvas.width + 4) return
    const top = Math.round(2 * TILE - cameraY)
    const groundTop = Math.round((HEIGHT - 2) * TILE - cameraY)
    for (let y = top; y < groundTop; y++) canvas.setCell(poleX, y, "│", theme.FLAG_POLE)
    canvas.setCell(poleX, top - 1, "▲", theme.FLAG_POLE)
    canvas.drawText(poleX + 1, top, "███", theme.FLAG)
    canvas.drawText(poleX + 1, top + 1, "██", theme.FLAG)
  }

  // The end castle: a blocky keep with crenellations, a window, and a dark door,
  // anchored on the floor like the flag and clipped when off-screen.
  private drawCastle(canvas: CanvasSurface, cameraX: number, cameraY: number): void {
    const art = [
      " █ █ █ █ █ ",
      " █████████ ",
      "  █ ███ █  ",
      " █████████ ",
      " ████w████ ",
      " █████████ ",
      " ███ D ███ ",
      "███████████",
      "███████████",
    ]
    const baseX = Math.round(CASTLE_COLUMN * TILE - cameraX)
    if (baseX < -art[0]!.length || baseX > canvas.width + 4) return
    const groundTop = Math.round((HEIGHT - 2) * TILE - cameraY)
    const topY = groundTop - art.length
    for (let r = 0; r < art.length; r++) {
      const line = art[r]!
      for (let c = 0; c < line.length; c++) {
        const glyph = line[c]!
        if (glyph === " ") continue
        const color = glyph === "D" ? theme.CASTLE_DOOR : glyph === "w" ? theme.CASTLE_WINDOW : theme.CASTLE
        canvas.setCell(baseX + c, topY + r, "█", color)
      }
    }
  }
}

export const LEVEL_WIDTH_CELLS = WIDTH_CELLS
export const LEVEL_HEIGHT_CELLS = HEIGHT_CELLS
