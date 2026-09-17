import type { LevelTheme } from "../map"
import type { RGB } from "./floorCeiling"

export function wallBaseColor(
  textureId: number,
  u: number,
  v: number,
  distance: number,
  cellKey: number,
  theme: LevelTheme,
): RGB {
  if (textureId === 2) return metalPanel(u, v, theme)
  if (textureId === 3) return crackedStone(u, v, cellKey, theme)
  if (textureId === 4) return bloodStone(u, v, cellKey, theme)
  if (textureId === 5) return runeWall(u, v, cellKey, theme)
  if (textureId === 6) return screenPanel(u, v, distance, theme)
  if (textureId === 7) return hazardStripes(u, v, theme)
  if (textureId === 8) return caveRock(u, v, cellKey, theme)
  if (textureId === 9) return exitGlow(u, v, distance)
  return stoneBrick(u, v, cellKey, theme)
}

const _stone = { r: 0, g: 0, b: 0 }
export function stoneBrick(u: number, v: number, cellKey: number, theme: LevelTheme): RGB {
  const brickHeight = 0.25
  const brickWidth = 0.5
  const course = Math.floor(v / brickHeight)
  const offset = course % 2 === 0 ? 0 : brickWidth * 0.5
  const inCourseV = (v - course * brickHeight) / brickHeight
  const shiftedU = (u + offset) % 1
  const brickIndex = Math.floor(shiftedU / brickWidth)
  const inBrickU = (shiftedU - brickIndex * brickWidth) / brickWidth

  const mortarThicknessU = 0.08
  const mortarThicknessV = 0.12
  const isMortar =
    inBrickU < mortarThicknessU ||
    inBrickU > 1 - mortarThicknessU ||
    inCourseV < mortarThicknessV ||
    inCourseV > 1 - mortarThicknessV

  if (isMortar) {
    _stone.r = theme.stoneMortarR
    _stone.g = theme.stoneMortarG
    _stone.b = theme.stoneMortarB
    return _stone
  }

  const hash = ((cellKey ^ (brickIndex * 2654435761) ^ (course * 40503)) >>> 0) % 11
  const tone = (hash - 5) * 4
  const shade = 1 + (0.5 - inCourseV) * 0.18
  _stone.r = clamp((theme.stoneR + tone) * shade)
  _stone.g = clamp((theme.stoneG + tone) * shade)
  _stone.b = clamp((theme.stoneB + tone * 0.6) * shade)
  return _stone
}

const _metal = { r: 0, g: 0, b: 0 }
export function metalPanel(u: number, v: number, theme: LevelTheme): RGB {
  const panelSeamU = u < 0.04 || u > 0.96
  const midSeamV = v > 0.49 && v < 0.51
  const isSeam = panelSeamU || midSeamV

  const rivetU = u < 0.12 || u > 0.88
  const rivetVTop = v > 0.05 && v < 0.13
  const rivetVMid1 = v > 0.42 && v < 0.5
  const rivetVMid2 = v > 0.5 && v < 0.58
  const rivetVBot = v > 0.87 && v < 0.95
  const isRivet = rivetU && (rivetVTop || rivetVMid1 || rivetVMid2 || rivetVBot)

  if (isSeam) {
    _metal.r = theme.metalSeamR
    _metal.g = theme.metalSeamG
    _metal.b = theme.metalSeamB
    return _metal
  }
  if (isRivet) {
    _metal.r = theme.metalRivetR
    _metal.g = theme.metalRivetG
    _metal.b = theme.metalRivetB
    return _metal
  }

  const shade = 0.92 + Math.sin(u * Math.PI) * 0.08
  _metal.r = (theme.metalR * shade) | 0
  _metal.g = (theme.metalG * shade) | 0
  _metal.b = (theme.metalB * shade) | 0
  return _metal
}

const _exit = { r: 0, g: 0, b: 0 }
export function exitGlow(u: number, v: number, distance: number): RGB {
  const stripe = (u * 4 + v * 4 + distance * 0.5) % 1
  if (stripe < 0.5) {
    _exit.r = 220
    _exit.g = 100
    _exit.b = 100
  } else {
    _exit.r = 255
    _exit.g = 200
    _exit.b = 80
  }
  return _exit
}

const _crack = { r: 0, g: 0, b: 0 }
export function crackedStone(u: number, v: number, cellKey: number, theme: LevelTheme): RGB {
  const base = stoneBrick(u, v, cellKey, theme)
  _crack.r = base.r
  _crack.g = base.g
  _crack.b = base.b

  const h1 = (((cellKey * 2654435761) >>> 0) % 1000) / 1000
  const h2 = (((cellKey * 40503) >>> 0) % 1000) / 1000
  const h3 = (((cellKey * 19349663) >>> 0) % 1000) / 1000

  const crack1Path = h1 * 0.6 + 0.2 + (v - 0.5) * (h2 - 0.5) * 0.8
  const crack2Path = h3 * 0.6 + 0.2 + (u - 0.5) * (h1 - 0.5) * 0.8
  const crack1 = Math.abs(u - crack1Path) < 0.018
  const crack2 = Math.abs(v - crack2Path) < 0.018

  if (crack1 || crack2) {
    _crack.r = (_crack.r * 0.35) | 0
    _crack.g = (_crack.g * 0.35) | 0
    _crack.b = (_crack.b * 0.35) | 0
  }
  return _crack
}

const _blood = { r: 0, g: 0, b: 0 }
export function bloodStone(u: number, v: number, cellKey: number, theme: LevelTheme): RGB {
  const base = stoneBrick(u, v, cellKey, theme)
  _blood.r = base.r
  _blood.g = base.g
  _blood.b = base.b

  const streakCount = 2 + ((cellKey >>> 0) % 3)
  for (let i = 0; i < streakCount; i++) {
    const key = (cellKey ^ (i * 2654435761)) >>> 0
    const streakU = (key % 1000) / 1000
    const startV = ((((key * 40503) >>> 0) % 1000) / 1000) * 0.4
    const endV = startV + 0.4 + (((key * 19349663) >>> 0) % 600) / 1000
    const width = 0.025 + (((key * 73856093) >>> 0) % 30) / 1000
    if (Math.abs(u - streakU) < width && v > startV && v < endV) {
      const intensity = 0.55 + ((v - startV) / Math.max(0.001, endV - startV)) * 0.35
      _blood.r = clamp(_blood.r * (1 - intensity) + 150 * intensity)
      _blood.g = clamp(_blood.g * (1 - intensity) + 20 * intensity)
      _blood.b = clamp(_blood.b * (1 - intensity) + 18 * intensity)
    }
  }
  return _blood
}

const _rune = { r: 0, g: 0, b: 0 }
export function runeWall(u: number, v: number, cellKey: number, theme: LevelTheme): RGB {
  const base = stoneBrick(u, v, cellKey, theme)
  _rune.r = base.r
  _rune.g = base.g
  _rune.b = base.b

  const cu = u - 0.5
  const cv = v - 0.5
  const variant = (cellKey >>> 0) % 4

  let onGlyph = false
  if (variant === 0) {
    onGlyph = (Math.abs(cu) < 0.04 && Math.abs(cv) < 0.22) || (Math.abs(cv) < 0.04 && Math.abs(cu) < 0.22)
  } else if (variant === 1) {
    onGlyph = Math.abs(Math.abs(cu) + Math.abs(cv) - 0.2) < 0.04 && Math.abs(cu) < 0.22 && Math.abs(cv) < 0.22
  } else if (variant === 2) {
    const r = Math.sqrt(cu * cu + cv * cv)
    onGlyph = Math.abs(r - 0.18) < 0.035
  } else {
    onGlyph = (Math.abs(cu) < 0.04 || Math.abs(cv) < 0.04) && Math.abs(cu) < 0.18 && Math.abs(cv) < 0.18
  }

  if (onGlyph) {
    _rune.r = theme.glowR
    _rune.g = theme.glowG
    _rune.b = theme.glowB
  }
  return _rune
}

const _screen = { r: 0, g: 0, b: 0 }
export function screenPanel(u: number, v: number, distance: number, theme: LevelTheme): RGB {
  const base = metalPanel(u, v, theme)
  _screen.r = base.r
  _screen.g = base.g
  _screen.b = base.b

  const inScreenU = u > 0.18 && u < 0.82
  const inScreenV = v > 0.18 && v < 0.82
  if (!inScreenU || !inScreenV) return _screen

  const phase = (v * 24 + distance * 1.2) % 1
  const lineIntensity = phase < 0.5 ? 0.85 : 0.45
  const screenBgR = (theme.glowR * 0.18) | 0
  const screenBgG = (theme.glowG * 0.18) | 0
  const screenBgB = (theme.glowB * 0.18) | 0
  _screen.r = clamp(screenBgR + theme.glowR * lineIntensity * 0.45)
  _screen.g = clamp(screenBgG + theme.glowG * lineIntensity * 0.45)
  _screen.b = clamp(screenBgB + theme.glowB * lineIntensity * 0.45)
  return _screen
}

const _hazard = { r: 0, g: 0, b: 0 }
export function hazardStripes(u: number, v: number, theme: LevelTheme): RGB {
  const stripe = ((u + v) * 5) % 1
  const isWarn = stripe < 0.5
  if (isWarn) {
    _hazard.r = theme.hazardR
    _hazard.g = theme.hazardG
    _hazard.b = theme.hazardB
  } else {
    _hazard.r = theme.metalSeamR
    _hazard.g = theme.metalSeamG
    _hazard.b = theme.metalSeamB
  }
  return _hazard
}

const _cave = { r: 0, g: 0, b: 0 }
export function caveRock(u: number, v: number, cellKey: number, theme: LevelTheme): RGB {
  const px = Math.floor(u * 16)
  const py = Math.floor(v * 16)
  const hash = ((cellKey ^ (px * 2654435761) ^ (py * 40503)) >>> 0) % 23
  const tone = (hash - 11) * 5
  const shade = 0.85 + (((cellKey ^ (px * 19349663)) >>> 0) % 30) / 100
  _cave.r = clamp((theme.stoneR + tone) * shade * 0.85)
  _cave.g = clamp((theme.stoneG + tone * 0.8) * shade * 0.85)
  _cave.b = clamp((theme.stoneB + tone * 0.6) * shade * 0.85)
  return _cave
}

function clamp(value: number): number {
  if (value < 0) return 0
  if (value > 255) return 255
  return value | 0
}
