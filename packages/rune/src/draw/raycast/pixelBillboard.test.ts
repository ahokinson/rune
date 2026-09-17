import { describe, expect, it } from "bun:test"
import { Camera } from "@/draw/camera"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { PixelSprite } from "@/draw/pixelSprite"
import { ColumnDepthBuffer } from "@/draw/raycast/columnDepthBuffer"
import { drawPixelBillboard } from "@/draw/raycast/pixelBillboard"
import { RaycastProjection } from "@/draw/raycast/projection"
import { Angle } from "@/math/angle"
import { Vector2 } from "@/math/vector2"

function makeProjection(): RaycastProjection {
  return new RaycastProjection({
    yaw: 0,
    fieldOfView: Angle.fromDegrees(90),
    viewportWidth: 81,
    viewportHeight: 41,
  })
}

function makeSolidSprite(width: number, height: number, color = Color.RED): PixelSprite {
  const sprite = new PixelSprite(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) sprite.setPixel(x, y, color)
  }
  return sprite
}

describe("PixelSprite", () => {
  it("ignores spaces and unknown legend keys", () => {
    const sprite = PixelSprite.fromString(
      `
A B
?A
`,
      { A: Color.RED, B: Color.BLUE },
    )
    expect(sprite.width).toBe(3)
    expect(sprite.height).toBe(2)
    expect(sprite.pixelAt(0, 0)?.red).toBe(1)
    expect(sprite.pixelAt(1, 0)).toBeNull()
    expect(sprite.pixelAt(2, 0)?.blue).toBe(1)
    expect(sprite.pixelAt(0, 1)).toBeNull()
    expect(sprite.pixelAt(1, 1)?.red).toBe(1)
  })
})

describe("drawPixelBillboard", () => {
  it("packs two opaque pixels into one cell via the upper-half block", () => {
    const camera = new Camera(new Vector2(0, 0), makeProjection())
    const depth = new ColumnDepthBuffer(81)
    const canvas = new InMemoryCanvas(81, 41)
    const sprite = makeSolidSprite(2, 4, Color.RED)

    drawPixelBillboard(canvas, depth, camera, new Vector2(5, 0), sprite)

    let painted = 0
    let nonRedFg = 0
    for (let column = 0; column < 81; column++) {
      for (let row = 0; row < 41; row++) {
        const cell = canvas.cellAt(column, row)
        if (cell?.character !== "▀") continue
        painted++
        if (cell.foreground.red !== 1) nonRedFg++
      }
    }
    expect(painted).toBeGreaterThan(0)
    expect(nonRedFg).toBe(0)
  })

  it("uses the lower-half block when only the bottom pixel of a cell is opaque", () => {
    const camera = new Camera(new Vector2(0, 0), makeProjection())
    const depth = new ColumnDepthBuffer(81)
    const canvas = new InMemoryCanvas(81, 41)
    // Sprite that's mostly transparent with one opaque pixel row near the
    // bottom. At this distance the projection puts 2 source pixels per
    // output cell row, so the lower half of a cell samples this opaque row
    // while the upper half samples the empty row above it.
    const sprite = new PixelSprite(10, 20)
    for (let x = 0; x < 10; x++) sprite.setPixel(x, 18, Color.GREEN)

    drawPixelBillboard(canvas, depth, camera, new Vector2(6.15, 0), sprite)

    let lowers = 0
    for (let column = 0; column < 81; column++) {
      for (let row = 0; row < 41; row++) {
        if (canvas.cellAt(column, row)?.character === "▄") lowers++
      }
    }
    expect(lowers).toBeGreaterThan(0)
  })

  it("uses the upper-half block (no bg) when only the top pixel of a cell is opaque", () => {
    const camera = new Camera(new Vector2(0, 0), makeProjection())
    const depth = new ColumnDepthBuffer(81)
    // Clear to transparent so we can distinguish "bg not set" (passes through
    // to the clear color) from "bg explicitly set by the renderer".
    const canvas = new InMemoryCanvas(81, 41, Color.TRANSPARENT)
    const sprite = new PixelSprite(10, 20)
    for (let x = 0; x < 10; x++) sprite.setPixel(x, 1, Color.GREEN)

    drawPixelBillboard(canvas, depth, camera, new Vector2(6.15, 0), sprite)

    let uppersFgOnly = 0
    for (let column = 0; column < 81; column++) {
      for (let row = 0; row < 41; row++) {
        const cell = canvas.cellAt(column, row)
        if (cell?.character !== "▀") continue
        if (cell.background.alpha === 0) uppersFgOnly++
      }
    }
    expect(uppersFgOnly).toBeGreaterThan(0)
  })

  it("box-averages downscaled colors so distant sprites don't randomly drop pixels", () => {
    const camera = new Camera(new Vector2(0, 0), makeProjection())
    const depth = new ColumnDepthBuffer(81)
    const canvas = new InMemoryCanvas(81, 41)
    const sprite = new PixelSprite(8, 8)
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        sprite.setPixel(x, y, (x + y) % 2 === 0 ? Color.RED : Color.BLUE)
      }
    }

    drawPixelBillboard(canvas, depth, camera, new Vector2(40, 0), sprite)

    let purpleHits = 0
    for (let column = 0; column < 81; column++) {
      for (let row = 0; row < 41; row++) {
        const cell = canvas.cellAt(column, row)
        if (!cell) continue
        if (cell.character !== "▀" && cell.character !== "▄") continue
        const fg = cell.foreground
        if (fg.red > 0.2 && fg.blue > 0.2 && fg.green < 0.1) purpleHits++
      }
    }
    expect(purpleHits).toBeGreaterThan(0)
  })

  it("skips sprite behind the camera", () => {
    const camera = new Camera(new Vector2(0, 0), makeProjection())
    const depth = new ColumnDepthBuffer(81)
    const canvas = new InMemoryCanvas(81, 41)
    const sprite = makeSolidSprite(4, 4)

    drawPixelBillboard(canvas, depth, camera, new Vector2(-5, 0), sprite)

    for (let column = 0; column < 81; column++) {
      for (let row = 0; row < 41; row++) {
        const cell = canvas.cellAt(column, row)
        if (!cell) continue
        expect(cell.character).not.toBe("▀")
        expect(cell.character).not.toBe("▄")
      }
    }
  })

  it("respects depth-buffer occlusion per column", () => {
    const camera = new Camera(new Vector2(0, 0), makeProjection())
    const depth = new ColumnDepthBuffer(81)
    depth.clear(1)
    const canvas = new InMemoryCanvas(81, 41)
    const sprite = makeSolidSprite(4, 4)

    drawPixelBillboard(canvas, depth, camera, new Vector2(5, 0), sprite)

    for (let column = 0; column < 81; column++) {
      for (let row = 0; row < 41; row++) {
        const cell = canvas.cellAt(column, row)
        if (!cell) continue
        expect(cell.character).not.toBe("▀")
        expect(cell.character).not.toBe("▄")
      }
    }
  })
})
