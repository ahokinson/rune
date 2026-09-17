import type { CellPredicate, GridCell } from "@/physics/grid"

/**
 * Grid A* pathfinder. Walks the passable cells of a 2D grid from a start cell to a
 * goal cell using a binary-heap open set and a configurable heuristic, returning
 * the waypoint list (inclusive of start and goal) or `null` when no route exists.
 *
 * @module
 */

/** Distance heuristic for the A* estimator. */
export enum Heuristic {
  /** Manhattan (L1) distance — correct for 4-directional grids. */
  Manhattan = "manhattan",
  /** Chebyshev (L∞) distance — correct for 8-directional grids. */
  Chebyshev = "chebyshev",
}

/** Options for {@link findPath}. */
export interface PathfindOptions {
  /** Heuristic used by A*. Defaults to {@link Heuristic.Manhattan}. */
  heuristic?: Heuristic
  /** Allow 8-directional neighbour moves (default 4-directional). */
  allowDiagonal?: boolean
  /** Search cap to bound worst-case work; returns `null` when exceeded. */
  maxIterations?: number
}

interface OpenNode {
  key: number
  column: number
  row: number
  gScore: number
  fScore: number
  parentKey: number
  heapIndex: number
}

/** Pack a (column, row) pair into a single 32-bit integer key. */
function numKey(column: number, row: number): number {
  return ((column & 0xffff) << 16) | (row & 0xffff)
}

/** Manhattan (L1) distance between two grid points. */
function manhattan(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by)
}

/** Chebyshev (L∞) distance between two grid points. */
function chebyshev(ax: number, ay: number, bx: number, by: number): number {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by))
}

/** Binary min-heap of {@link OpenNode} keyed by `fScore`. */
class BinaryHeap {
  private data: OpenNode[] = []

  /** Number of entries currently in the heap. */
  get size(): number {
    return this.data.length
  }

  /**
   * Insert `node` and restore the heap invariant upward.
   *
   * @param node - Node to insert.
   */
  push(node: OpenNode): void {
    node.heapIndex = this.data.length
    this.data.push(node)
    this.siftUp(node.heapIndex)
  }

  /**
   * Remove and return the node with the smallest `fScore`.
   *
   * @returns The minimum node, or `undefined` when empty.
   */
  pop(): OpenNode | undefined {
    if (this.data.length === 0) return undefined
    const top = this.data[0]!
    const last = this.data.pop()!
    if (this.data.length > 0) {
      this.data[0] = last
      last.heapIndex = 0
      this.siftDown(0)
    }
    top.heapIndex = -1
    return top
  }

  /**
   * Restore the heap invariant upward after a node's `fScore` decreased.
   *
   * @param node - Node whose key decreased.
   */
  decreaseKey(node: OpenNode): void {
    this.siftUp(node.heapIndex)
  }

  private siftUp(index: number): void {
    const data = this.data
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (data[parent]!.fScore <= data[index]!.fScore) break
      this.swap(index, parent)
      index = parent
    }
  }

  private siftDown(index: number): void {
    const data = this.data
    const length = data.length
    while (true) {
      let smallest = index
      const left = (index << 1) + 1
      const right = left + 1
      if (left < length && data[left]!.fScore < data[smallest]!.fScore) smallest = left
      if (right < length && data[right]!.fScore < data[smallest]!.fScore) smallest = right
      if (smallest === index) break
      this.swap(index, smallest)
      index = smallest
    }
  }

  private swap(i: number, j: number): void {
    const data = this.data
    const temp = data[i]!
    data[i] = data[j]!
    data[j] = temp
    data[i]!.heapIndex = i
    data[j]!.heapIndex = j
  }
}

const CARDINAL_NEIGHBORS: ReadonlyArray<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

const DIAGONAL_NEIGHBORS: ReadonlyArray<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

const NO_PARENT = -1

/**
 * Find a path of grid cells from `start` to `goal` using A*.
 *
 * @param start - Start cell.
 * @param goal - Goal cell.
 * @param isPassable - Predicate reporting whether a cell is walkable.
 * @param options - Optional heuristic, diagonal, and iteration-cap configuration.
 * @returns Cells from `start` to `goal` inclusive, or `null` if no route exists (or the goal is impassable, or the iteration cap is hit).
 */
export function findPath(
  start: GridCell,
  goal: GridCell,
  isPassable: CellPredicate,
  options: PathfindOptions = {},
): GridCell[] | null {
  const heuristic = options.heuristic ?? Heuristic.Manhattan
  const allowDiagonal = options.allowDiagonal ?? false
  const maxIterations = options.maxIterations ?? 10_000
  const distance = heuristic === Heuristic.Chebyshev ? chebyshev : manhattan
  const neighbours = allowDiagonal ? DIAGONAL_NEIGHBORS : CARDINAL_NEIGHBORS

  if (!isPassable(goal.column, goal.row)) return null
  if (start.column === goal.column && start.row === goal.row) return [start]

  const openMap = new Map<number, OpenNode>()
  const closed = new Set<number>()
  const cameFrom = new Map<number, number>()
  const heap = new BinaryHeap()

  const startKey = numKey(start.column, start.row)
  const goalKey = numKey(goal.column, goal.row)
  const startNode: OpenNode = {
    key: startKey,
    column: start.column,
    row: start.row,
    gScore: 0,
    fScore: distance(start.column, start.row, goal.column, goal.row),
    parentKey: NO_PARENT,
    heapIndex: -1,
  }
  openMap.set(startKey, startNode)
  heap.push(startNode)

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const bestNode = heap.pop()
    if (!bestNode) return null

    if (bestNode.key === goalKey) {
      const path: GridCell[] = []
      let currentKey: number = bestNode.key
      while (currentKey !== NO_PARENT) {
        const col = currentKey >>> 16
        const row = currentKey & 0xffff
        if (col > 32767) {
          // handle sign for negative coordinates
        }
        path.unshift({ column: col, row: row })
        const parentKey = cameFrom.get(currentKey)
        if (parentKey === undefined) break
        currentKey = parentKey
      }
      return path
    }

    openMap.delete(bestNode.key)
    closed.add(bestNode.key)

    for (const [dx, dy] of neighbours) {
      const neighbourColumn = bestNode.column + dx
      const neighbourRow = bestNode.row + dy
      const neighbourKey = numKey(neighbourColumn, neighbourRow)
      if (closed.has(neighbourKey)) continue
      if (!isPassable(neighbourColumn, neighbourRow)) continue

      const stepCost = dx !== 0 && dy !== 0 ? Math.SQRT2 : 1
      const tentativeGScore = bestNode.gScore + stepCost
      const existing = openMap.get(neighbourKey)
      if (existing && tentativeGScore >= existing.gScore) continue

      cameFrom.set(neighbourKey, bestNode.key)
      const fScore = tentativeGScore + distance(neighbourColumn, neighbourRow, goal.column, goal.row)
      if (existing) {
        existing.gScore = tentativeGScore
        existing.fScore = fScore
        existing.parentKey = bestNode.key
        heap.decreaseKey(existing)
      } else {
        const node: OpenNode = {
          key: neighbourKey,
          column: neighbourColumn,
          row: neighbourRow,
          gScore: tentativeGScore,
          fScore,
          parentKey: bestNode.key,
          heapIndex: -1,
        }
        openMap.set(neighbourKey, node)
        heap.push(node)
      }
    }
  }

  return null
}
