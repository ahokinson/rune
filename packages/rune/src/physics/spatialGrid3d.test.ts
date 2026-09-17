import { describe, expect, it } from "bun:test"
import { type AABB3, SpatialGrid3D } from "@/physics/spatialGrid3d"

function box(x: number, y: number, z: number, size = 1): AABB3 {
  return { minX: x, minY: y, minZ: z, maxX: x + size, maxY: y + size, maxZ: z + size }
}

describe("SpatialGrid3D", () => {
  it("returns items whose cells overlap the query box", () => {
    const grid = new SpatialGrid3D<string>(4)
    grid.insert("near", box(0, 0, 0))
    grid.insert("far", box(40, 40, 40))
    const hits = grid.query(box(-1, -1, -1, 3))
    expect(hits.has("near")).toBe(true)
    expect(hits.has("far")).toBe(false)
  })

  it("finds a large item spanning many cells from any overlapping query", () => {
    const grid = new SpatialGrid3D<string>(2)
    grid.insert("big", box(0, 0, 0, 10))
    expect(grid.query(box(8, 8, 8)).has("big")).toBe(true)
    expect(grid.query(box(1, 1, 1)).has("big")).toBe(true)
  })

  it("deduplicates an item that spans the query range", () => {
    const grid = new SpatialGrid3D<string>(1)
    grid.insert("wide", box(0, 0, 0, 5))
    const hits = grid.query(box(0, 0, 0, 5))
    expect([...hits]).toEqual(["wide"])
  })

  it("clear empties the grid", () => {
    const grid = new SpatialGrid3D<string>(4)
    grid.insert("a", box(0, 0, 0))
    grid.clear()
    expect(grid.query(box(0, 0, 0)).size).toBe(0)
  })

  it("rejects a non-positive cell size", () => {
    expect(() => new SpatialGrid3D(0)).toThrow()
  })
})
