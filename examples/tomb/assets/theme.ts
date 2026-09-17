import { Asset, type ColorData, data, parseColor } from "@ahokinson/rune"

export interface ThemeData {
  type: "theme"
  name: string
  stone: ColorData
  stoneMortar: ColorData
  metal: ColorData
  metalSeam: ColorData
  metalRivet: ColorData
  floor: ColorData
  floorMortar: ColorData
  ceiling: ColorData
  glow: ColorData
  hazard: ColorData
  fogDistance: number
}

export interface LevelTheme {
  stoneR: number
  stoneG: number
  stoneB: number
  stoneMortarR: number
  stoneMortarG: number
  stoneMortarB: number
  metalR: number
  metalG: number
  metalB: number
  metalSeamR: number
  metalSeamG: number
  metalSeamB: number
  metalRivetR: number
  metalRivetG: number
  metalRivetB: number
  floorR: number
  floorG: number
  floorB: number
  floorMortarR: number
  floorMortarG: number
  floorMortarB: number
  ceilingR: number
  ceilingG: number
  ceilingB: number
  glowR: number
  glowG: number
  glowB: number
  hazardR: number
  hazardG: number
  hazardB: number
  fogDistance: number
}

export class ThemeAsset extends Asset {
  declare raw: ThemeData
  declare theme: LevelTheme

  static schema = {
    raw: data<ThemeData>(),
  } as const

  static finalize(asset: ThemeAsset) {
    asset.theme = buildLevelTheme(asset.raw)
  }
}

function buildLevelTheme(d: ThemeData): LevelTheme {
  const stone = parseColor(d.stone).toBytes()
  const stoneMortar = parseColor(d.stoneMortar).toBytes()
  const metal = parseColor(d.metal).toBytes()
  const metalSeam = parseColor(d.metalSeam).toBytes()
  const metalRivet = parseColor(d.metalRivet).toBytes()
  const floor = parseColor(d.floor).toBytes()
  const floorMortar = parseColor(d.floorMortar).toBytes()
  const ceiling = parseColor(d.ceiling).toBytes()
  const glow = parseColor(d.glow).toBytes()
  const hazard = parseColor(d.hazard).toBytes()
  return {
    stoneR: stone.red,
    stoneG: stone.green,
    stoneB: stone.blue,
    stoneMortarR: stoneMortar.red,
    stoneMortarG: stoneMortar.green,
    stoneMortarB: stoneMortar.blue,
    metalR: metal.red,
    metalG: metal.green,
    metalB: metal.blue,
    metalSeamR: metalSeam.red,
    metalSeamG: metalSeam.green,
    metalSeamB: metalSeam.blue,
    metalRivetR: metalRivet.red,
    metalRivetG: metalRivet.green,
    metalRivetB: metalRivet.blue,
    floorR: floor.red,
    floorG: floor.green,
    floorB: floor.blue,
    floorMortarR: floorMortar.red,
    floorMortarG: floorMortar.green,
    floorMortarB: floorMortar.blue,
    ceilingR: ceiling.red,
    ceilingG: ceiling.green,
    ceilingB: ceiling.blue,
    glowR: glow.red,
    glowG: glow.green,
    glowB: glow.blue,
    hazardR: hazard.red,
    hazardG: hazard.green,
    hazardB: hazard.blue,
    fogDistance: d.fogDistance,
  }
}
