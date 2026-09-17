import { describe, expect, it } from "bun:test"
import { autoTile, EdgeBit, edgeMask } from "@/draw/autotile"
import { Sprite } from "@/draw/sprite"
import type { TileContext } from "@/draw/tileSet"
import { TileMap } from "@/world/tileMap"

const same = (cell: number | undefined) => cell === 1

describe("edgeMask", () => {
  it("sets a bit per matching orthogonal neighbour", () => {
    const map = new TileMap<number>(3, 3, 0)
    map.set(1, 1, 1)
    map.set(1, 0, 1) // north
    map.set(1, 2, 1) // south
    const context: TileContext<number> = { tileMap: map, column: 1, row: 1 }
    const mask = edgeMask(context, same, false)
    expect(mask & EdgeBit.North).toBeTruthy()
    expect(mask & EdgeBit.South).toBeTruthy()
    expect(mask & EdgeBit.East).toBeFalsy()
    expect(mask & EdgeBit.West).toBeFalsy()
  })

  it("treats out-of-bounds as matching when edgesMatch is true", () => {
    const map = new TileMap<number>(1, 1, 1)
    const context: TileContext<number> = { tileMap: map, column: 0, row: 0 }
    expect(edgeMask(context, same, true)).toBe(EdgeBit.North | EdgeBit.East | EdgeBit.South | EdgeBit.West)
    expect(edgeMask(context, same, false)).toBe(0)
  })
})

describe("autoTile", () => {
  it("selects the sprite indexed by the edge mask", () => {
    const tiles = Array.from({ length: 16 }, () => new Sprite(1, 1))
    const appearance = autoTile(tiles, same, false)
    const map = new TileMap<number>(3, 3, 0)
    map.set(1, 1, 1)
    map.set(0, 1, 1) // west
    const context: TileContext<number> = { tileMap: map, column: 1, row: 1 }
    const expectedIndex = edgeMask(context, same, false)
    expect(typeof appearance).toBe("function")
    if (typeof appearance === "function") {
      expect(appearance(context)).toBe(tiles[expectedIndex]!)
    }
  })

  it("throws without a full 16-entry table", () => {
    expect(() => autoTile([new Sprite(1, 1)], same)).toThrow()
  })
})
