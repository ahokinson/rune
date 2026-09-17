/**
 * Renders a collection of billboarded sprites back-to-front into a raycast view.
 *
 * @module
 */

import type { Vector2 } from "@/math/vector2"
import type { Camera } from "../camera"
import type { Canvas } from "../canvas"
import { PixelSprite } from "../pixelSprite"
import type { Sprite } from "../sprite"
import { drawBillboard } from "./billboard"
import type { ColumnDepthBuffer } from "./columnDepthBuffer"
import { drawPixelBillboard } from "./pixelBillboard"
import { RaycastProjection } from "./projection"

const SPRITE_SCALE = 1.6

/** One billboarded actor handed to {@link renderBillboards}. */
export interface BillboardEntry {
  /** World position of the sprite anchor. */
  position: Vector2
  /** Returns the sprite to display at `timeMilliseconds` (for animation). */
  spriteAt(timeMilliseconds: number): Sprite | PixelSprite
  /** Optional world Z (height) of the sprite anchor, for vertical offset from eye height. */
  worldZ?(): number
  /** Extra vertical offset in terminal rows on top of the eye-height offset. */
  verticalOffsetRows?: number
  /** Uniform scale multiplier. Default 1. */
  spriteScale?: number
  /** When true the entry is skipped and not drawn. */
  markedForRemoval?: boolean
}

/** Options for {@link renderBillboards}. */
export interface BillboardRenderContext {
  /** Canvas to draw onto. */
  canvas: Canvas
  /** View camera. */
  camera: Camera
  /** Raycast depth buffer for occlusion. */
  depthBuffer: ColumnDepthBuffer
  /** Billboards to render this frame. */
  entries: readonly BillboardEntry[]
  /** Current animation time, passed to each entry's `spriteAt`. */
  timeMilliseconds: number
  /** Camera eye height in world Z, for vertical offset. */
  eyeZ: number
  /** Viewport row count, used to scale world-Z offsets to rows. */
  rowCount: number
}

interface SortEntry {
  entry: BillboardEntry
  distance: number
}

const sortBuffer: SortEntry[] = []

/**
 * Render billboarded sprites back-to-front with per-entry vertical offset from
 * eye height. Filters removed entries, sorts by squared distance to the camera,
 * then dispatches each to {@link drawPixelBillboard} or {@link drawBillboard}
 * depending on the sprite type.
 *
 * @param context - Render parameters; see {@link BillboardRenderContext}.
 */
export function renderBillboards(context: BillboardRenderContext): void {
  const { camera, eyeZ, rowCount } = context
  const cameraX = camera.position.x
  const cameraY = camera.position.y
  const projection = camera.projection
  const forwardX = projection instanceof RaycastProjection ? projection.forwardX : 1
  const forwardY = projection instanceof RaycastProjection ? projection.forwardY : 0

  sortBuffer.length = 0
  for (const entry of context.entries) {
    if (entry.markedForRemoval) continue
    const dx = entry.position.x - cameraX
    const dy = entry.position.y - cameraY
    sortBuffer.push({ entry, distance: dx * dx + dy * dy })
  }

  sortBuffer.sort((a, b) => b.distance - a.distance)

  for (const item of sortBuffer) {
    const sprite = item.entry.spriteAt(context.timeMilliseconds)
    const dx = item.entry.position.x - cameraX
    const dy = item.entry.position.y - cameraY
    const forwardDistance = dx * forwardX + dy * forwardY
    let baseOffset = 0
    if (forwardDistance > 0.0001 && item.entry.worldZ) {
      const centerZ = item.entry.worldZ()
      baseOffset = ((eyeZ - centerZ) * rowCount) / forwardDistance
    }
    const options = {
      verticalOffsetRows: baseOffset + (item.entry.verticalOffsetRows ?? 0),
      scale: (item.entry.spriteScale ?? 1) * SPRITE_SCALE,
    }
    if (sprite instanceof PixelSprite) {
      drawPixelBillboard(context.canvas, context.depthBuffer, context.camera, item.entry.position, sprite, options)
    } else {
      drawBillboard(context.canvas, context.depthBuffer, context.camera, item.entry.position, sprite, options)
    }
  }
}
