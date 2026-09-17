import { describe, expect, it } from "bun:test"
import {
  Camera3D,
  OrthographicProjector3D,
  PerspectiveProjector3D,
  type ProjectedPoint,
  type Viewport3D,
} from "@/geom/camera3d"
import { Vector3 } from "@/math/vector3"

// A camera at +z looking toward the origin (down -z), the generic default.
const viewport: Viewport3D = { centerX: 40, centerY: 12, radius: 20, aspectY: 0.5 }

function out(): ProjectedPoint {
  return { x: 0, y: 0, depth: 0 }
}

// Eight corners of a unit cube centred on the origin, in front of the camera.
const cube = [
  new Vector3(-0.5, -0.5, -0.5),
  new Vector3(0.5, -0.5, -0.5),
  new Vector3(-0.5, 0.5, -0.5),
  new Vector3(0.5, 0.5, -0.5),
  new Vector3(-0.5, -0.5, 0.5),
  new Vector3(0.5, -0.5, 0.5),
  new Vector3(-0.5, 0.5, 0.5),
  new Vector3(0.5, 0.5, 0.5),
]

describe("OrthographicProjector3D", () => {
  const camera = new Camera3D({
    position: new Vector3(0, 0, 3),
    forward: new Vector3(0, 0, -1),
    projector: new OrthographicProjector3D(),
  })

  it("projects the origin to the viewport centre", () => {
    const p = camera.projectInto(out(), Vector3.zero, 1, viewport)
    expect(p).not.toBeNull()
    expect(p!.x).toBe(viewport.centerX)
    expect(p!.y).toBe(viewport.centerY)
  })

  it("maps +world-x to screen right and world up (-y) to screen up", () => {
    const right = camera.projectInto(out(), new Vector3(0.5, 0, 0), 1, viewport)!
    const up = camera.projectInto(out(), new Vector3(0, -0.5, 0), 1, viewport)!
    expect(right.x).toBeGreaterThan(viewport.centerX)
    expect(up.y).toBeLessThan(viewport.centerY)
  })

  it("culls points behind the camera", () => {
    // Camera is at z=3 looking toward -z; a point past it at z=5 is behind.
    const behind = camera.projectInto(out(), new Vector3(0, 0, 5), 1, viewport)
    expect(behind).toBeNull()
  })

  it("ortho ignores depth for scale: all cube corners stay on screen", () => {
    for (const corner of cube) {
      const p = camera.projectInto(out(), corner, 1, viewport)
      expect(p).not.toBeNull()
      expect(p!.x).toBeGreaterThanOrEqual(viewport.centerX - viewport.radius)
      expect(p!.x).toBeLessThanOrEqual(viewport.centerX + viewport.radius)
    }
  })

  it("round-trips a ray back through the projector direction", () => {
    const ray = camera.rayInto(
      { origin: new Vector3(), direction: new Vector3() },
      viewport.centerX,
      viewport.centerY,
      viewport,
    )
    expect(ray).not.toBeNull()
    expect(ray!.direction.z).toBeCloseTo(-1, 10)
  })
})

describe("PerspectiveProjector3D", () => {
  const camera = new Camera3D({
    position: new Vector3(0, 0, 3),
    forward: new Vector3(0, 0, -1),
    projector: new PerspectiveProjector3D({ fieldOfView: Math.PI / 2 }),
  })

  it("projects the origin to the viewport centre", () => {
    const p = camera.projectInto(out(), Vector3.zero, 1, viewport)
    expect(p).not.toBeNull()
    expect(p!.x).toBe(viewport.centerX)
    expect(p!.y).toBe(viewport.centerY)
  })

  it("makes nearer geometry project larger (perspective divide)", () => {
    // Same world x, different distance: the nearer corner lands farther from centre.
    const near = camera.projectInto(out(), new Vector3(0.5, 0, 0.5), 1, viewport)!
    const far = camera.projectInto(out(), new Vector3(0.5, 0, -0.5), 1, viewport)!
    const nearOffset = Math.abs(near.x - viewport.centerX)
    const farOffset = Math.abs(far.x - viewport.centerX)
    expect(nearOffset).toBeGreaterThan(farOffset)
    // Nearer = larger depth in the LARGER=NEARER convention.
    expect(near.depth).toBeGreaterThan(far.depth)
  })

  it("culls points behind the near plane", () => {
    const behind = camera.projectInto(out(), new Vector3(0, 0, 4), 1, viewport)
    expect(behind).toBeNull()
  })
})
