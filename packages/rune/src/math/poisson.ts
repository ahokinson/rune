import { Random } from "./random"
import { Vector2 } from "./vector2"

/**
 * Poisson-disk sampling via Bridson's algorithm for organic, minimum-spacing
 * point distributions (tree/rock/enemy/star placement).
 *
 * @module
 */

/** Options for {@link poissonDisk}. */
export interface PoissonOptions {
  /** Sample area width. */
  width: number
  /** Sample area height. */
  height: number
  /** Minimum distance between any two points. */
  radius: number
  /** Candidates tried per active point before it is retired (Bridson's k, default 30). */
  attempts?: number
  /** RNG seed (default 0). */
  seed?: number
}

/**
 * Poisson-disk sampling via Bridson's algorithm: scatter points across a
 * rectangle so no two are closer than `radius`, but the spacing stays organic
 * (not a grid). The go-to distribution for tree/rock/enemy/star placement — it
 * reads as natural clumping-free randomness. O(n) with a background grid; the
 * grid cell size radius/√2 guarantees at most one sample per cell, so a new
 * candidate only checks its 5×5 cell neighbourhood. Deterministic for a seed.
 *
 * @param options - Sample dimensions, radius, attempts, and seed.
 * @returns The sampled points (empty if `width`, `height`, or `radius` is ≤ 0).
 */
export function poissonDisk(options: PoissonOptions): Vector2[] {
  const { width, height, radius } = options
  if (width <= 0 || height <= 0 || radius <= 0) return []
  const attempts = options.attempts ?? 30
  const random = new Random(options.seed ?? 0)

  const cellSize = radius / Math.SQRT2
  const cols = Math.ceil(width / cellSize)
  const rows = Math.ceil(height / cellSize)
  // -1 marks an empty cell; otherwise the index into `points`.
  const grid = new Int32Array(cols * rows).fill(-1)
  const points: Vector2[] = []
  const active: number[] = []

  const gridIndex = (x: number, y: number): number => Math.floor(y / cellSize) * cols + Math.floor(x / cellSize)
  const radiusSquared = radius * radius

  const fits = (x: number, y: number): boolean => {
    const gx = Math.floor(x / cellSize)
    const gy = Math.floor(y / cellSize)
    for (let oy = -2; oy <= 2; oy++) {
      for (let ox = -2; ox <= 2; ox++) {
        const nx = gx + ox
        const ny = gy + oy
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
        const index = grid[ny * cols + nx]!
        if (index === -1) continue
        const other = points[index]!
        const dx = other.x - x
        const dy = other.y - y
        if (dx * dx + dy * dy < radiusSquared) return false
      }
    }
    return true
  }

  const addPoint = (x: number, y: number): void => {
    const index = points.length
    points.push(new Vector2(x, y))
    grid[gridIndex(x, y)] = index
    active.push(index)
  }

  addPoint(random.float(0, width), random.float(0, height))

  while (active.length > 0) {
    const activeIndex = random.integer(0, active.length - 1)
    const origin = points[active[activeIndex]!]!
    let placed = false
    for (let i = 0; i < attempts; i++) {
      // Candidate in the annulus [radius, 2·radius] around the active point.
      const angle = random.float(0, Math.PI * 2)
      const distance = random.float(radius, radius * 2)
      const x = origin.x + Math.cos(angle) * distance
      const y = origin.y + Math.sin(angle) * distance
      if (x < 0 || y < 0 || x >= width || y >= height) continue
      if (!fits(x, y)) continue
      addPoint(x, y)
      placed = true
      break
    }
    // No candidate fit: this point can spawn no more neighbours, retire it.
    if (!placed) active.splice(activeIndex, 1)
  }

  return points
}
