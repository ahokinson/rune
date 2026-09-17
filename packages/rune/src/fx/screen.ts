import type { Canvas } from "@/draw/canvas"
import { Color } from "@/draw/color"

/**
 * A screen-space post-processing effect. All hooks are optional, so an effect
 * implements only what it needs:
 *   - `rowOffset`  shifts a row horizontally (tearing, jitter, shake)
 *   - `brightness` scales every colour drawn this frame (flicker, fade)
 *   - `postPass`   paints artifacts straight onto the canvas after the frame is
 *                  composited (static, noise, glitch blocks)
 *   - `update`     advances the effect's own timeline once per tick
 *
 * @module
 */

/**
 * Screen-space post-processing hook set. Implement only the hooks an effect needs.
 */
export interface ScreenEffect {
  /** Advance the effect's own timeline once per tick. */
  update?(tick: number): void
  /** Shift row `y` horizontally (tearing, jitter, shake). Default 0. */
  rowOffset?(y: number): number
  /** Brightness multiplier for every colour drawn this frame (flicker, fade). Default 1. */
  brightness?(): number
  /** Paint artifacts straight onto the canvas after the frame is composited (static, noise, glitch blocks). */
  postPass?(canvas: Canvas, tick: number): void
}

/**
 * Wraps a canvas and runs a stack of {@link ScreenEffect}s over everything drawn
 * through it: each draw call is shifted by the summed `rowOffset(y)` and tinted
 * by the product of every `brightness()`. Effects compose in array order. Drawing
 * code targets a {@link FilterCanvas} exactly like a plain canvas; call
 * `postPass` once after the frame is drawn to let effects overlay artifacts onto
 * the underlying canvas.
 */
export class FilterCanvas implements Canvas {
  /** Wrapped canvas width in cells. */
  readonly width: number
  /** Wrapped canvas height in cells. */
  readonly height: number

  /**
   * @param inner - Underlying canvas to draw through.
   * @param effects - Effects applied to every draw call (in array order).
   */
  constructor(
    private readonly inner: Canvas,
    private readonly effects: ScreenEffect[],
  ) {
    this.width = inner.width
    this.height = inner.height
  }

  private offsetX(y: number): number {
    let dx = 0
    for (const effect of this.effects) {
      if (effect.rowOffset) dx += effect.rowOffset(y)
    }
    return dx
  }

  private brightness(): number {
    let m = 1
    for (const effect of this.effects) {
      if (effect.brightness) m *= effect.brightness()
    }
    return m
  }

  private scale(color: Color | undefined, m: number): Color | undefined {
    if (!color || m === 1) return color
    return new Color(color.red * m, color.green * m, color.blue * m, color.alpha)
  }

  /**
   * Clear the inner canvas, scaled by the composed brightness.
   *
   * @param background - Optional clear colour.
   */
  clear(background?: Color): void {
    this.inner.clear(this.scale(background, this.brightness()))
  }

  /**
   * Set a cell, shifted by the summed `rowOffset(y)` and tinted by the composed
   * brightness.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @param character - Glyph to write.
   * @param foreground - Optional foreground colour.
   * @param background - Optional background colour.
   */
  setCell(x: number, y: number, character: string, foreground?: Color, background?: Color): void {
    const m = this.brightness()
    this.inner.setCell(x + this.offsetX(y), y, character, this.scale(foreground, m), this.scale(background, m))
  }

  /**
   * Set a cell from raw bytes, shifted by `rowOffset(y)` and tinted by the
   * composed brightness.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @param character - Glyph to write.
   * @param fgR - Foreground red 0–255.
   * @param fgG - Foreground green 0–255.
   * @param fgB - Foreground blue 0–255.
   * @param bgR - Background red 0–255.
   * @param bgG - Background green 0–255.
   * @param bgB - Background blue 0–255.
   */
  setCellBytes(
    x: number,
    y: number,
    character: string,
    fgR: number,
    fgG: number,
    fgB: number,
    bgR: number,
    bgG: number,
    bgB: number,
  ): void {
    const m = this.brightness()
    this.inner.setCellBytes(x + this.offsetX(y), y, character, fgR * m, fgG * m, fgB * m, bgR * m, bgG * m, bgB * m)
  }

  /**
   * Same as {@link setCellBytes} but skips bounds/clipping on the inner canvas.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @param character - Glyph to write.
   * @param fgR - Foreground red 0–255.
   * @param fgG - Foreground green 0–255.
   * @param fgB - Foreground blue 0–255.
   * @param bgR - Background red 0–255.
   * @param bgG - Background green 0–255.
   * @param bgB - Background blue 0–255.
   */
  setCellBytesUnsafe(
    x: number,
    y: number,
    character: string,
    fgR: number,
    fgG: number,
    fgB: number,
    bgR: number,
    bgG: number,
    bgB: number,
  ): void {
    const m = this.brightness()
    this.inner.setCellBytesUnsafe(
      x + this.offsetX(y),
      y,
      character,
      fgR * m,
      fgG * m,
      fgB * m,
      bgR * m,
      bgG * m,
      bgB * m,
    )
  }

  /**
   * Draw a string, shifted by `rowOffset(y)` and tinted by the composed brightness.
   *
   * @param x - Start column.
   * @param y - Row.
   * @param text - Text to draw.
   * @param foreground - Optional foreground colour.
   * @param background - Optional background colour.
   */
  drawText(x: number, y: number, text: string, foreground?: Color, background?: Color): void {
    const m = this.brightness()
    this.inner.drawText(x + this.offsetX(y), y, text, this.scale(foreground, m), this.scale(background, m))
  }

  /**
   * Fill a rectangle, shifted by `rowOffset(y)` and tinted by the composed brightness.
   *
   * @param x - Left column.
   * @param y - Top row.
   * @param width - Rectangle width.
   * @param height - Rectangle height.
   * @param color - Fill colour.
   */
  fillRectangle(x: number, y: number, width: number, height: number, color: Color): void {
    const m = this.brightness()
    this.inner.fillRectangle(x + this.offsetX(y), y, width, height, this.scale(color, m)!)
  }

  /** Flush the inner canvas. */
  flush(): void {
    this.inner.flush()
  }

  /**
   * Run each effect's overlay pass against the underlying canvas (un-shifted), so
   * post artifacts land in screen space rather than being offset by `rowOffset`.
   *
   * @param tick - Current tick number.
   */
  postPass(tick: number): void {
    for (const effect of this.effects) {
      effect.postPass?.(this.inner, tick)
    }
  }
}
