import { describe, expect, it } from "bun:test"
import { NavMesh, type NavPolygon } from "@/ai/navmesh"
import { Vector2 } from "@/math/vector2"

function quad(x0: number, y0: number, x1: number, y1: number): NavPolygon {
  return [new Vector2(x0, y0), new Vector2(x1, y0), new Vector2(x1, y1), new Vector2(x0, y1)]
}

// L-shaped walkable area: A (left) — B (right of A) — C (above B). A path from A
// to C must bend around the inner corner at (4, 4).
const mesh = new NavMesh([quad(0, 0, 4, 4), quad(4, 0, 8, 4), quad(4, 4, 8, 8)])

describe("NavMesh", () => {
  it("returns a straight segment within one polygon", () => {
    const path = mesh.findPath(new Vector2(1, 1), new Vector2(3, 3))
    expect(path).not.toBeNull()
    expect(path!.length).toBe(2)
    expect(path![0]!.x).toBeCloseTo(1)
    expect(path![path!.length - 1]!.x).toBeCloseTo(3)
  })

  it("funnels around the inner corner across polygons", () => {
    const start = new Vector2(1, 2)
    const goal = new Vector2(6, 6)
    const path = mesh.findPath(start, goal)
    expect(path).not.toBeNull()
    // Start and goal are the endpoints.
    expect(path![0]!.distanceTo(start)).toBeCloseTo(0)
    expect(path![path!.length - 1]!.distanceTo(goal)).toBeCloseTo(0)
    // The taut path bends at the inner corner (4, 4).
    const bendsAtCorner = path!.some((point) => point.distanceTo(new Vector2(4, 4)) < 1e-6)
    expect(bendsAtCorner).toBe(true)
  })

  it("returns null when an endpoint is outside the mesh", () => {
    expect(mesh.findPath(new Vector2(-5, -5), new Vector2(6, 6))).toBeNull()
    expect(mesh.findPath(new Vector2(1, 1), new Vector2(100, 100))).toBeNull()
  })
})
