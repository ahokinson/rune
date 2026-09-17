import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { drawPixelSprite, PixelSprite } from "@/draw/pixelSprite"

describe("PixelSprite", () => {
  it("fromString parses width/height and transparency", () => {
    const sprite = PixelSprite.fromString("##\n# ", { "#": Color.WHITE })
    expect(sprite.width).toBe(2)
    expect(sprite.height).toBe(2)
    expect(sprite.pixelAt(0, 0)).not.toBeNull()
    expect(sprite.pixelAt(1, 1)).toBeNull()
  })
})

describe("drawPixelSprite", () => {
  const RED = Color.fromBytes(255, 0, 0)
  const BLUE = Color.fromBytes(0, 0, 255)

  it("packs a stacked pixel pair into one ▀ cell (upper=fg, lower=bg)", () => {
    const sprite = new PixelSprite(1, 2)
    sprite.setPixel(0, 0, RED)
    sprite.setPixel(0, 1, BLUE)
    const canvas = new InMemoryCanvas(4, 4)
    drawPixelSprite(canvas, sprite, 1, 1)
    const cell = canvas.cellAt(1, 1)
    expect(cell?.character).toBe("▀")
    expect(cell?.foreground.red).toBeCloseTo(1)
    expect(cell?.background?.blue).toBeCloseTo(1)
  })

  it("uses ▀ for an upper-only pixel and ▄ for a lower-only pixel", () => {
    const sprite = new PixelSprite(2, 2)
    sprite.setPixel(0, 0, RED) // upper-only in column 0
    sprite.setPixel(1, 1, BLUE) // lower-only in column 1
    const canvas = new InMemoryCanvas(4, 4)
    drawPixelSprite(canvas, sprite, 0, 0)
    expect(canvas.cellAt(0, 0)?.character).toBe("▀")
    expect(canvas.cellAt(0, 0)?.foreground.red).toBeCloseTo(1)
    expect(canvas.cellAt(1, 0)?.character).toBe("▄")
    expect(canvas.cellAt(1, 0)?.foreground.blue).toBeCloseTo(1)
  })

  it("leaves a fully transparent pixel pair untouched and stacks rows", () => {
    const sprite = new PixelSprite(1, 4)
    sprite.setPixel(0, 2, RED) // second row of cells, upper pixel
    const canvas = new InMemoryCanvas(4, 4)
    drawPixelSprite(canvas, sprite, 0, 0)
    expect(canvas.cellAt(0, 0)?.character).toBe(" ") // empty first pair untouched
    expect(canvas.cellAt(0, 1)?.character).toBe("▀")
  })
})
