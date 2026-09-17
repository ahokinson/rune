import { describe, expect, it } from "bun:test"
import { Camera } from "@/draw/camera"
import { OrthographicProjection, RaycastProjection } from "@/draw/raycast/projection"
import { Angle } from "@/math/angle"
import { Vector2 } from "@/math/vector2"

describe("OrthographicProjection", () => {
  it("uses zoom for world-to-screen conversion", () => {
    const camera = new Camera(new Vector2(10, 20), new OrthographicProjection(2))
    const screen = camera.worldToScreen(new Vector2(15, 25))
    expect(screen.x).toBe(10)
    expect(screen.y).toBe(10)
  })

  it("inverts via screen-to-world", () => {
    const camera = new Camera(new Vector2(10, 20), new OrthographicProjection(2))
    const world = camera.screenToWorld(new Vector2(10, 10))
    expect(world.x).toBe(15)
    expect(world.y).toBe(25)
  })

  it("returns camera position when zoom is zero", () => {
    const camera = new Camera(new Vector2(7, 7), new OrthographicProjection(0))
    const world = camera.screenToWorld(new Vector2(5, 5))
    expect(world.x).toBe(7)
    expect(world.y).toBe(7)
  })

  it("default camera projection preserves prior behavior", () => {
    const camera = new Camera(new Vector2(1, 2))
    const screen = camera.worldToScreen(new Vector2(4, 6))
    expect(screen.x).toBe(3)
    expect(screen.y).toBe(4)
  })
})

describe("RaycastProjection", () => {
  it("forward points along +x when yaw is zero", () => {
    const projection = new RaycastProjection({ yaw: 0 })
    const forward = projection.forward()
    expect(forward.x).toBeCloseTo(1, 10)
    expect(forward.y).toBeCloseTo(0, 10)
  })

  it("right is perpendicular to forward", () => {
    const projection = new RaycastProjection({ yaw: 0 })
    const forward = projection.forward()
    const right = projection.right()
    expect(forward.dot(right)).toBeCloseTo(0, 10)
  })

  it("center column ray matches forward direction", () => {
    const projection = new RaycastProjection({ yaw: 0, fieldOfView: Angle.fromDegrees(90) })
    const ray = projection.viewRayForColumn(50, 101)
    const normalized = ray.normalize()
    expect(normalized.x).toBeCloseTo(1, 10)
    expect(normalized.y).toBeCloseTo(0, 10)
  })

  it("left edge ray points away from right basis", () => {
    const projection = new RaycastProjection({ yaw: 0, fieldOfView: Angle.fromDegrees(90) })
    const leftRay = projection.viewRayForColumn(0, 101)
    const rightRay = projection.viewRayForColumn(100, 101)
    expect(leftRay.y).toBeLessThan(0)
    expect(rightRay.y).toBeGreaterThan(0)
  })

  it("90deg FOV gives 45deg edges from center", () => {
    const projection = new RaycastProjection({ yaw: 0, fieldOfView: Angle.fromDegrees(90) })
    const rightEdge = projection.viewRayForColumn(100, 101)
    const angle = Math.atan2(rightEdge.y, rightEdge.x)
    expect(angle).toBeCloseTo(Math.PI / 4, 6)
  })

  it("world-to-screen projects a point in front to a screen column", () => {
    const projection = new RaycastProjection({
      yaw: 0,
      fieldOfView: Angle.fromDegrees(90),
      viewportWidth: 101,
      viewportHeight: 24,
    })
    const camera = new Camera(new Vector2(0, 0), projection)
    const directlyAhead = camera.worldToScreen(new Vector2(5, 0))
    expect(directlyAhead.x).toBeCloseTo(50, 6)
    const offsetRight = camera.worldToScreen(new Vector2(5, 5))
    expect(offsetRight.x).toBeCloseTo(100, 6)
  })

  it("world-to-screen yields NaN for points behind the camera", () => {
    const projection = new RaycastProjection({ yaw: 0 })
    const camera = new Camera(new Vector2(0, 0), projection)
    const behind = camera.worldToScreen(new Vector2(-5, 0))
    expect(Number.isNaN(behind.x)).toBe(true)
  })
})
