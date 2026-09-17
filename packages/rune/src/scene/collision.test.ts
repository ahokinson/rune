import { describe, expect, it } from "bun:test"
import { Rectangle } from "@/math/rectangle"
import { Vector2 } from "@/math/vector2"
import { contains, intersects, sweep } from "@/physics/boundingBox"
import { cellAt, lineOfSight } from "@/physics/grid"

describe("intersects / contains", () => {
  it("intersects detects overlap", () => {
    expect(intersects(new Rectangle(0, 0, 2, 2), new Rectangle(1, 1, 2, 2))).toBe(true)
    expect(intersects(new Rectangle(0, 0, 2, 2), new Rectangle(3, 0, 2, 2))).toBe(false)
  })

  it("contains detects point inside rectangle", () => {
    expect(contains(new Rectangle(0, 0, 4, 4), new Vector2(2, 2))).toBe(true)
    expect(contains(new Rectangle(0, 0, 4, 4), new Vector2(5, 2))).toBe(false)
  })
})

describe("sweep", () => {
  it("returns null when the path is clear", () => {
    const moving = new Rectangle(0, 0, 1, 1)
    const obstacles = [new Rectangle(10, 10, 1, 1)]
    const hit = sweep(moving, 2, 0, obstacles)
    expect(hit).toBeNull()
  })

  it("reports the obstacle that is hit and a fractional time", () => {
    const moving = new Rectangle(0, 0, 1, 1)
    const obstacles = [new Rectangle(5, 0, 1, 1)]
    const hit = sweep(moving, 10, 0, obstacles)
    expect(hit).not.toBeNull()
    expect(hit!.obstacle).toBe(obstacles[0]!)
    expect(hit!.time).toBeCloseTo(0.4, 5)
    expect(hit!.normalX).toBe(-1)
    expect(hit!.normalY).toBe(0)
  })
})

describe("cellAt", () => {
  it("rounds toward negative infinity", () => {
    expect(cellAt(new Vector2(0.5, 0.5), 1)).toEqual({ column: 0, row: 0 })
    expect(cellAt(new Vector2(-0.5, 0.5), 1)).toEqual({ column: -1, row: 0 })
    expect(cellAt(new Vector2(2.5, 7.5), 2)).toEqual({ column: 1, row: 3 })
  })
})

describe("lineOfSight", () => {
  it("returns true when nothing blocks the path", () => {
    expect(lineOfSight(new Vector2(0, 0), new Vector2(5, 0), () => false)).toBe(true)
  })

  it("returns false when a blocker is encountered", () => {
    const isBlocking = (column: number, row: number) => column === 3 && row === 0
    expect(lineOfSight(new Vector2(0, 0), new Vector2(5, 0), isBlocking)).toBe(false)
  })
})
