import { Vector2 } from "@/math/vector2"
import type { CellPredicate, GridCell } from "@/physics/grid"

/**
 * A flow field: run Dijkstra once from the goal(s) across the grid, storing at
 * every cell the cost-to-goal and the direction of steepest descent. Then any
 * number of agents navigate by simply reading the direction under their feet — far
 * cheaper than an A* per agent when a whole crowd shares one destination (tower
 * defence creeps, a fleeing mob). Recompute only when the goal or the map changes.
 *
 * @module
 */

/** Options for {@link FlowField.compute}. */
export interface FlowFieldOptions {
  /** Allow 8-directional neighbour expansion (default 4-directional). */
  allowDiagonal?: boolean
}

/** A tiny binary min-heap of (cost, cellIndex) for Dijkstra. */
class CostHeap {
  private readonly costs: number[] = []
  private readonly cells: number[] = []

  /** Number of entries currently in the heap. */
  get size(): number {
    return this.cells.length
  }

  /**
   * Insert a (cost, cell) pair.
   *
   * @param cost - Pending cost for the cell.
   * @param cell - Flattened cell index.
   */
  push(cost: number, cell: number): void {
    this.costs.push(cost)
    this.cells.push(cell)
    let i = this.cells.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.costs[parent]! <= this.costs[i]!) break
      this.swap(i, parent)
      i = parent
    }
  }

  /**
   * Remove and return the cell with the smallest cost.
   *
   * @returns The minimum-cost cell index.
   */
  pop(): number {
    const top = this.cells[0]!
    const lastCost = this.costs.pop()!
    const lastCell = this.cells.pop()!
    if (this.cells.length > 0) {
      this.costs[0] = lastCost
      this.cells[0] = lastCell
      let i = 0
      const length = this.cells.length
      while (true) {
        let smallest = i
        const left = (i << 1) + 1
        const right = left + 1
        if (left < length && this.costs[left]! < this.costs[smallest]!) smallest = left
        if (right < length && this.costs[right]! < this.costs[smallest]!) smallest = right
        if (smallest === i) break
        this.swap(i, smallest)
        i = smallest
      }
    }
    return top
  }

  private swap(i: number, j: number): void {
    const c = this.costs[i]!
    this.costs[i] = this.costs[j]!
    this.costs[j] = c
    const k = this.cells[i]!
    this.cells[i] = this.cells[j]!
    this.cells[j] = k
  }
}

const CARDINAL: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const DIAGONAL: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

/**
 * Grid of cost-to-goal and steepest-descent directions produced by
 * {@link FlowField.compute}.
 */
export class FlowField {
  /** Field width in cells. */
  readonly width: number
  /** Field height in cells. */
  readonly height: number
  /** Cost-to-goal per cell; Infinity for unreachable/blocked cells. */
  readonly cost: Float32Array
  // Steepest-descent direction per cell, interleaved (dx, dy), normalised.
  private readonly direction: Float32Array

  /**
   * @param width - Field width in cells.
   * @param height - Field height in cells.
   */
  constructor(width: number, height: number) {
    this.width = Math.max(0, Math.floor(width))
    this.height = Math.max(0, Math.floor(height))
    this.cost = new Float32Array(this.width * this.height).fill(Infinity)
    this.direction = new Float32Array(this.width * this.height * 2)
  }

  /**
   * Build a flow field toward one or more goal cells over the passable grid.
   *
   * @param goals - Goal cell or cells to flow toward.
   * @param width - Field width in cells.
   * @param height - Field height in cells.
   * @param isPassable - Predicate reporting whether a cell is walkable.
   * @param options - Optional configuration.
   * @returns A populated {@link FlowField}.
   */
  static compute(
    goals: GridCell | readonly GridCell[],
    width: number,
    height: number,
    isPassable: CellPredicate,
    options: FlowFieldOptions = {},
  ): FlowField {
    const field = new FlowField(width, height)
    const neighbours = options.allowDiagonal ? DIAGONAL : CARDINAL
    const heap = new CostHeap()
    const goalList = Array.isArray(goals) ? goals : [goals as GridCell]
    for (const goal of goalList) {
      if (!field.inBounds(goal.column, goal.row)) continue
      const index = goal.row * field.width + goal.column
      field.cost[index] = 0
      heap.push(0, index)
    }

    // Dijkstra outward from the goals.
    while (heap.size > 0) {
      const index = heap.pop()
      const column = index % field.width
      const row = Math.floor(index / field.width)
      const baseCost = field.cost[index]!
      for (const [dx, dy] of neighbours) {
        const nx = column + dx
        const ny = row + dy
        if (!field.inBounds(nx, ny) || !isPassable(nx, ny)) continue
        const stepCost = dx !== 0 && dy !== 0 ? Math.SQRT2 : 1
        const next = ny * field.width + nx
        const candidate = baseCost + stepCost
        if (candidate < field.cost[next]!) {
          field.cost[next] = candidate
          heap.push(candidate, next)
        }
      }
    }

    field.computeDirections(options.allowDiagonal ?? false)
    return field
  }

  /**
   * @param column - Cell column.
   * @param row - Cell row.
   * @returns `true` if (column, row) is inside the field.
   */
  inBounds(column: number, row: number): boolean {
    return column >= 0 && row >= 0 && column < this.width && row < this.height
  }

  /**
   * @param column - Cell column.
   * @param row - Cell row.
   * @returns Cost-to-goal at the cell, or `Infinity` if out of bounds.
   */
  costAt(column: number, row: number): number {
    if (!this.inBounds(column, row)) return Infinity
    return this.cost[row * this.width + column]!
  }

  /**
   * The unit direction a cell should move to descend toward the goal. Returns the
   * zero vector at the goal itself and on unreachable cells.
   *
   * @param column - Cell column.
   * @param row - Cell row.
   * @param out - Optional scratch vector to write into (default allocates).
   * @returns The direction vector (or `out` for chaining).
   */
  directionAt(column: number, row: number, out: Vector2 = new Vector2()): Vector2 {
    if (!this.inBounds(column, row)) return out.set(0, 0)
    const i = (row * this.width + column) * 2
    return out.set(this.direction[i]!, this.direction[i + 1]!)
  }

  // After costs are known, point each cell at its lowest-cost neighbour.
  private computeDirections(allowDiagonal: boolean): void {
    const neighbours = allowDiagonal ? DIAGONAL : CARDINAL
    for (let row = 0; row < this.height; row++) {
      for (let column = 0; column < this.width; column++) {
        const here = this.cost[row * this.width + column]!
        if (!Number.isFinite(here)) continue
        let bestCost = here
        let bestX = 0
        let bestY = 0
        for (const [dx, dy] of neighbours) {
          const nx = column + dx
          const ny = row + dy
          if (!this.inBounds(nx, ny)) continue
          const neighbourCost = this.cost[ny * this.width + nx]!
          if (neighbourCost < bestCost) {
            bestCost = neighbourCost
            bestX = dx
            bestY = dy
          }
        }
        const length = Math.hypot(bestX, bestY)
        const i = (row * this.width + column) * 2
        if (length > 0) {
          this.direction[i] = bestX / length
          this.direction[i + 1] = bestY / length
        }
      }
    }
  }
}
