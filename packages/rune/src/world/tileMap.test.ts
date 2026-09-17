import { describe, expect, it } from "bun:test"
import { TileMap } from "@/world/tileMap"

describe("TileMap", () => {
  it("constructs with a fill value", () => {
    const map = new TileMap<number>(3, 2, 7)
    expect(map.width).toBe(3)
    expect(map.height).toBe(2)
    expect(map.get(0, 0)).toBe(7)
    expect(map.get(2, 1)).toBe(7)
  })

  it("get and set roundtrip", () => {
    const map = new TileMap<string>(4, 4, ".")
    map.set(2, 1, "x")
    expect(map.get(2, 1)).toBe("x")
    expect(map.get(0, 0)).toBe(".")
  })

  it("out-of-bounds get returns undefined; set is a no-op", () => {
    const map = new TileMap<number>(2, 2, 0)
    expect(map.get(-1, 0)).toBeUndefined()
    expect(map.get(2, 0)).toBeUndefined()
    map.set(-1, 0, 99)
    expect(map.get(0, 0)).toBe(0)
  })

  it("inBounds reflects dimensions", () => {
    const map = new TileMap<number>(3, 3, 0)
    expect(map.inBounds(0, 0)).toBe(true)
    expect(map.inBounds(2, 2)).toBe(true)
    expect(map.inBounds(3, 0)).toBe(false)
    expect(map.inBounds(-1, 0)).toBe(false)
  })

  it("forEach visits every cell in row-major order", () => {
    const map = new TileMap<number>(2, 2, 0)
    map.set(0, 0, 1)
    map.set(1, 0, 2)
    map.set(0, 1, 3)
    map.set(1, 1, 4)
    const visited: Array<[number, number, number]> = []
    map.forEach((cell, column, row) => {
      visited.push([cell, column, row])
    })
    expect(visited).toEqual([
      [1, 0, 0],
      [2, 1, 0],
      [3, 0, 1],
      [4, 1, 1],
    ])
  })

  it("fromString parses a level with a mapping", () => {
    interface Cell {
      solid: boolean
    }
    const wall: Cell = { solid: true }
    const floor: Cell = { solid: false }
    const map = TileMap.fromString<Cell>(
      `
###
#.#
###
`,
      { "#": wall, ".": floor },
      floor,
    )
    expect(map.width).toBe(3)
    expect(map.height).toBe(3)
    expect(map.get(0, 0)).toBe(wall)
    expect(map.get(1, 1)).toBe(floor)
    expect(map.get(2, 2)).toBe(wall)
  })

  it("fromString uses the fallback for unmapped characters", () => {
    const map = TileMap.fromString<number>(
      `
.x.
`,
      { x: 1 },
      0,
    )
    expect(map.get(0, 0)).toBe(0)
    expect(map.get(1, 0)).toBe(1)
    expect(map.get(2, 0)).toBe(0)
  })
})
