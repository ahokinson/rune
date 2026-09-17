import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { bloom } from "@/fx/bloom"
import { chromaticAberration } from "@/fx/chromaticAberration"
import { crt } from "@/fx/crt"
import { dither } from "@/fx/dither"
import { PostProcessPipeline } from "@/fx/pipeline"

function fill(canvas: InMemoryCanvas, r: number, g: number, b: number): void {
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) canvas.setCellBytes(x, y, " ", r, g, b, r, g, b)
  }
}

describe("crt", () => {
  it("darkens the corners more than the centre", () => {
    const canvas = new InMemoryCanvas(21, 21)
    fill(canvas, 255, 255, 255)
    crt({ vignette: 0.6, scanlineDarkness: 1 })(canvas)
    const center = canvas.cellAt(10, 10)!.background.red
    const corner = canvas.cellAt(0, 0)!.background.red
    expect(corner).toBeLessThan(center)
  })
})

describe("dither", () => {
  it("quantizes a flat grey to the available levels", () => {
    const canvas = new InMemoryCanvas(8, 8)
    fill(canvas, 128, 128, 128)
    dither({ levels: 2 })(canvas)
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const value = Math.round(canvas.cellAt(x, y)!.foreground.red * 255)
        expect(value === 0 || value === 255).toBe(true)
      }
    }
  })
})

describe("chromaticAberration", () => {
  it("splits the red and blue channels", () => {
    const canvas = new InMemoryCanvas(21, 5)
    fill(canvas, 0, 0, 0)
    // A bright white column off-centre.
    for (let y = 0; y < 5; y++) canvas.setCellBytes(15, y, " ", 255, 255, 255, 255, 255, 255)
    chromaticAberration({ amount: 2, edgeBias: 0 })(canvas)
    let split = false
    for (let x = 0; x < 21; x++) {
      const cell = canvas.cellAt(x, 2)!
      if (Math.round(cell.background.red * 255) !== Math.round(cell.background.blue * 255)) split = true
    }
    expect(split).toBe(true)
  })
})

describe("bloom", () => {
  it("spreads a bright cell into its neighbours", () => {
    const canvas = new InMemoryCanvas(9, 9)
    fill(canvas, 0, 0, 0)
    canvas.setCellBytes(4, 4, " ", 255, 255, 255, 255, 255, 255)
    bloom({ threshold: 180, radius: 2, intensity: 1 })(canvas)
    // A neighbour that was black should now glow.
    expect(canvas.cellAt(5, 4)!.background.red).toBeGreaterThan(0)
  })
})

describe("PostProcessPipeline", () => {
  it("runs passes in order", () => {
    const order: string[] = []
    const pipeline = new PostProcessPipeline()
    pipeline.add(() => order.push("a")).add(() => order.push("b"))
    const canvas = new InMemoryCanvas(4, 4, Color.BLACK)
    pipeline.apply(canvas, 0)
    expect(order).toEqual(["a", "b"])
    expect(pipeline.length).toBe(2)
  })
})
