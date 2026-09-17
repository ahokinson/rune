/**
 * Draws a single billboarded sprite into a raycast view, depth-tested against a
 * {@link ColumnDepthBuffer}.
 *
 * @module
 */

import type { Vector2 } from "@/math/vector2"
import type { Camera } from "../camera"
import type { Canvas } from "../canvas"
import type { Sprite } from "../sprite"
import type { ColumnDepthBuffer } from "./columnDepthBuffer"
import { RaycastProjection } from "./projection"

const WORLD_UNITS_PER_SPRITE_ROW = 0.15

/** Options for {@link drawBillboard}. */
export interface DrawBillboardOptions {
  /** Vertical offset in terminal rows (positive moves the sprite up). Default 0. */
  verticalOffsetRows?: number
  /** Uniform scale multiplier. Default 1. */
  scale?: number
}

/**
 * Draw a billboarded {@link Sprite} at `worldPosition` into `canvas`, occluded by
 * `depthBuffer`. The sprite faces the camera and is scaled by perspective; each
 * covered cell is depth-tested against the column and per-cell buffers.
 *
 * @param canvas - Target canvas.
 * @param depthBuffer - Raycast depth buffer for occlusion.
 * @param camera - View camera (must use a {@link RaycastProjection}).
 * @param worldPosition - Sprite anchor in world cells.
 * @param sprite - Sprite to draw.
 * @param options - Offset and scale; see {@link DrawBillboardOptions}.
 */
export function drawBillboard(
  canvas: Canvas,
  depthBuffer: ColumnDepthBuffer,
  camera: Camera,
  worldPosition: Vector2,
  sprite: Sprite,
  options: DrawBillboardOptions = {},
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

  const scale = sprite.height * WORLD_UNITS_PER_SPRITE_ROW * scaleMultiplier

  const screenHeight = Math.abs((viewportHeight * scale) / forwardDistance)
  const screenWidth = Math.abs(((viewportHeight * scale) / forwardDistance) * (sprite.width / sprite.height))

  const horizon = viewportHeight / 2 + verticalOffsetRows
  const topEdge = horizon - screenHeight / 2
  const bottomEdge = horizon + screenHeight / 2
  const leftEdge = centerColumn - screenWidth / 2
  const rightEdge = centerColumn + screenWidth / 2

  const widthInverse = screenWidth > 0 ? sprite.width / screenWidth : 0
  const heightInverse = screenHeight > 0 ? sprite.height / screenHeight : 0

  const firstColumn = Math.floor(leftEdge)
  const lastColumn = Math.ceil(rightEdge)
  const firstRow = Math.floor(topEdge)
  const lastRow = Math.ceil(bottomEdge)

  for (let canvasColumn = firstColumn; canvasColumn <= lastColumn; canvasColumn++) {
    if (canvasColumn < 0 || canvasColumn >= viewportWidth) continue
    const occluder = depthBuffer.get(canvasColumn)
    if (forwardDistance >= occluder) continue
    const spriteColumn = Math.floor((canvasColumn + 0.5 - leftEdge) * widthInverse)
    if (spriteColumn < 0 || spriteColumn >= sprite.width) continue

    for (let canvasRow = firstRow; canvasRow <= lastRow; canvasRow++) {
      if (canvasRow < 0 || canvasRow >= viewportHeight) continue
      if (forwardDistance >= depthBuffer.getCell(canvasColumn, canvasRow)) continue
      const spriteRow = Math.floor((canvasRow + 0.5 - topEdge) * heightInverse)
      if (spriteRow < 0 || spriteRow >= sprite.height) continue
      const cell = sprite.cellAt(spriteColumn, spriteRow)
      if (!cell || cell.transparent) continue
      if (cell.background) {
        canvas.setCell(canvasColumn, canvasRow, cell.character, cell.foreground, cell.background)
      } else {
        canvas.setCell(canvasColumn, canvasRow, cell.character, cell.foreground)
      }
    }
  }
}
