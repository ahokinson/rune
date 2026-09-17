import { describe, expect, it } from "bun:test"
import { Rectangle } from "@/math/rectangle"
import { Vector2 } from "@/math/vector2"

describe("Rectangle", () => {
  it("reports edges and centre", () => {
    const rect = new Rectangle(10, 20, 4, 6)
    expect(rect.left).toBe(10)
    expect(rect.right).toBe(14)
    expect(rect.top).toBe(20)
    expect(rect.bottom).toBe(26)
    expect(rect.centerX).toBe(12)
    expect(rect.centerY).toBe(23)
  })

  it("contains points inside, on the top/left edge, but not the bottom/right edge", () => {
    const rect = new Rectangle(0, 0, 4, 4)
    expect(rect.contains(new Vector2(2, 2))).toBe(true)
    expect(rect.contains(new Vector2(0, 0))).toBe(true)
    expect(rect.contains(new Vector2(4, 4))).toBe(false)
    expect(rect.contains(new Vector2(5, 2))).toBe(false)
  })

  it("detects overlapping rectangles", () => {
    const a = new Rectangle(0, 0, 4, 4)
    const b = new Rectangle(2, 2, 4, 4)
    const c = new Rectangle(10, 10, 1, 1)
    expect(a.intersects(b)).toBe(true)
    expect(a.intersects(c)).toBe(false)
  })

  it("inflate expands evenly on all sides", () => {
    const rect = new Rectangle(5, 5, 10, 10).inflate(2)
    expect(rect.x).toBe(3)
    expect(rect.y).toBe(3)
    expect(rect.width).toBe(14)
    expect(rect.height).toBe(14)
  })
})
