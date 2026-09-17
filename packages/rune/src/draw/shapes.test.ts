import { describe, expect, it } from "bun:test"
import { boxStyles } from "@/draw/box"
import { InMemoryCanvas } from "@/draw/canvas"
import { drawBox, drawCircle, drawFilledRectangle, drawLine, drawRectangle } from "@/draw/shapes"

function characterAt(canvas: InMemoryCanvas, x: number, y: number): string {
  return canvas.cellAt(x, y)?.character ?? ""
}

describe("drawLine", () => {
  it("plots both endpoints", () => {
    const canvas = new InMemoryCanvas(10, 10)
    drawLine(canvas, 0, 0, 9, 0, "*")
    expect(characterAt(canvas, 0, 0)).toBe("*")
    expect(characterAt(canvas, 9, 0)).toBe("*")
    expect(characterAt(canvas, 5, 0)).toBe("*")
  })

  it("plots a diagonal", () => {
    const canvas = new InMemoryCanvas(10, 10)
    drawLine(canvas, 0, 0, 4, 4, "#")
    for (let i = 0; i < 5; i++) {
      expect(characterAt(canvas, i, i)).toBe("#")
    }
  })
})

describe("drawRectangle / drawFilledRectangle", () => {
  it("drawRectangle outlines and leaves the interior empty", () => {
    const canvas = new InMemoryCanvas(6, 6)
    drawRectangle(canvas, 0, 0, 4, 4, "o")
    expect(characterAt(canvas, 0, 0)).toBe("o")
    expect(characterAt(canvas, 3, 0)).toBe("o")
    expect(characterAt(canvas, 0, 3)).toBe("o")
    expect(characterAt(canvas, 3, 3)).toBe("o")
    expect(characterAt(canvas, 1, 1)).toBe(" ")
  })

  it("drawFilledRectangle covers every interior cell", () => {
    const canvas = new InMemoryCanvas(6, 6)
    drawFilledRectangle(canvas, 1, 1, 3, 3, "x")
    for (let y = 1; y <= 3; y++) {
      for (let x = 1; x <= 3; x++) {
        expect(characterAt(canvas, x, y)).toBe("x")
      }
    }
    expect(characterAt(canvas, 0, 0)).toBe(" ")
  })
})

describe("drawBox", () => {
  it("uses the right corner glyphs for the single style", () => {
    const canvas = new InMemoryCanvas(6, 6)
    drawBox(canvas, 0, 0, 4, 4, "single")
    expect(characterAt(canvas, 0, 0)).toBe(boxStyles.single.topLeft)
    expect(characterAt(canvas, 3, 0)).toBe(boxStyles.single.topRight)
    expect(characterAt(canvas, 0, 3)).toBe(boxStyles.single.bottomLeft)
    expect(characterAt(canvas, 3, 3)).toBe(boxStyles.single.bottomRight)
    expect(characterAt(canvas, 1, 0)).toBe(boxStyles.single.horizontal)
    expect(characterAt(canvas, 0, 1)).toBe(boxStyles.single.vertical)
  })

  it("uses double-line glyphs when the double style is selected", () => {
    const canvas = new InMemoryCanvas(6, 6)
    drawBox(canvas, 0, 0, 4, 4, "double")
    expect(characterAt(canvas, 0, 0)).toBe(boxStyles.double.topLeft)
  })
})

describe("drawCircle", () => {
  it("touches the four cardinal points at the given radius", () => {
    const canvas = new InMemoryCanvas(20, 20)
    drawCircle(canvas, 10, 10, 5, "*")
    expect(characterAt(canvas, 15, 10)).toBe("*")
    expect(characterAt(canvas, 5, 10)).toBe("*")
    expect(characterAt(canvas, 10, 15)).toBe("*")
    expect(characterAt(canvas, 10, 5)).toBe("*")
  })
})
