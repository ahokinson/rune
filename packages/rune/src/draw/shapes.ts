/**
 * Shape primitives that rasterise lines, rectangles, boxes, and circles onto a
 * {@link Canvas} via Bresenham-style integer stepping.
 *
 * @module
 */

import { type BoxStyleName, boxStyles } from "./box"
import type { Canvas } from "./canvas"
import type { Color } from "./color"

/**
 * Draw a single-glyph line between two points using Bresenham's algorithm.
 *
 * @param canvas - Target canvas.
 * @param startX - Start X (rounded to the nearest cell).
 * @param startY - Start Y (rounded to the nearest cell).
 * @param endX - End X (rounded to the nearest cell).
 * @param endY - End Y (rounded to the nearest cell).
 * @param character - Glyph to plot.
 * @param foreground - Glyph colour (optional).
 * @param background - Cell background (optional).
 */
export function drawLine(
  canvas: Canvas,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  character: string,
  foreground?: Color,
  background?: Color,
): void {
  let x0 = Math.round(startX)
  let y0 = Math.round(startY)
  const x1 = Math.round(endX)
  const y1 = Math.round(endY)
  const deltaX = Math.abs(x1 - x0)
  const deltaY = -Math.abs(y1 - y0)
  const stepX = x0 < x1 ? 1 : -1
  const stepY = y0 < y1 ? 1 : -1
  let error = deltaX + deltaY
  while (true) {
    canvas.setCell(x0, y0, character, foreground, background)
    if (x0 === x1 && y0 === y1) break
    const doubleError = 2 * error
    if (doubleError >= deltaY) {
      if (x0 === x1) break
      error += deltaY
      x0 += stepX
    }
    if (doubleError <= deltaX) {
      if (y0 === y1) break
      error += deltaX
      y0 += stepY
    }
  }
}

/**
 * Draw a single-glyph rectangle outline.
 *
 * @param canvas - Target canvas.
 * @param x - Left column.
 * @param y - Top row.
 * @param width - Rectangle width in cells.
 * @param height - Rectangle height in cells.
 * @param character - Glyph to plot.
 * @param foreground - Glyph colour (optional).
 * @param background - Cell background (optional).
 */
export function drawRectangle(
  canvas: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  character: string,
  foreground?: Color,
  background?: Color,
): void {
  if (width <= 0 || height <= 0) return
  for (let column = 0; column < width; column++) {
    canvas.setCell(x + column, y, character, foreground, background)
    canvas.setCell(x + column, y + height - 1, character, foreground, background)
  }
  for (let row = 1; row < height - 1; row++) {
    canvas.setCell(x, y + row, character, foreground, background)
    canvas.setCell(x + width - 1, y + row, character, foreground, background)
  }
}

/**
 * Draw a single-glyph filled rectangle.
 *
 * @param canvas - Target canvas.
 * @param x - Left column.
 * @param y - Top row.
 * @param width - Rectangle width in cells.
 * @param height - Rectangle height in cells.
 * @param character - Glyph to plot.
 * @param foreground - Glyph colour (optional).
 * @param background - Cell background (optional).
 */
export function drawFilledRectangle(
  canvas: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  character: string,
  foreground?: Color,
  background?: Color,
): void {
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      canvas.setCell(x + column, y + row, character, foreground, background)
    }
  }
}

/**
 * Draw a bordered box using a named {@link BoxStyleName} glyph set. Does
 * nothing if `width` or `height` is less than 2.
 *
 * @param canvas - Target canvas.
 * @param x - Left column.
 * @param y - Top row.
 * @param width - Box width in cells.
 * @param height - Box height in cells.
 * @param style - Glyph set name (default `single`).
 * @param foreground - Glyph colour (optional).
 * @param background - Cell background (optional).
 */
export function drawBox(
  canvas: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  style: BoxStyleName = "single",
  foreground?: Color,
  background?: Color,
): void {
  if (width < 2 || height < 2) return
  const glyphs = boxStyles[style]
  canvas.setCell(x, y, glyphs.topLeft, foreground, background)
  canvas.setCell(x + width - 1, y, glyphs.topRight, foreground, background)
  canvas.setCell(x, y + height - 1, glyphs.bottomLeft, foreground, background)
  canvas.setCell(x + width - 1, y + height - 1, glyphs.bottomRight, foreground, background)
  for (let column = 1; column < width - 1; column++) {
    canvas.setCell(x + column, y, glyphs.horizontal, foreground, background)
    canvas.setCell(x + column, y + height - 1, glyphs.horizontal, foreground, background)
  }
  for (let row = 1; row < height - 1; row++) {
    canvas.setCell(x, y + row, glyphs.vertical, foreground, background)
    canvas.setCell(x + width - 1, y + row, glyphs.vertical, foreground, background)
  }
}

/**
 * Draw a single-glyph circle outline using the midpoint algorithm.
 *
 * @param canvas - Target canvas.
 * @param centerX - Circle centre X.
 * @param centerY - Circle centre Y.
 * @param radius - Radius in cells.
 * @param character - Glyph to plot.
 * @param foreground - Glyph colour (optional).
 * @param background - Cell background (optional).
 */
export function drawCircle(
  canvas: Canvas,
  centerX: number,
  centerY: number,
  radius: number,
  character: string,
  foreground?: Color,
  background?: Color,
): void {
  const cx = Math.round(centerX)
  const cy = Math.round(centerY)
  let x = Math.round(radius)
  let y = 0
  let error = 1 - x
  while (x >= y) {
    canvas.setCell(cx + x, cy + y, character, foreground, background)
    canvas.setCell(cx + y, cy + x, character, foreground, background)
    canvas.setCell(cx - y, cy + x, character, foreground, background)
    canvas.setCell(cx - x, cy + y, character, foreground, background)
    canvas.setCell(cx - x, cy - y, character, foreground, background)
    canvas.setCell(cx - y, cy - x, character, foreground, background)
    canvas.setCell(cx + y, cy - x, character, foreground, background)
    canvas.setCell(cx + x, cy - y, character, foreground, background)
    y += 1
    if (error < 0) {
      error += 2 * y + 1
    } else {
      x -= 1
      error += 2 * (y - x + 1)
    }
  }
}
