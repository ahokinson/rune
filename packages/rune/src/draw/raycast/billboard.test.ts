import { describe, expect, it } from "bun:test"
import { Camera } from "@/draw/camera"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { drawBillboard } from "@/draw/raycast/billboard"
import { ColumnDepthBuffer } from "@/draw/raycast/columnDepthBuffer"
import { RaycastProjection } from "@/draw/raycast/projection"
import { Sprite } from "@/draw/sprite"
import { Angle } from "@/math/angle"
import { Vector2 } from "@/math/vector2"

function makeSprite(): Sprite {
  const sprite = new Sprite(3, 3)
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) sprite.setCell(x, y, "X", Color.WHITE)
  }
  return sprite
}

describe("drawBillboard", () => {
  it("draws a visible sprite when not occluded", () => {
    const projection = new RaycastProjection({
      yaw: 0,
      fieldOfView: Angle.fromDegrees(90),
      viewportWidth: 41,
      viewportHeight: 21,
    })
    const camera = new Camera(new Vector2(0, 0), projection)
    const depth = new ColumnDepthBuffer(41)
    const canvas = new InMemoryCanvas(41, 21)
    const sprite = makeSprite()

    drawBillboard(canvas, depth, camera, new Vector2(5, 0), sprite, { scale: 1 })

    let painted = 0
    for (let column = 0; column < 41; column++) {
      for (let row = 0; row < 21; row++) {
        if (canvas.cellAt(column, row)?.character === "X") painted++
      }
    }
    expect(painted).toBeGreaterThan(0)
  })

  it("skips sprite when walls occlude every column", () => {
    const projection = new RaycastProjection({
      yaw: 0,
      fieldOfView: Angle.fromDegrees(90),
      viewportWidth: 41,
      viewportHeight: 21,
    })
    const camera = new Camera(new Vector2(0, 0), projection)
    const depth = new ColumnDepthBuffer(41)
    depth.clear(1)
    const canvas = new InMemoryCanvas(41, 21)
    const sprite = makeSprite()

    drawBillboard(canvas, depth, camera, new Vector2(5, 0), sprite, { scale: 1 })

    for (let column = 0; column < 41; column++) {
      for (let row = 0; row < 21; row++) {
        expect(canvas.cellAt(column, row)?.character).not.toBe("X")
      }
    }
  })

  it("skips sprite behind the camera", () => {
    const projection = new RaycastProjection({
      yaw: 0,
      fieldOfView: Angle.fromDegrees(90),
      viewportWidth: 41,
      viewportHeight: 21,
    })
    const camera = new Camera(new Vector2(0, 0), projection)
    const depth = new ColumnDepthBuffer(41)
    const canvas = new InMemoryCanvas(41, 21)
    const sprite = makeSprite()

    drawBillboard(canvas, depth, camera, new Vector2(-5, 0), sprite, { scale: 1 })

    for (let column = 0; column < 41; column++) {
      for (let row = 0; row < 21; row++) {
        expect(canvas.cellAt(column, row)?.character).not.toBe("X")
      }
    }
  })
})
