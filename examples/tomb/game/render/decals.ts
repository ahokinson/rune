import type { LevelTheme } from "../map"
import type { RGB } from "./floorCeiling"

export function applyFloorDecal(
  id: number,
  inX: number,
  inY: number,
  tileHash: number,
  theme: LevelTheme,
  out: RGB,
): void {
  if (id === 1) bloodstain(inX, inY, tileHash, out)
  else if (id === 2) hazardStripes(inX, inY, theme, out)
  else if (id === 3) arcaneCircle(inX, inY, theme, out)
  else if (id === 4) ventGrate(inX, inY, theme, out)
  else if (id === 5) debrisLitter(inX, inY, tileHash, out)
  else if (id === 6) crackedTile(inX, inY, tileHash, out)
}

export function applyCeilingDecal(
  id: number,
  inX: number,
  inY: number,
  tileHash: number,
  theme: LevelTheme,
  out: RGB,
): void {
  if (id === 1) lightFixture(inX, inY, theme, out)
  else if (id === 2) ceilingGrate(inX, inY, theme, out)
  else if (id === 3) ceilingPipe(inX, inY, tileHash, theme, out)
}

function bloodstain(inX: number, inY: number, tileHash: number, out: RGB): void {
  const splats = 3
  for (let i = 0; i < splats; i++) {
    const key = (tileHash ^ (i * 2654435761)) >>> 0
    const cx = (key % 1000) / 1000
    const cy = (((key * 40503) >>> 0) % 1000) / 1000
    const radius = 0.12 + (((key * 19349663) >>> 0) % 100) / 1000
    const dx = inX - cx
    const dy = inY - cy
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < radius) {
      const k = 1 - d / radius
      const intensity = 0.55 + k * 0.35
      out.r = clamp(out.r * (1 - intensity) + 130 * intensity)
      out.g = clamp(out.g * (1 - intensity) + 18 * intensity)
      out.b = clamp(out.b * (1 - intensity) + 16 * intensity)
    }
  }
}

function hazardStripes(inX: number, inY: number, theme: LevelTheme, out: RGB): void {
  const margin = 0.12
  if (inX < margin || inX > 1 - margin || inY < margin || inY > 1 - margin) return
  const stripe = ((inX + inY) * 6) % 1
  const isWarn = stripe < 0.5
  if (isWarn) {
    out.r = theme.hazardR
    out.g = theme.hazardG
    out.b = theme.hazardB
  } else {
    out.r = (out.r * 0.3) | 0
    out.g = (out.g * 0.3) | 0
    out.b = (out.b * 0.3) | 0
  }
}

function arcaneCircle(inX: number, inY: number, theme: LevelTheme, out: RGB): void {
  const cx = inX - 0.5
  const cy = inY - 0.5
  const r = Math.sqrt(cx * cx + cy * cy)
  const onRing = Math.abs(r - 0.36) < 0.025 || Math.abs(r - 0.28) < 0.012
  const angle = Math.atan2(cy, cx)
  const spokeCount = 6
  const spokeAngle = (angle + Math.PI) % ((Math.PI * 2) / spokeCount)
  const onSpoke = r > 0.18 && r < 0.36 && (spokeAngle < 0.06 || spokeAngle > (Math.PI * 2) / spokeCount - 0.06)
  if (onRing || onSpoke) {
    out.r = clamp(out.r * 0.2 + theme.glowR * 0.9)
    out.g = clamp(out.g * 0.2 + theme.glowG * 0.9)
    out.b = clamp(out.b * 0.2 + theme.glowB * 0.9)
  }
}

function ventGrate(inX: number, inY: number, theme: LevelTheme, out: RGB): void {
  const margin = 0.08
  if (inX < margin || inX > 1 - margin || inY < margin || inY > 1 - margin) return
  const slatV = (inY * 6) % 1
  const onSlat = slatV < 0.4
  if (onSlat) {
    out.r = (theme.metalSeamR * 0.7) | 0
    out.g = (theme.metalSeamG * 0.7) | 0
    out.b = (theme.metalSeamB * 0.7) | 0
  } else {
    out.r = theme.metalR
    out.g = theme.metalG
    out.b = theme.metalB
  }
}

function debrisLitter(inX: number, inY: number, tileHash: number, out: RGB): void {
  const pieces = 5
  for (let i = 0; i < pieces; i++) {
    const key = (tileHash ^ (i * 40503)) >>> 0
    const cx = (key % 1000) / 1000
    const cy = (((key * 2654435761) >>> 0) % 1000) / 1000
    const radius = 0.04 + (((key * 19349663) >>> 0) % 30) / 1000
    const dx = inX - cx
    const dy = inY - cy
    if (dx * dx + dy * dy < radius * radius) {
      out.r = (out.r * 0.55) | 0
      out.g = (out.g * 0.55) | 0
      out.b = (out.b * 0.55) | 0
    }
  }
}

function crackedTile(inX: number, inY: number, tileHash: number, out: RGB): void {
  const a = ((tileHash >>> 0) % 1000) / 1000
  const b = (((tileHash * 2654435761) >>> 0) % 1000) / 1000
  const path1 = a + (inX - 0.5) * (b - 0.5) * 1.4
  const path2 = b + (inY - 0.5) * (a - 0.5) * 1.4
  if (Math.abs(inY - path1) < 0.018 || Math.abs(inX - path2) < 0.018) {
    out.r = (out.r * 0.4) | 0
    out.g = (out.g * 0.4) | 0
    out.b = (out.b * 0.4) | 0
  }
}

function lightFixture(inX: number, inY: number, theme: LevelTheme, out: RGB): void {
  const cx = inX - 0.5
  const cy = inY - 0.5
  const d = Math.sqrt(cx * cx + cy * cy)
  if (d < 0.22) {
    const k = 1 - d / 0.22
    out.r = clamp(out.r * (1 - k * 0.85) + theme.glowR * k * 0.95)
    out.g = clamp(out.g * (1 - k * 0.85) + theme.glowG * k * 0.95)
    out.b = clamp(out.b * (1 - k * 0.85) + theme.glowB * k * 0.95)
  }
}

function ceilingGrate(inX: number, inY: number, theme: LevelTheme, out: RGB): void {
  const u = (inX * 5) % 1
  const v = (inY * 5) % 1
  const bar = u < 0.18 || v < 0.18
  if (bar) {
    out.r = theme.metalSeamR
    out.g = theme.metalSeamG
    out.b = theme.metalSeamB
  } else {
    out.r = (out.r * 0.55) | 0
    out.g = (out.g * 0.55) | 0
    out.b = (out.b * 0.55) | 0
  }
}

function ceilingPipe(inX: number, _inY: number, _tileHash: number, theme: LevelTheme, out: RGB): void {
  const onPipe = inX > 0.38 && inX < 0.62
  if (onPipe) {
    const shade = 0.75 + Math.sin((inX - 0.5) * Math.PI * 4) * 0.2
    out.r = (theme.metalR * shade) | 0
    out.g = (theme.metalG * shade) | 0
    out.b = (theme.metalB * shade) | 0
  }
}

function clamp(value: number): number {
  if (value < 0) return 0
  if (value > 255) return 255
  return value | 0
}
