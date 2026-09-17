import type { RGB } from "./floorCeiling"

export interface LightAuthor {
  at: [number, number]
  color: [number, number, number]
  radius: number
  intensity?: number
}

export interface LightGrid {
  width: number
  height: number
  data: Float32Array
}

export function bakeLightGrid(width: number, height: number, lights: readonly LightAuthor[] | undefined): LightGrid {
  const data = new Float32Array(width * height * 3)
  if (!lights || lights.length === 0) {
    return { width, height, data }
  }

  for (const light of lights) {
    const [lx, ly] = light.at
    const [lr, lg, lb] = light.color
    const radius = light.radius
    const intensity = light.intensity ?? 1
    if (radius <= 0) continue

    const minX = Math.max(0, Math.floor(lx - radius))
    const maxX = Math.min(width - 1, Math.ceil(lx + radius))
    const minY = Math.max(0, Math.floor(ly - radius))
    const maxY = Math.min(height - 1, Math.ceil(ly + radius))

    for (let row = minY; row <= maxY; row++) {
      for (let col = minX; col <= maxX; col++) {
        const dx = col + 0.5 - lx
        const dy = row + 0.5 - ly
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance >= radius) continue
        const falloff = (1 - distance / radius) * intensity
        const offset = (row * width + col) * 3
        data[offset]! += lr * falloff
        data[offset + 1]! += lg * falloff
        data[offset + 2]! += lb * falloff
      }
    }
  }
  return { width, height, data }
}

export function sampleLight(grid: LightGrid, col: number, row: number, out: RGB): void {
  if (col < 0 || row < 0 || col >= grid.width || row >= grid.height) {
    out.r = 0
    out.g = 0
    out.b = 0
    return
  }
  const offset = (row * grid.width + col) * 3
  out.r = grid.data[offset]!
  out.g = grid.data[offset + 1]!
  out.b = grid.data[offset + 2]!
}

export function addLightAt(grid: LightGrid, col: number, row: number, out: RGB): void {
  if (col < 0 || row < 0 || col >= grid.width || row >= grid.height) return
  const offset = (row * grid.width + col) * 3
  let r = out.r + grid.data[offset]!
  let g = out.g + grid.data[offset + 1]!
  let b = out.b + grid.data[offset + 2]!
  if (r > 255) r = 255
  if (g > 255) g = 255
  if (b > 255) b = 255
  out.r = r | 0
  out.g = g | 0
  out.b = b | 0
}
