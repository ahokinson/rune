/**
 * Seeded 2D Worley (cellular) noise for Voronoi fields and cracked-stone edges.
 *
 * @module
 */

/** Distance metric used by {@link Worley2D}. */
export enum WorleyDistance {
  /** Straight-line (Pythagorean) distance. */
  Euclidean = "euclidean",
  /** Grid-aligned distance (|dx| + |dy|). */
  Manhattan = "manhattan",
}

/** Result of a {@link Worley2D} sample: nearest and second-nearest distances. */
export interface WorleyResult {
  /** Distance to the nearest feature point. */
  f1: number
  /** Distance to the second-nearest feature point. */
  f2: number
}

/**
 * Seeded 2D Worley (cellular) noise. Space is tiled into unit cells, each holding
 * one feature point at a hashed position; the noise at a sample is the distance
 * to the Nth-nearest feature point. F1 (nearest) gives a bubbly Voronoi field;
 * F2−F1 traces the cell borders, which is the classic "cracked stone / scales /
 * reptile skin" look. Distances are unnormalised world units (a feature point is
 * at most ~1.5 cells away, so F1 stays in roughly [0, 1.5]). Deterministic.
 *
 * @example
 * ```ts
 * const w = new Worley2D(1234)
 * w.f1(1.5, 2.5)     // bubbly Voronoi field, [0, ~1.5)
 * w.edges(1.5, 2.5)  // F2 - F1, ridged cell borders
 * ```
 */
export class Worley2D {
  private seed: number
  private readonly metric: WorleyDistance

  /**
   * @param seed - Seed for the cell hash (default 0).
   * @param metric - Distance metric (default {@link WorleyDistance.Euclidean}).
   */
  constructor(seed = 0, metric: WorleyDistance = WorleyDistance.Euclidean) {
    this.seed = seed >>> 0
    this.metric = metric
  }

  // Hash a cell to two independent [0, 1) coordinates for its feature point.
  private feature(cx: number, cy: number): [number, number] {
    let h = (Math.imul(cx, 374761393) + Math.imul(cy, 668265263) + this.seed) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    const a = (h ^ (h >>> 16)) >>> 0
    h = Math.imul(a ^ (a >>> 15), 2246822519)
    const b = (h ^ (h >>> 13)) >>> 0
    return [a / 4294967296, b / 4294967296]
  }

  private distance(dx: number, dy: number): number {
    if (this.metric === WorleyDistance.Manhattan) return Math.abs(dx) + Math.abs(dy)
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Nearest (F1) and second-nearest (F2) feature-point distances at (x, y),
   * searching the 3×3 block of cells around the sample (feature points never sit
   * more than one cell away, so this window is exhaustive).
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns The F1 and F2 distances.
   */
  sample(x: number, y: number): WorleyResult {
    const cx = Math.floor(x)
    const cy = Math.floor(y)
    let f1 = Infinity
    let f2 = Infinity
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const [fpx, fpy] = this.feature(cx + ox, cy + oy)
        const px = cx + ox + fpx
        const py = cy + oy + fpy
        const dist = this.distance(px - x, py - y)
        if (dist < f1) {
          f2 = f1
          f1 = dist
        } else if (dist < f2) {
          f2 = dist
        }
      }
    }
    return { f1, f2 }
  }

  /**
   * Distance to the nearest feature point — the bubbly Voronoi field, in [0, ~1.5).
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns The F1 distance.
   */
  f1(x: number, y: number): number {
    return this.sample(x, y).f1
  }

  /**
   * F2 − F1 — ridged cell borders ("cracked stone"), near 0 inside cells and
   * rising toward the edges.
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns `f2 - f1`.
   */
  edges(x: number, y: number): number {
    const { f1, f2 } = this.sample(x, y)
    return f2 - f1
  }
}
