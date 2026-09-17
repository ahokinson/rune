import { Random } from "@/math/random"
import { TileMap } from "@/world/tileMap"

/**
 * Tiled wave-function-collapse. Each grid cell starts able to be any tile; we
 * repeatedly collapse the lowest-entropy cell to a single (weighted-random) tile
 * and propagate the adjacency constraints outward, shrinking neighbours' option
 * sets until the whole grid is decided. The result is a layout where every
 * adjacency obeys the supplied rules — ideal for coherent tilesets (pipes,
 * circuitry, dungeons that "fit together") from a small example-derived ruleset.
 *
 * Authoring the rules: `adjacency[direction][tile]` lists which tiles may sit on
 * that `direction` side of `tile`. Rules must be symmetric (if B may sit to the
 * right of A, then A must be allowed to the left of B) or propagation will wedge.
 *
 * @module
 */

/** Cardinal direction used to index the adjacency rules. */
export enum Direction {
  /** Up (-Y). */
  Up = 0,
  /** Right (+X). */
  Right = 1,
  /** Down (+Y). */
  Down = 2,
  /** Left (-X). */
  Left = 3,
}

const DELTA: ReadonlyArray<readonly [number, number]> = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

/** Options for {@link generateWaveCollapse}. */
export interface WaveCollapseOptions {
  /** Grid width in cells. */
  width: number
  /** Grid height in cells. */
  height: number
  /** Number of distinct tiles the solver may place. */
  tileCount: number
  /** `adjacency[direction][tile]` = tiles allowed on that side of `tile`. */
  adjacency: ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>
  /** Relative selection weight per tile (defaults to uniform). */
  weights?: ReadonlyArray<number>
  /** RNG seed (default 0). */
  seed?: number
  /** Restart count when a contradiction (a cell with zero options) is hit. */
  maxAttempts?: number
}

/** Result of {@link generateWaveCollapse}. */
export interface WaveCollapseResult {
  /**
   * Tile index per cell. On failure every cell is the contradiction marker -1.
   */
  map: TileMap<number>
  /** `false` if every attempt hit an unresolvable contradiction. */
  success: boolean
}

/**
 * Solve a tiled wave-function-collapse.
 *
 * @param options - Grid size, tile count, adjacency rules, weights, seed.
 * @returns The decided tile map and a success flag.
 */
export function generateWaveCollapse(options: WaveCollapseOptions): WaveCollapseResult {
  const width = Math.max(1, Math.floor(options.width))
  const height = Math.max(1, Math.floor(options.height))
  const { tileCount, adjacency } = options
  const weights = options.weights ?? new Array(tileCount).fill(1)
  const maxAttempts = options.maxAttempts ?? 10
  const cellCount = width * height

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const random = new Random((options.seed ?? 0) + attempt)
    // possible[cell] is a boolean row of length tileCount.
    const possible: boolean[][] = Array.from({ length: cellCount }, () => new Array(tileCount).fill(true))
    let contradiction = false

    const optionsLeft = (cell: number): number => {
      let count = 0
      const row = possible[cell]!
      for (let t = 0; t < tileCount; t++) if (row[t]) count++
      return count
    }

    // Reduce neighbour `to` against the still-possible tiles of `from` across
    // `direction`; queue any cell that loses options so the change ripples out.
    const propagate = (start: number): void => {
      const stack = [start]
      while (stack.length > 0) {
        const cell = stack.pop()!
        const cx = cell % width
        const cy = Math.floor(cell / width)
        const fromRow = possible[cell]!
        for (let direction = 0; direction < 4; direction++) {
          const [dx, dy] = DELTA[direction]!
          const nx = cx + dx
          const ny = cy + dy
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
          const neighbour = ny * width + nx
          const neighbourRow = possible[neighbour]!
          let changed = false
          for (let t = 0; t < tileCount; t++) {
            if (!neighbourRow[t]) continue
            // t survives only if some still-possible source tile permits it on
            // this side (i.e. t is in adjacency[direction] of that source).
            let supported = false
            for (let s = 0; s < tileCount && !supported; s++) {
              if (fromRow[s] && adjacency[direction]![s]!.includes(t)) supported = true
            }
            if (!supported) {
              neighbourRow[t] = false
              changed = true
            }
          }
          if (changed) {
            if (optionsLeft(neighbour) === 0) {
              contradiction = true
              return
            }
            stack.push(neighbour)
          }
        }
      }
    }

    while (!contradiction) {
      // Find the undecided cell with the fewest options (classic min-entropy).
      let target = -1
      let fewest = Infinity
      for (let cell = 0; cell < cellCount; cell++) {
        const count = optionsLeft(cell)
        if (count > 1 && count < fewest) {
          fewest = count
          target = cell
        }
      }
      if (target === -1) break // every cell decided

      // Collapse `target` to one tile, weighted by `weights`.
      const row = possible[target]!
      let totalWeight = 0
      for (let t = 0; t < tileCount; t++) if (row[t]) totalWeight += weights[t]!
      let roll = random.float(0, totalWeight)
      let chosen = -1
      for (let t = 0; t < tileCount; t++) {
        if (!row[t]) continue
        roll -= weights[t]!
        if (roll <= 0) {
          chosen = t
          break
        }
      }
      if (chosen === -1) for (let t = 0; t < tileCount; t++) if (row[t]) chosen = t
      for (let t = 0; t < tileCount; t++) row[t] = t === chosen
      propagate(target)
    }

    if (!contradiction) {
      const map = new TileMap<number>(width, height, -1)
      for (let cell = 0; cell < cellCount; cell++) {
        const row = possible[cell]!
        for (let t = 0; t < tileCount; t++) {
          if (row[t]) {
            map.set(cell % width, Math.floor(cell / width), t)
            break
          }
        }
      }
      return { map, success: true }
    }
  }

  return { map: new TileMap<number>(width, height, -1), success: false }
}
