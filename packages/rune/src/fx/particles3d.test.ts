import { describe, expect, it } from "bun:test"
import type { Canvas } from "@/draw/canvas"
import { GridDepthBuffer } from "@/draw/raycast/gridDepthBuffer"
import { type Particle3DStyle, Particles3D } from "@/fx/particles3d"
import { Camera3D, type ProjectedPoint, type Projector3D, type ScreenRay, type Viewport3D } from "@/geom/camera3d"
import type { Draw3DContext } from "@/scene/entity3d"

// Maps a world point straight to screen: x/y are offsets from the viewport centre
// and depth is the point's z, so tests drive screen position + depth directly.
class StubProjector implements Projector3D {
  projectInto(
    out: ProjectedPoint,
    worldPoint: { x: number; y: number; z: number },
    _altitude: number,
    _camera: Camera3D,
    viewport: Viewport3D,
  ): ProjectedPoint | null {
    out.x = Math.round(viewport.centerX + worldPoint.x)
    out.y = Math.round(viewport.centerY + worldPoint.y)
    out.depth = worldPoint.z
    return out
  }
  rayInto(): ScreenRay | null {
    return null
  }
}

const viewport: Viewport3D = { centerX: 0, centerY: 0, radius: 20, aspectY: 0.5 }
const canvas = { width: 80, height: 40, setCell() {} } as unknown as Canvas

// A recording style + a context wired to it, so draw() can be asserted on.
function harness(occlude = false): {
  style: Particle3DStyle
  calls: { x: number; y: number; depth: number; lifeFraction: number }[]
  ctx: Draw3DContext
} {
  const calls: { x: number; y: number; depth: number; lifeFraction: number }[] = []
  const style: Particle3DStyle = {
    draw(_canvas, x, y, depth, lifeFraction) {
      calls.push({ x, y, depth, lifeFraction })
    },
  }
  const ctx: Draw3DContext = {
    canvas,
    camera: new Camera3D({ projector: new StubProjector() }),
    viewport,
    depth: new GridDepthBuffer(10, 10),
    occlude,
    target: null,
  }
  return { style, calls, ctx }
}

describe("Particles3D", () => {
  it("emit adds active particles", () => {
    const { style } = harness()
    const fx = new Particles3D({ style, lifetimeMilliseconds: 1000 })
    fx.emit(5)
    expect(fx.activeCount).toBe(5)
  })

  it("particles expire after their lifetime elapses", () => {
    const { style } = harness()
    const fx = new Particles3D({ style, lifetimeMilliseconds: 100 })
    fx.emit(3)
    fx.update(101)
    expect(fx.activeCount).toBe(0)
  })

  it("respects maximumParticles cap", () => {
    const { style } = harness()
    const fx = new Particles3D({ style, lifetimeMilliseconds: 1000, maximumParticles: 3 })
    fx.emit(10)
    expect(fx.activeCount).toBe(3)
  })

  it("snapshots the moving emitter origin per emit", () => {
    const { style, calls, ctx } = harness()
    const fx = new Particles3D({ style, lifetimeMilliseconds: 1000, minDepth: Number.NEGATIVE_INFINITY })
    fx.origin.set(1, 0, 1)
    fx.emit(1)
    fx.origin.set(5, 0, 1)
    fx.emit(1)
    fx.draw(ctx)
    expect(calls.map((c) => c.x).sort((a, b) => a - b)).toEqual([1, 5])
  })

  it("drift integrates velocity into position over time", () => {
    const { style, calls, ctx } = harness()
    const fx = new Particles3D({
      style,
      lifetimeMilliseconds: 10_000,
      minDepth: Number.NEGATIVE_INFINITY,
    })
    fx.velocity.set(10, 0, 0) // 10 units/s along x
    fx.origin.set(0, 0, 1)
    fx.emit(1)
    fx.update(1000) // 1s -> x advances by ~10
    fx.draw(ctx)
    expect(calls[0]!.x).toBe(10)
  })

  it("near-cull skips particles below minDepth", () => {
    const { style, calls, ctx } = harness()
    const fx = new Particles3D({ style, lifetimeMilliseconds: 1000, minDepth: 0.1 })
    fx.origin.set(0, 0, 0.05) // behind the near-cull plane
    fx.emit(1)
    fx.draw(ctx)
    expect(calls.length).toBe(0)
  })

  it("occlusion hides particles behind written depth", () => {
    const occluded = harness(true)
    const fx = new Particles3D({
      style: occluded.style,
      lifetimeMilliseconds: 1000,
      minDepth: Number.NEGATIVE_INFINITY,
    })
    fx.origin.set(2, 3, 0.5)
    fx.emit(1)
    occluded.ctx.depth.writeIfNearer(2, 3, 0.9) // nearer surface in front of the particle
    fx.draw(occluded.ctx)
    expect(occluded.calls.length).toBe(0)

    // Same particle draws when occlusion is off.
    const open = harness(false)
    const fx2 = new Particles3D({ style: open.style, lifetimeMilliseconds: 1000, minDepth: Number.NEGATIVE_INFINITY })
    fx2.origin.set(2, 3, 0.5)
    fx2.emit(1)
    open.ctx.depth.writeIfNearer(2, 3, 0.9)
    fx2.draw(open.ctx)
    expect(open.calls.length).toBe(1)
  })

  it("lifeFraction passed to the style runs 0 -> 1 over the lifetime", () => {
    const { style, calls, ctx } = harness()
    const fx = new Particles3D({ style, lifetimeMilliseconds: 100, minDepth: Number.NEGATIVE_INFINITY })
    fx.origin.set(0, 0, 1)
    fx.emit(1)
    fx.update(50)
    fx.draw(ctx)
    expect(calls[0]!.lifeFraction).toBeCloseTo(0.5)
  })
})
