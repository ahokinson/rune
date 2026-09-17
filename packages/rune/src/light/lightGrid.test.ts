import { describe, expect, it } from "bun:test"
import { Color, type SurfaceColor } from "@/draw/color"
import { LightGrid } from "@/light/lightGrid"

describe("LightGrid", () => {
  it("is brightest at the source and falls off to zero at the radius", () => {
    const grid = new LightGrid(20, 20)
    grid.addLight({ x: 10.5, y: 10.5, color: Color.WHITE, radius: 6 })
    const center: SurfaceColor = { r: 0, g: 0, b: 0 }
    const edge: SurfaceColor = { r: 0, g: 0, b: 0 }
    grid.sampleInto(10, 10, center)
    grid.sampleInto(16, 10, edge)
    expect(center.r).toBeGreaterThan(edge.r)
    expect(edge.r).toBe(0) // outside the radius
  })

  it("accumulates multiple lights", () => {
    const grid = new LightGrid(10, 10)
    grid.addLight({ x: 5.5, y: 5.5, color: Color.RED, radius: 4 })
    grid.addLight({ x: 5.5, y: 5.5, color: Color.BLUE, radius: 4 })
    const out: SurfaceColor = { r: 0, g: 0, b: 0 }
    grid.sampleInto(5, 5, out)
    expect(out.r).toBeGreaterThan(0)
    expect(out.b).toBeGreaterThan(0)
  })

  it("addInto clamps to 255", () => {
    const grid = new LightGrid(4, 4)
    grid.addLight({ x: 2.5, y: 2.5, color: Color.WHITE, radius: 3, intensity: 5 })
    const out: SurfaceColor = { r: 200, g: 200, b: 200 }
    grid.addInto(2, 2, out)
    expect(out.r).toBe(255)
  })

  it("occludes lit cells behind walls", () => {
    const grid = new LightGrid(20, 8)
    const isBlocking = (column: number, _row: number) => column === 6
    grid.addLight({ x: 4.5, y: 4.5, color: Color.WHITE, radius: 10 }, isBlocking)
    const behind: SurfaceColor = { r: 0, g: 0, b: 0 }
    grid.sampleInto(9, 4, behind)
    expect(behind.r).toBe(0)
  })

  it("clear resets the buffer", () => {
    const grid = new LightGrid(6, 6)
    grid.addLight({ x: 3.5, y: 3.5, color: Color.WHITE, radius: 4 })
    grid.clear()
    const out: SurfaceColor = { r: 0, g: 0, b: 0 }
    grid.sampleInto(3, 3, out)
    expect(out.r).toBe(0)
  })
})
