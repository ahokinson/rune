/**
 * Draws a single pixel-art billboarded sprite (with sub-pixel averaging) into a
 * raycast view, depth-tested against a {@link ColumnDepthBuffer}.
 *
 * @module
 */

import type { Camera } from "../camera"
import type { Canvas } from "../canvas"
import { Color } from "../color"
import type { PixelSprite } from "../pixelSprite"
import type { ColumnDepthBuffer } from "./columnDepthBuffer"
import { RaycastProjection } from "./projection"

const WORLD_UNITS_PER_SPRITE_ROW = 0.15

const UPPER_HALF_BLOCK = "▀"
const LOWER_HALF_BLOCK = "▄"

/** Options for {@link drawPixelBillboard}. */
export interface DrawPixelBillboardOptions {
  /** Vertical offset in terminal rows (positive moves the sprite up). Default 0. */
  verticalOffsetRows?: number
  /** Uniform scale multiplier. Default 1. */
  scale?: number
}

function averagePixels(sprite: PixelSprite, x0: number, x1: number, y0: number, y1: number): Color | null {
  const xStart = Math.max(0, Math.floor(x0))
  const xEnd = Math.min(sprite.width - 1, Math.floor(x1 - 1e-6))
  const yStart = Math.max(0, Math.floor(y0))
  const yEnd = Math.min(sprite.height - 1, Math.floor(y1 - 1e-6))
  if (xStart > xEnd || yStart > yEnd) return null
  let r = 0
  let g = 0
  let b = 0
  let a = 0
  let count = 0
  for (let py = yStart; py <= yEnd; py++) {
    for (let px = xStart; px <= xEnd; px++) {
      const pixel = sprite.pixelAt(px, py)
      if (!pixel) continue
      r += pixel.red
      g += pixel.green
      b += pixel.blue
      a += pixel.alpha
      count++
    }
  }
  if (count === 0) return null
  return new Color(r / count, g / count, b / count, a / count)
}

/**
 * Draw a billboarded {@link PixelSprite} at `worldPosition` into `canvas`,
 * occluded by `depthBuffer`. Each terminal cell covers two sprite half-rows; the
 * covered pixels are averaged into upper/lower colours and emitted via the ▀/▄
 * half blocks. Each covered cell is depth-tested against the column and per-cell
 * buffers.
 *
 * @param canvas - Target canvas.
 * @param depthBuffer - Raycast depth buffer for occlusion.
 * @param camera - View camera (must use a {@link RaycastProjection}).
 * @param worldPosition - Sprite anchor in world cells.
 * @param sprite - Pixel sprite to draw.
 * @param options - Offset and scale; see {@link DrawPixelBillboardOptions}.
 */
export function drawPixelBillboard(
  canvas: Canvas,
  depthBuffer: ColumnDepthBuffer,
  camera: Camera,
  worldPosition: { x: number; y: number },
  sprite: PixelSprite,
  options: DrawPixelBillboardOptions = {},
): void {
  const projection = camera.projection
  if (!(projection instanceof RaycastProjection)) return
  if (sprite.width === 0 || sprite.height === 0) return

  const verticalOffsetRows = options.verticalOffsetRows ?? 0
  const scaleMultiplier = options.scale ?? 1

  const forwardX = projection.forwardX
  const forwardY = projection.forwardY
  const rightX = projection.rightX
  const rightY = projection.rightY
  const planeMagnitude = projection.planeMagnitude

  const deltaX = worldPosition.x - camera.position.x
  const deltaY = worldPosition.y - camera.position.y
  const forwardDistance = deltaX * forwardX + deltaY * forwardY
  if (forwardDistance <= 0.01) return
  const rightDistance = deltaX * rightX + deltaY * rightY

  const viewportWidth = projection.viewportWidth
  const viewportHeight = projection.viewportHeight

  const cameraSpaceX = rightDistance / forwardDistance / planeMagnitude
  const centerColumn = (cameraSpaceX + 1) * 0.5 * (viewportWidth - 1)

  const cellsTall = sprite.height / 2
  const scale = cellsTall * WORLD_UNITS_PER_SPRITE_ROW * scaleMultiplier

  const screenHeight = Math.abs((viewportHeight * scale) / forwardDistance)
  const screenWidth =
    cellsTall > 0 ? Math.abs(((viewportHeight * scale) / forwardDistance) * (sprite.width / cellsTall)) : 0

  const horizon = viewportHeight / 2 + verticalOffsetRows
  const topEdge = horizon - screenHeight / 2
  const bottomEdge = horizon + screenHeight / 2
  const leftEdge = centerColumn - screenWidth / 2
  const rightEdge = centerColumn + screenWidth / 2

  const widthRatio = screenWidth > 0 ? sprite.width / screenWidth : 0
  const heightRatio = screenHeight > 0 ? sprite.height / screenHeight : 0

  const firstColumn = Math.floor(leftEdge)
  const lastColumn = Math.ceil(rightEdge)
  const firstRow = Math.floor(topEdge)
  const lastRow = Math.ceil(bottomEdge)

  for (let canvasColumn = firstColumn; canvasColumn <= lastColumn; canvasColumn++) {
    if (canvasColumn < 0 || canvasColumn >= viewportWidth) continue
    const occluder = depthBuffer.get(canvasColumn)
    if (forwardDistance >= occluder) continue
    const pixelXStart = (canvasColumn - leftEdge) * widthRatio
    const pixelXEnd = (canvasColumn + 1 - leftEdge) * widthRatio

    for (let canvasRow = firstRow; canvasRow <= lastRow; canvasRow++) {
      if (canvasRow < 0 || canvasRow >= viewportHeight) continue
      if (forwardDistance >= depthBuffer.getCell(canvasColumn, canvasRow)) continue
      const pixelYStart = (canvasRow - topEdge) * heightRatio
      const pixelYMid = (canvasRow + 0.5 - topEdge) * heightRatio
      const pixelYEnd = (canvasRow + 1 - topEdge) * heightRatio

      const top = averagePixels(sprite, pixelXStart, pixelXEnd, pixelYStart, pixelYMid)
      const bottom = averagePixels(sprite, pixelXStart, pixelXEnd, pixelYMid, pixelYEnd)

      if (!top && !bottom) continue
      if (top && bottom) {
        canvas.setCell(canvasColumn, canvasRow, UPPER_HALF_BLOCK, top, bottom)
      } else if (top) {
        canvas.setCell(canvasColumn, canvasRow, UPPER_HALF_BLOCK, top)
      } else if (bottom) {
        canvas.setCell(canvasColumn, canvasRow, LOWER_HALF_BLOCK, bottom)
      }
    }
  }
}
