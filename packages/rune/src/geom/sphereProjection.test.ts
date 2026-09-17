import { describe, expect, it } from "bun:test"
import { SphereProjection, type SphereView } from "@/geom/sphereProjection"

describe("SphereProjection", () => {
  const view: SphereView = { centerX: 40, centerY: 20, radius: 15, rotation: 0 }

  it("maps the disc centre to the camera-facing normal", () => {
    const proj = new SphereProjection()
    const surface = proj.screenToSurface(view.centerX, view.centerY, view)
    expect(surface).not.toBeNull()
    expect(surface!.normal.x).toBeCloseTo(0, 10)
    expect(surface!.normal.y).toBeCloseTo(0, 10)
    expect(surface!.normal.z).toBeCloseTo(1, 10)
  })

  it("returns null for cells outside the disc", () => {
    const proj = new SphereProjection()
    expect(proj.screenToSurface(view.centerX + view.radius * 2, view.centerY, view)).toBeNull()
  })

  it("round-trips screenToSurface -> worldToScreen", () => {
    const proj = new SphereProjection({ tiltPitch: -0.1, tiltRoll: 0.03, aspectY: 0.5 })
    const tiltedView: SphereView = { centerX: 40, centerY: 20, radius: 15, rotation: 0.7 }
    const surface = proj.screenToSurface(43, 21, tiltedView)
    expect(surface).not.toBeNull()
    const screen = proj.worldToScreen(surface!.theta, surface!.phi, 1, tiltedView)
    expect(screen).not.toBeNull()
    expect(screen!.x).toBe(43)
    expect(screen!.y).toBe(21)
    // Forward depth recovers the surface normal's z (true surface depth).
    expect(screen!.depth).toBeCloseTo(surface!.normal.z, 6)
  })

  it("culls directions on the far hemisphere", () => {
    const proj = new SphereProjection()
    // A point on the equator at lon = pi faces directly away from the camera.
    const behind = proj.worldToScreen(0, Math.PI, 1, view)
    expect(behind).toBeNull()
  })

  it("altitude lifts the screen position without changing depth", () => {
    const proj = new SphereProjection()
    const surface = proj.screenToSurface(46, 21, view)!
    const onSurface = proj.worldToScreen(surface.theta, surface.phi, 1, view)!
    const lifted = proj.worldToScreen(surface.theta, surface.phi, 1.5, view)!
    expect(lifted.depth).toBeCloseTo(onSurface.depth, 10)
    // Lifted point sits farther from the disc centre than the on-surface point.
    const onR = Math.hypot(onSurface.x - view.centerX, onSurface.y - view.centerY)
    const liftR = Math.hypot(lifted.x - view.centerX, lifted.y - view.centerY)
    expect(liftR).toBeGreaterThan(onR)
  })
})
