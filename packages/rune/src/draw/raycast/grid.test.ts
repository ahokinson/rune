import { describe, expect, it } from "bun:test"
import { Camera } from "@/draw/camera"
import { InMemoryCanvas } from "@/draw/canvas"
import type { SurfaceColor } from "@/draw/color"
import { ColumnDepthBuffer } from "@/draw/raycast/columnDepthBuffer"
import {
  type FlatSample,
  type GridSurfaces,
  renderGridSurfaces,
  type SurfaceShader,
  type WallSample,
} from "@/draw/raycast/grid"
import { RaycastProjection } from "@/draw/raycast/projection"
import { Angle } from "@/math/angle"
import { Vector2 } from "@/math/vector2"

const COLUMNS = 40
const ROWS = 24

// A 1-cell-thick solid border around an open 8x8 room with a flat floor at 0
// and ceiling at 2. Out-of-bounds reads as solid (closes the world).
class RoomSurfaces implements GridSurfaces {
  isSolid(column: number, row: number): boolean {
    return column <= 0 || row <= 0 || column >= 7 || row >= 7
  }
  floorHeight(): number {
    return 0
  }
  ceilingHeight(): number {
    return 2
  }
}

// Distinct flat colours per surface so we can assert which surface a cell came
// from. Walls also encode the side flag in green.
class FlatShader implements SurfaceShader {
  wallPixel(sample: WallSample, out: SurfaceColor): void {
    out.r = 200
    out.g = sample.isSide ? 120 : 60
    out.b = 0
  }
  floorPixel(_sample: FlatSample, out: SurfaceColor): void {
    out.r = 0
    out.g = 160
    out.b = 0
  }
  ceilingPixel(_sample: FlatSample, out: SurfaceColor): void {
    out.r = 0
    out.g = 0
    out.b = 200
  }
}

function render(yawDegrees: number, eyeZ = 1): { canvas: InMemoryCanvas; depth: ColumnDepthBuffer } {
  const projection = new RaycastProjection({ yaw: Angle.fromDegrees(yawDegrees) })
  const camera = new Camera(new Vector2(3.5, 3.5), projection)
  const canvas = new InMemoryCanvas(COLUMNS, ROWS)
  const depth = new ColumnDepthBuffer(COLUMNS, ROWS)
  depth.clear()
  renderGridSurfaces({
    canvas,
    camera,
    projection,
    surfaces: new RoomSurfaces(),
    shader: new FlatShader(),
    depthBuffer: depth,
    screenColumns: COLUMNS,
    screenRows: ROWS,
    eyeZ,
  })
  return { canvas, depth }
}

function classify(canvas: InMemoryCanvas, x: number, y: number): "wall" | "floor" | "ceiling" | "other" {
  const cell = canvas.cellAt(x, y)
  if (!cell) return "other"
  const { red, green, blue } = cell.foreground.toBytes()
  if (red > 150 && blue === 0) return "wall"
  if (green > 100 && red === 0 && blue === 0) return "floor"
  if (blue > 150 && red === 0 && green === 0) return "ceiling"
  return "other"
}

describe("renderGridSurfaces", () => {
  it("draws ceiling above the horizon, wall across the middle, floor below", () => {
    const { canvas } = render(0)
    const midColumn = Math.floor(COLUMNS / 2)
    expect(classify(canvas, midColumn, 1)).toBe("ceiling")
    expect(classify(canvas, midColumn, Math.floor(ROWS / 2))).toBe("wall")
    expect(classify(canvas, midColumn, ROWS - 2)).toBe("floor")
  })

  it("writes a finite per-column depth wherever a wall is hit", () => {
    const { depth } = render(0)
    const midColumn = Math.floor(COLUMNS / 2)
    expect(Number.isFinite(depth.get(midColumn))).toBe(true)
    expect(depth.get(midColumn)).toBeGreaterThan(0)
  })

  it("is deterministic across repeated renders", () => {
    const a = render(37)
    const b = render(37)
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLUMNS; x++) {
        expect(classify(a.canvas, x, y)).toBe(classify(b.canvas, x, y))
        expect(a.depth.getCell(x, y)).toBe(b.depth.getCell(x, y))
      }
    }
  })

  it("renders walls on every axis-aligned heading", () => {
    for (const yaw of [0, 90, 180, 270]) {
      const { canvas } = render(yaw)
      const midColumn = Math.floor(COLUMNS / 2)
      expect(classify(canvas, midColumn, Math.floor(ROWS / 2))).toBe("wall")
    }
  })

  it("respects maxDistance: a tiny cutoff leaves far columns unwritten in depth", () => {
    const projection = new RaycastProjection({ yaw: 0 })
    const camera = new Camera(new Vector2(3.5, 3.5), projection)
    const depth = new ColumnDepthBuffer(COLUMNS, ROWS)
    depth.clear()
    renderGridSurfaces({
      canvas: new InMemoryCanvas(COLUMNS, ROWS),
      camera,
      projection,
      surfaces: new RoomSurfaces(),
      shader: new FlatShader(),
      depthBuffer: depth,
      screenColumns: COLUMNS,
      screenRows: ROWS,
      eyeZ: 1,
      maxDistance: 0.1,
    })
    const midColumn = Math.floor(COLUMNS / 2)
    expect(depth.get(midColumn)).toBe(Number.POSITIVE_INFINITY)
  })
})
