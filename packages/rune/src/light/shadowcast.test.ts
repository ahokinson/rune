import { describe, expect, it } from "bun:test"
import { computeFieldOfView, fieldOfViewSet } from "@/light/shadowcast"

describe("computeFieldOfView", () => {
  it("always reveals the origin", () => {
    const seen = fieldOfViewSet(5, 5, 4, () => true)
    expect(seen.has("5,5")).toBe(true)
  })

  it("reveals an open disc within radius and nothing beyond", () => {
    const radius = 5
    const seen = fieldOfViewSet(10, 10, radius, () => false)
    // A cell just inside the radius is visible; one well outside is not.
    expect(seen.has("13,10")).toBe(true)
    expect(seen.has("20,10")).toBe(false)
  })

  it("is symmetric across an open field", () => {
    // In open space, if A sees B then B sees A.
    const radius = 6
    const fromA = fieldOfViewSet(0, 0, radius, () => false)
    for (const key of fromA) {
      const [cx, cy] = key.split(",").map(Number) as [number, number]
      const fromB = fieldOfViewSet(cx, cy, radius, () => false)
      expect(fromB.has("0,0")).toBe(true)
    }
  })

  it("occludes cells behind a wall", () => {
    // A vertical wall at x=12 should hide the column behind it from an origin at x=10.
    const isBlocking = (column: number, _row: number) => column === 12
    const seen = fieldOfViewSet(10, 10, 8, isBlocking)
    expect(seen.has("12,10")).toBe(true) // the wall itself is seen
    expect(seen.has("14,10")).toBe(false) // directly behind the wall is hidden
  })

  it("passes the measured distance to reveal", () => {
    let originDistance = -1
    computeFieldOfView({
      originX: 3,
      originY: 3,
      radius: 4,
      isBlocking: () => false,
      reveal: (column, row, distance) => {
        if (column === 3 && row === 3) originDistance = distance
      },
    })
    expect(originDistance).toBe(0)
  })
})
