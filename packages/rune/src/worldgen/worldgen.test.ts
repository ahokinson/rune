import { describe, expect, it } from "bun:test"
import type { TileMap } from "@/world/tileMap"
import { Cell } from "@/worldgen/cell"
import { generateDungeon } from "@/worldgen/dungeon"
import { generateMaze } from "@/worldgen/maze"
import { Direction, generateWaveCollapse } from "@/worldgen/waveCollapse"

// Count floor cells reachable from the first floor cell by 4-way flood fill.
function reachableFloors(map: TileMap<Cell>): { reachable: number; total: number } {
  let start = -1
  let total = 0
  map.forEach((cell, column, row) => {
    if (cell === Cell.Floor) {
      total++
      if (start === -1) start = row * map.width + column
    }
  })
  if (start === -1) return { reachable: 0, total: 0 }
  const seen = new Set<number>([start])
  const stack = [start]
  while (stack.length > 0) {
    const index = stack.pop()!
    const column = index % map.width
    const row = Math.floor(index / map.width)
    const steps: ReadonlyArray<readonly [number, number]> = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ]
    for (const [dx, dy] of steps) {
      const nx = column + dx
      const ny = row + dy
      const next = ny * map.width + nx
      if (map.get(nx, ny) === Cell.Floor && !seen.has(next)) {
        seen.add(next)
        stack.push(next)
      }
    }
  }
  return { reachable: seen.size, total }
}

describe("generateMaze", () => {
  it("produces a fully connected (perfect) maze", () => {
    const map = generateMaze({ width: 12, height: 12, seed: 3 })
    const { reachable, total } = reachableFloors(map)
    // A perfect maze carves every cell plus one corridor per spanning-tree edge: 2N−1.
    expect(total).toBe(2 * 12 * 12 - 1)
    expect(reachable).toBe(total)
  })

  it("rings the grid in walls", () => {
    const map = generateMaze({ width: 5, height: 5, seed: 1 })
    for (let x = 0; x < map.width; x++) {
      expect(map.get(x, 0)).toBe(Cell.Wall)
      expect(map.get(x, map.height - 1)).toBe(Cell.Wall)
    }
  })

  it("is deterministic for a seed", () => {
    const a = generateMaze({ width: 8, height: 8, seed: 42 })
    const b = generateMaze({ width: 8, height: 8, seed: 42 })
    expect(a.cells).toEqual(b.cells)
  })
})

describe("generateDungeon", () => {
  it("carves connected rooms", () => {
    const { map, rooms } = generateDungeon({ width: 48, height: 48, seed: 5 })
    expect(rooms.length).toBeGreaterThan(1)
    const { reachable, total } = reachableFloors(map)
    expect(reachable).toBe(total)
  })

  it("is deterministic for a seed", () => {
    const a = generateDungeon({ width: 40, height: 40, seed: 9 })
    const b = generateDungeon({ width: 40, height: 40, seed: 9 })
    expect(a.map.cells).toEqual(b.map.cells)
    expect(a.rooms).toEqual(b.rooms)
  })
})

describe("generateWaveCollapse", () => {
  // Three tiles in a forced left-to-right gradient: 0 only borders 0/1, 1 borders
  // all, 2 only borders 1/2. Vertically anything goes.
  const all = [0, 1, 2]
  // adjacency[direction][tile]; symmetric horizontal gradient, free vertically.
  const rules: number[][][] = [
    [all, all, all],
    [
      [0, 1],
      [0, 1, 2],
      [1, 2],
    ],
    [all, all, all],
    [
      [0, 1],
      [0, 1, 2],
      [1, 2],
    ],
  ]

  it("collapses to a layout that satisfies the adjacency rules", () => {
    const { map, success } = generateWaveCollapse({
      width: 10,
      height: 6,
      tileCount: 3,
      adjacency: rules,
      seed: 1,
    })
    expect(success).toBe(true)
    map.forEach((tile, column, row) => {
      const right = map.get(column + 1, row)
      if (right !== undefined && right !== -1) {
        expect(rules[Direction.Right]![tile]!).toContain(right)
      }
    })
  })

  it("is deterministic for a seed", () => {
    const a = generateWaveCollapse({ width: 8, height: 8, tileCount: 3, adjacency: rules, seed: 4 })
    const b = generateWaveCollapse({ width: 8, height: 8, tileCount: 3, adjacency: rules, seed: 4 })
    expect(a.map.cells).toEqual(b.map.cells)
  })
})
