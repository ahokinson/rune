import { describe, expect, it } from "bun:test"
import { Rectangle } from "@/math/rectangle"
import { Vector2 } from "@/math/vector2"
import { SpatialGrid } from "@/physics/spatialGrid"
import { Entity2D } from "@/scene/entity2d"

function entityAt(x: number, y: number, width = 1, height = 1): Entity2D {
  return new Entity2D({ position: new Vector2(x, y), size: new Vector2(width, height) })
}

describe("SpatialGrid", () => {
  it("constructor rejects non-positive cellSize", () => {
    expect(() => new SpatialGrid(0)).toThrow()
    expect(() => new SpatialGrid(-1)).toThrow()
  })

  it("query finds an inserted entity whose bounds intersect", () => {
    const grid = new SpatialGrid(4)
    const entity = entityAt(2, 2)
    grid.insert(entity)
    const results = grid.query(new Rectangle(0, 0, 4, 4))
    expect(results.has(entity)).toBe(true)
  })

  it("query returns empty set when no entities lie in bounds", () => {
    const grid = new SpatialGrid(4)
    grid.insert(entityAt(0, 0))
    const results = grid.query(new Rectangle(100, 100, 1, 1))
    expect(results.size).toBe(0)
  })

  it("entity spanning two cells is found from either side", () => {
    const grid = new SpatialGrid(4)
    const entity = entityAt(3, 0, 3, 1) // bounds span x=3..6 -> cells 0 and 1
    grid.insert(entity)
    expect(grid.query(new Rectangle(0, 0, 1, 1)).has(entity)).toBe(true)
    expect(grid.query(new Rectangle(5, 0, 1, 1)).has(entity)).toBe(true)
  })

  it("clear empties the grid", () => {
    const grid = new SpatialGrid(4)
    grid.insert(entityAt(0, 0))
    grid.clear()
    expect(grid.query(new Rectangle(0, 0, 4, 4)).size).toBe(0)
  })

  it("multiple inserts return all overlapping entities deduplicated", () => {
    const grid = new SpatialGrid(4)
    const a = entityAt(0, 0)
    const b = entityAt(1, 1)
    const c = entityAt(2, 2)
    grid.insert(a)
    grid.insert(b)
    grid.insert(c)
    const results = grid.query(new Rectangle(0, 0, 4, 4))
    expect(results.size).toBe(3)
  })
})
