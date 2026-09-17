import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { FilterCanvas, type ScreenEffect } from "@/fx/screen"

describe("FilterCanvas", () => {
  it("shifts draws horizontally by the summed rowOffset", () => {
    const inner = new InMemoryCanvas(10, 4)
    const shift: ScreenEffect = { rowOffset: () => 2 }
    const fc = new FilterCanvas(inner, [shift])
    fc.setCell(1, 1, "X", Color.WHITE)
    expect(inner.cellAt(3, 1)!.character).toBe("X")
    expect(inner.cellAt(1, 1)!.character).toBe(" ")
  })

  it("scales colours by the product of every brightness", () => {
    const inner = new InMemoryCanvas(4, 4)
    const dim: ScreenEffect = { brightness: () => 0.5 }
    const dimmer: ScreenEffect = { brightness: () => 0.5 }
    const fc = new FilterCanvas(inner, [dim, dimmer])
    fc.setCell(0, 0, "X", Color.WHITE)
    expect(inner.cellAt(0, 0)!.foreground.red).toBeCloseTo(0.25)
  })

  it("composes rowOffsets from multiple effects", () => {
    const inner = new InMemoryCanvas(10, 4)
    const fc = new FilterCanvas(inner, [{ rowOffset: () => 1 }, { rowOffset: () => 2 }])
    fc.setCell(0, 0, "X", Color.WHITE)
    expect(inner.cellAt(3, 0)!.character).toBe("X")
  })

  it("runs postPass against the underlying canvas", () => {
    const inner = new InMemoryCanvas(4, 4)
    const overlay: ScreenEffect = {
      postPass: (canvas) => canvas.setCell(0, 0, "P", Color.WHITE),
    }
    const fc = new FilterCanvas(inner, [overlay])
    fc.postPass(0)
    expect(inner.cellAt(0, 0)!.character).toBe("P")
  })
})
