import { describe, expect, it } from "bun:test"
import { findPath, Heuristic } from "@/ai/pathfind"

function gridFromString(source: string): (column: number, row: number) => boolean {
  const lines = source
    .trim()
    .split("\n")
    .map((line) => line.trim())
  return (column, row) => {
    if (row < 0 || row >= lines.length) return false
    const line = lines[row] ?? ""
    if (column < 0 || column >= line.length) return false
    return line[column] !== "#"
  }
}

describe("findPath", () => {
  it("finds a straight path with no obstacles", () => {
    const passable = gridFromString(`
.....
.....
.....
`)
    const path = findPath({ column: 0, row: 0 }, { column: 4, row: 0 }, passable)
    expect(path).not.toBeNull()
    expect(path![0]).toEqual({ column: 0, row: 0 })
    expect(path![path!.length - 1]).toEqual({ column: 4, row: 0 })
    expect(path!.length).toBe(5)
  })

  it("routes around an L-shaped wall", () => {
    const passable = gridFromString(`
.....
.###.
.....
`)
    const path = findPath({ column: 0, row: 0 }, { column: 4, row: 2 }, passable)
    expect(path).not.toBeNull()
    for (const cell of path!) {
      expect(passable(cell.column, cell.row)).toBe(true)
    }
  })

  it("returns null when goal is blocked", () => {
    const passable = gridFromString(`
.....
..#..
.....
`)
    const path = findPath({ column: 0, row: 0 }, { column: 2, row: 1 }, passable)
    expect(path).toBeNull()
  })

  it("returns null when no path exists", () => {
    const passable = gridFromString(`
.....
#####
.....
`)
    const path = findPath({ column: 0, row: 0 }, { column: 0, row: 2 }, passable)
    expect(path).toBeNull()
  })

  it("returns a single-cell path when start equals goal", () => {
    const passable = gridFromString(`
.....
`)
    const path = findPath({ column: 2, row: 0 }, { column: 2, row: 0 }, passable)
    expect(path).toEqual([{ column: 2, row: 0 }])
  })

  it("diagonal movement yields a shorter path with allowDiagonal", () => {
    const passable = gridFromString(`
.....
.....
.....
.....
.....
`)
    const cardinal = findPath({ column: 0, row: 0 }, { column: 4, row: 4 }, passable)
    const diagonal = findPath({ column: 0, row: 0 }, { column: 4, row: 4 }, passable, {
      allowDiagonal: true,
      heuristic: Heuristic.Chebyshev,
    })
    expect(diagonal).not.toBeNull()
    expect(cardinal).not.toBeNull()
    expect(diagonal!.length).toBeLessThan(cardinal!.length)
  })
})
