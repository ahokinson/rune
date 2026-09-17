import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import type { SurfaceColor } from "@/draw/color"
import { Color } from "@/draw/color"
import type { Fragment, Mesh, MeshShader, RenderMeshContext } from "@/draw/mesh/rasterizer"
import { renderMesh } from "@/draw/mesh/rasterizer"
import { SubpixelTarget } from "@/draw/mesh/subpixelTarget"
import { Camera3D, PerspectiveProjector3D, type Viewport3D } from "@/geom/camera3d"
import { Matrix4 } from "@/math/matrix4"
import { Vector3 } from "@/math/vector3"

const WIDTH = 80
const CELL_ROWS = 40

// A shader that bakes the fragment's uv straight into the colour so tests can
// decode interpolated u/v by reading back the subpixel buffer.
const uvShader: MeshShader = {
  shade(fragment: Fragment, out: SurfaceColor): void {
    out.r = Math.round(fragment.u * 255)
    out.g = Math.round(fragment.v * 255)
    out.b = 0
  },
}

function makeCamera(): Camera3D {
  return new Camera3D({
    position: new Vector3(0, 0, 0),
    forward: new Vector3(0, 0, -1),
    up: new Vector3(0, -1, 0),
    projector: new PerspectiveProjector3D({ fieldOfView: Math.PI / 3, near: 0.05 }),
  })
}

function makeViewport(target: SubpixelTarget): Viewport3D {
  return { centerX: target.width / 2, centerY: target.height / 2, radius: 20, aspectY: 1 }
}

function rgbAt(target: SubpixelTarget, x: number, y: number): [number, number, number] {
  const o = (y * target.width + x) * 3
  return [target.color[o]!, target.color[o + 1]!, target.color[o + 2]!]
}

describe("SubpixelTarget", () => {
  it("packs upper/lower subpixels into one ▀ cell", () => {
    const target = new SubpixelTarget(1, 1)
    target.clear(Color.BLACK)
    target.setUnsafe(0, 0, 200, 10, 20) // upper
    target.setUnsafe(0, 1, 30, 40, 220) // lower
    const canvas = new InMemoryCanvas(1, 1)
    target.resolveTo(canvas)
    const cell = canvas.cellAt(0, 0)!
    expect(cell.character).toBe("▀")
    expect(cell.foreground.toBytes()).toMatchObject({ red: 200, green: 10, blue: 20 })
    expect(cell.background.toBytes()).toMatchObject({ red: 30, green: 40, blue: 220 })
  })
})

describe("renderMesh", () => {
  it("interpolates uv perspective-correct (not affine) across a receding quad", () => {
    const target = new SubpixelTarget(WIDTH, CELL_ROWS)
    target.clear(Color.BLACK)
    const canvas = new InMemoryCanvas(WIDTH, CELL_ROWS)

    // A wall whose left edge is near (zv≈1) and right edge far (zv≈5); u runs
    // 0→1 left→right. Perspective bunches u toward the far side, so the screen
    // midpoint samples u < 0.5 (affine would give exactly 0.5).
    const positions = new Float32Array([
      -1,
      -1,
      -1, // 0 near, top
      -1,
      1,
      -1, // 1 near, bottom
      3,
      1,
      -5, // 2 far, bottom
      3,
      -1,
      -5, // 3 far, top
    ])
    const uvs = new Float32Array([0, 0, 0, 1, 1, 1, 1, 0])
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3])
    const mesh: Mesh = { positions, indices, uvs }

    const context: RenderMeshContext = {
      canvas,
      camera: makeCamera(),
      viewport: makeViewport(target),
      target,
      mesh,
      model: new Matrix4(),
      shader: uvShader,
      cullBackface: false,
    }
    renderMesh(context)

    const midRow = target.height / 2
    let minX = -1
    let maxX = -1
    for (let x = 0; x < WIDTH; x++) {
      const [r, g] = rgbAt(target, x, midRow)
      if (r > 0 || g > 0) {
        if (minX < 0) minX = x
        maxX = x
      }
    }
    expect(minX).toBeGreaterThanOrEqual(0)
    expect(maxX).toBeGreaterThan(minX + 10)

    const uLeft = rgbAt(target, minX + 1, midRow)[0] / 255
    const uRight = rgbAt(target, maxX - 1, midRow)[0] / 255
    const uMid = rgbAt(target, Math.floor((minX + maxX) / 2), midRow)[0] / 255

    expect(uLeft).toBeLessThan(0.15)
    expect(uRight).toBeGreaterThan(0.85)
    // The decisive perspective check: midpoint u is pulled well below the affine 0.5.
    expect(uMid).toBeLessThan(0.45)
  })

  it("clips a triangle straddling the near plane without exploding", () => {
    const target = new SubpixelTarget(WIDTH, CELL_ROWS)
    target.clear(Color.BLACK)
    const canvas = new InMemoryCanvas(WIDTH, CELL_ROWS)

    // A wide base in front of the camera with the apex behind it (zv < 0). The
    // near-clipped portion is a trapezoid with real width, so clipping must keep
    // depths finite and coverage on-screen rather than projecting the apex.
    const positions = new Float32Array([
      -2,
      0,
      -1, // front, left
      2,
      0,
      -1, // front, right
      0,
      2,
      3, // behind the camera
    ])
    const indices = new Uint32Array([0, 1, 2])
    const mesh: Mesh = { positions, indices }

    renderMesh({
      canvas,
      camera: makeCamera(),
      viewport: makeViewport(target),
      target,
      mesh,
      model: new Matrix4(),
      shader: uvShader,
      cullBackface: false,
      near: 0.5,
    })

    let covered = 0
    for (let i = 0; i < target.depth.length; i++) {
      const d = target.depth[i]!
      if (d > 0) {
        covered++
        expect(Number.isFinite(d)).toBe(true)
      }
    }
    expect(covered).toBeGreaterThan(0)
  })

  it("culls back faces by winding", () => {
    const front = new Float32Array([-1, -1, -2, 1, -1, -2, 0, 1, -2])
    const reversed = new Float32Array([-1, -1, -2, 0, 1, -2, 1, -1, -2])
    const indices = new Uint32Array([0, 1, 2])

    function coveredCount(positions: Float32Array): number {
      const target = new SubpixelTarget(WIDTH, CELL_ROWS)
      target.clear(Color.BLACK)
      const canvas = new InMemoryCanvas(WIDTH, CELL_ROWS)
      renderMesh({
        canvas,
        camera: makeCamera(),
        viewport: makeViewport(target),
        target,
        mesh: { positions, indices },
        model: new Matrix4(),
        shader: uvShader,
        cullBackface: true,
      })
      let n = 0
      for (let i = 0; i < target.depth.length; i++) if (target.depth[i]! > 0) n++
      return n
    }

    const a = coveredCount(front)
    const b = coveredCount(reversed)
    // Exactly one winding is front-facing: one renders, the other is culled.
    expect(a > 0).not.toBe(b > 0)
  })
})
