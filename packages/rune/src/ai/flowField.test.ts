import { describe, expect, it } from "bun:test"
import { FlowField } from "@/ai/flowField"

describe("FlowField", () => {
  const open = () => true

  it("has zero cost at the goal and rising cost outward", () => {
    const field = FlowField.compute({ column: 0, row: 0 }, 10, 1, open)
    expect(field.costAt(0, 0)).toBe(0)
    expect(field.costAt(5, 0)).toBe(5)
    expect(field.costAt(9, 0)).toBe(9)
  })

  it("points cells toward the goal", () => {
    const field = FlowField.compute({ column: 0, row: 0 }, 10, 1, open)
    const direction = field.directionAt(5, 0)
    expect(direction.x).toBeLessThan(0) // move toward -x (the goal at column 0)
  })

  it("marks cells behind a wall unreachable", () => {
    // Wall column at x=3 splits a 1-row corridor; goal at x=0 can't reach x>3.
    const isPassable = (column: number, _row: number) => column !== 3
    const field = FlowField.compute({ column: 0, row: 0 }, 8, 1, isPassable)
    expect(Number.isFinite(field.costAt(2, 0))).toBe(true)
    expect(field.costAt(5, 0)).toBe(Infinity)
  })

  it("routes around an obstacle on a 2D grid", () => {
    // A vertical wall with a gap; the field should still reach the far side.
    const isPassable = (column: number, row: number) => !(column === 2 && row !== 4)
    const field = FlowField.compute({ column: 0, row: 0 }, 6, 6, isPassable, { allowDiagonal: true })
    expect(Number.isFinite(field.costAt(5, 0))).toBe(true)
  })
})
