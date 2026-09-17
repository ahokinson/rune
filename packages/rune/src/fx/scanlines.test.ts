import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { drawScanlines } from "@/fx/scanlines"

describe("drawScanlines", () => {
  it("draws a line every `spacing` rows by default (4)", () => {
    const canvas = new InMemoryCanvas(10, 10)
    drawScanlines(canvas)
    expect(canvas.cellAt(0, 0)!.character).toBe("░")
    expect(canvas.cellAt(5, 4)!.character).toBe("░")
    expect(canvas.cellAt(0, 1)!.character).toBe(" ")
  })

  it("honours custom spacing and character", () => {
    const canvas = new InMemoryCanvas(10, 10)
    drawScanlines(canvas, { spacing: 2, character: "-" })
    expect(canvas.cellAt(0, 0)!.character).toBe("-")
    expect(canvas.cellAt(0, 2)!.character).toBe("-")
    expect(canvas.cellAt(0, 1)!.character).toBe(" ")
  })

  it("skips cells the predicate rejects", () => {
    const canvas = new InMemoryCanvas(10, 10)
    drawScanlines(canvas, { spacing: 1, skip: (x) => x < 2 })
    expect(canvas.cellAt(0, 0)!.character).toBe(" ")
    expect(canvas.cellAt(1, 0)!.character).toBe(" ")
    expect(canvas.cellAt(2, 0)!.character).toBe("░")
  })
})
