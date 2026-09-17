/**
 * Headless smoke check for the bitmap-texture path: renders a wall of the
 * textured material (textureId 10) through the production TombSurfaceShader and
 * confirms the sigil texture is actually sampled (the wall shows several
 * distinct colours, including the rune glow) rather than a flat procedural fill.
 *
 * Run with `bun run examples/tomb/scripts/verify-textures.ts`.
 */
import {
  Angle,
  Camera,
  ColumnDepthBuffer,
  InMemoryCanvas,
  RaycastProjection,
  renderGridSurfaces,
  TileMap,
  Vector2,
} from "@ahokinson/rune"
import type { LevelTheme, TombCell } from "../game/map"
import { bakeLightGrid } from "../game/render/lightGrid"
import { TombSurfaceShader, TombSurfaces } from "../game/render/surfaces"
import { TEXTURED_WALL_ID } from "../game/render/textures"

const COLUMNS = 60
const ROWS = 34

function makeTheme(): LevelTheme {
  return {
    stoneR: 90,
    stoneG: 80,
    stoneB: 70,
    stoneMortarR: 40,
    stoneMortarG: 38,
    stoneMortarB: 35,
    metalR: 120,
    metalG: 124,
    metalB: 130,
    metalSeamR: 60,
    metalSeamG: 62,
    metalSeamB: 66,
    metalRivetR: 160,
    metalRivetG: 162,
    metalRivetB: 168,
    floorR: 70,
    floorG: 64,
    floorB: 58,
    floorMortarR: 30,
    floorMortarG: 28,
    floorMortarB: 26,
    ceilingR: 40,
    ceilingG: 42,
    ceilingB: 50,
    glowR: 220,
    glowG: 120,
    glowB: 60,
    hazardR: 210,
    hazardG: 180,
    hazardB: 40,
    fogDistance: 30,
  }
}

function cell(partial: Partial<TombCell>): TombCell {
  return {
    solid: false,
    textureId: 1,
    floorHeight: 0,
    ceilingHeight: 1.7,
    floorDecal: 0,
    ceilingDecal: 0,
    themeId: 0,
    hazard: 0,
    isDoor: false,
    doorClosedTextureId: 1,
    doorOpenTextureId: 0,
    doorClosedCeilingHeight: 1.7,
    doorOpenCeilingHeight: 1.7,
    ...partial,
  }
}

// A short corridor facing a textured wall two cells ahead.
const source = ["#####", "#...#", "#...#", "#TTT#", "#####"].join("\n")
const legend: Record<string, TombCell> = {
  "#": cell({ solid: true, textureId: 1 }),
  ".": cell({}),
  T: cell({ solid: true, textureId: TEXTURED_WALL_ID }),
}
const tileMap = TileMap.fromString<TombCell>(source, legend, cell({ solid: true }))
const themes = [makeTheme()]
const lightGrid = bakeLightGrid(5, 5, [])

const projection = new RaycastProjection({ yaw: Angle.fromDegrees(90) }) // face +y (toward the T wall)
const camera = new Camera(new Vector2(2.5, 1.6), projection)
const canvas = new InMemoryCanvas(COLUMNS, ROWS)
const depth = new ColumnDepthBuffer(COLUMNS, ROWS)
depth.clear()
renderGridSurfaces({
  canvas,
  camera,
  projection,
  surfaces: new TombSurfaces(tileMap),
  shader: new TombSurfaceShader(tileMap, themes, lightGrid),
  depthBuffer: depth,
  screenColumns: COLUMNS,
  screenRows: ROWS,
  eyeZ: 0.5,
})

// Collect distinct foreground colours from the central wall band.
const colors = new Set<string>()
let sawGlow = false
const midRow = Math.floor(ROWS / 2)
for (let y = midRow - 4; y <= midRow + 4; y++) {
  for (let x = 0; x < COLUMNS; x++) {
    const c = canvas.cellAt(x, y)
    if (!c) continue
    const { red, green, blue } = c.foreground.toBytes()
    colors.add(`${red},${green},${blue}`)
    // Rune glow is warm: clearly red-dominant with low blue.
    if (red > 120 && red > green + 40 && green > blue) sawGlow = true
  }
}

console.log(`distinct wall-band colours: ${colors.size}`)
console.log(`saw rune glow: ${sawGlow}`)
if (colors.size < 3 || !sawGlow) {
  console.error("FAIL: textured wall did not sample the sigil as expected")
  process.exit(1)
}
console.log("OK: textured wall sampled the bitmap sigil")
