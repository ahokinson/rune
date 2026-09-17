import type { CanvasSurface } from "@ahokinson/rune"

const HIT_R = 255,
  HIT_G = 240,
  HIT_B = 120
const CROSS_R = 200,
  CROSS_G = 200,
  CROSS_B = 200

export interface CrosshairState {
  hitFlashRemainingMs: number
}

export function renderCrosshair(
  canvas: CanvasSurface,
  columnCount: number,
  rowCount: number,
  state?: CrosshairState,
): void {
  const centerColumn = Math.floor(columnCount / 2)
  const centerRow = Math.floor(rowCount / 2)
  const isHit = state !== undefined && state.hitFlashRemainingMs > 0

  if (isHit) {
    canvas.setCellBytes(centerColumn - 1, centerRow - 1, "\\", HIT_R, HIT_G, HIT_B, 0, 0, 0)
    canvas.setCellBytes(centerColumn + 1, centerRow - 1, "/", HIT_R, HIT_G, HIT_B, 0, 0, 0)
    canvas.setCellBytes(centerColumn - 1, centerRow + 1, "/", HIT_R, HIT_G, HIT_B, 0, 0, 0)
    canvas.setCellBytes(centerColumn + 1, centerRow + 1, "\\", HIT_R, HIT_G, HIT_B, 0, 0, 0)
    canvas.setCellBytes(centerColumn, centerRow, "X", HIT_R, HIT_G, HIT_B, 0, 0, 0)
  } else {
    canvas.setCellBytes(centerColumn - 1, centerRow, "-", CROSS_R, CROSS_G, CROSS_B, 0, 0, 0)
    canvas.setCellBytes(centerColumn + 1, centerRow, "-", CROSS_R, CROSS_G, CROSS_B, 0, 0, 0)
    canvas.setCellBytes(centerColumn, centerRow - 1, "|", CROSS_R, CROSS_G, CROSS_B, 0, 0, 0)
    canvas.setCellBytes(centerColumn, centerRow + 1, "|", CROSS_R, CROSS_G, CROSS_B, 0, 0, 0)
    canvas.setCellBytes(centerColumn, centerRow, "+", CROSS_R, CROSS_G, CROSS_B, 0, 0, 0)
  }
}
