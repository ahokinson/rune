import { Random } from "@/math/random"
import { TileMap } from "@/world/tileMap"
import { Cell } from "./cell"

/**
 * Perfect-maze generation via the growing-tree algorithm (a generalisation of
 * recursive backtracker). Cells sit on the even lattice; walls fill the odd rows
 * and columns between them. "Perfect" means exactly one path between any two
 * cells — no loops, no isolated pockets — which is the right base for corridor
 * puzzles; carve a few extra openings afterward if you want loops.
 *
 * Growing-tree keeps a frontier of carved cells and always extends from one of
 * them; picking the newest frontier cell reproduces recursive backtracker's long
 * winding corridors, while picking a random one gives a bushier, branchier maze.
 *
 * @module
 */

/** Options for {@link generateMaze}. */
export interface MazeOptions {
  /**
   * Cell counts (not tile counts). The output TileMap is
   * `(2·width+1)×(2·height+1)` so every cell is ringed by walls.
   */
  width: number
  /** Cell height (output is `2·height+1` tiles tall). */
  height: number
  /** RNG seed (default 0). */
  seed?: number
  /**
   * 0 → always extend from the newest frontier cell (long corridors, default);
   * 1 → always pick a random frontier cell (short branchy passages). Values
   * between blend the two.
   */
  branchiness?: number
}

/**
 * Generate a perfect maze via the growing-tree algorithm.
 *
 * @param options - Dimensions, seed, and branchiness.
 * @returns A `TileMap<Cell>` of size `(2·width+1)×(2·height+1)` with walls
 *   ringing every carved cell.
 */
export function generateMaze(options: MazeOptions): TileMap<Cell> {
  const cellsWide = Math.max(1, Math.floor(options.width))
  const cellsTall = Math.max(1, Math.floor(options.height))
  const branchiness = options.branchiness ?? 0
  const random = new Random(options.seed ?? 0)

  const mapWidth = cellsWide * 2 + 1
  const mapHeight = cellsTall * 2 + 1
  const map = new TileMap<Cell>(mapWidth, mapHeight, Cell.Wall)

  // Tile coordinate of a cell's centre.
  const tileOf = (cx: number, cy: number): [number, number] => [cx * 2 + 1, cy * 2 + 1]
  const visited = new Uint8Array(cellsWide * cellsTall)
  const visitedAt = (cx: number, cy: number): boolean => visited[cy * cellsWide + cx] === 1

  const startX = random.integer(0, cellsWide - 1)
  const startY = random.integer(0, cellsTall - 1)
  visited[startY * cellsWide + startX] = 1
  {
    const [tx, ty] = tileOf(startX, startY)
    map.set(tx, ty, Cell.Floor)
  }
  const frontier: Array<[number, number]> = [[startX, startY]]

  const neighbours: ReadonlyArray<readonly [number, number]> = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ]

  while (frontier.length > 0) {
    // Newest cell for corridors, random cell for branches.
    const pickIndex = random.next() < branchiness ? random.integer(0, frontier.length - 1) : frontier.length - 1
    const [cx, cy] = frontier[pickIndex]!

    const unvisited: Array<[number, number]> = []
    for (const [dx, dy] of neighbours) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= cellsWide || ny >= cellsTall) continue
      if (!visitedAt(nx, ny)) unvisited.push([nx, ny])
    }

    if (unvisited.length === 0) {
      // Dead end: drop it from the frontier.
      frontier.splice(pickIndex, 1)
      continue
    }

    const [nx, ny] = unvisited[random.integer(0, unvisited.length - 1)]!
    visited[ny * cellsWide + nx] = 1
    // Carve the destination cell and the wall between it and the current cell.
    const [tx, ty] = tileOf(nx, ny)
    map.set(tx, ty, Cell.Floor)
    map.set(tx - (nx - cx), ty - (ny - cy), Cell.Floor)
    frontier.push([nx, ny])
  }

  return map
}
