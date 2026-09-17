import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { drawSprite, Sprite } from "@/draw/sprite"

describe("Sprite", () => {
  it("fromString parses width/height from the input lines", () => {
    const sprite = Sprite.fromString("###\n# #\n###")
    expect(sprite.width).toBe(3)
    expect(sprite.height).toBe(3)
  })

  it("treats spaces and dots as transparent in fromString", () => {
    const sprite = Sprite.fromString("@.@\n. .")
    expect(sprite.cellAt(0, 0)?.transparent).toBe(false)
    expect(sprite.cellAt(1, 0)?.transparent).toBe(true)
    expect(sprite.cellAt(2, 0)?.transparent).toBe(false)
    expect(sprite.cellAt(0, 1)?.transparent).toBe(true)
    expect(sprite.cellAt(1, 1)?.transparent).toBe(true)
  })

  it("trims leading and trailing blank lines", () => {
    const sprite = Sprite.fromString("\n##\n##\n\n")
    expect(sprite.width).toBe(2)
    expect(sprite.height).toBe(2)
  })

  it("drawSprite places only non-transparent cells on the canvas", () => {
    const sprite = Sprite.fromString("@.@\n.@.")
    const canvas = new InMemoryCanvas(5, 5)
    drawSprite(canvas, sprite, 1, 1)
    expect(canvas.cellAt(1, 1)?.character).toBe("@")
    expect(canvas.cellAt(2, 1)?.character).toBe(" ")
    expect(canvas.cellAt(3, 1)?.character).toBe("@")
    expect(canvas.cellAt(2, 2)?.character).toBe("@")
  })
})
