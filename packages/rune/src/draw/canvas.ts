/**
 * Cell-grid render target abstraction: a 2D buffer of coloured glyphs that
 * renderers draw into and the host terminal reads back. {@link InMemoryCanvas}
 * is the in-engine implementation.
 *
 * @module
 */

import { Color } from "./color"

const SPACE_CODE = 32

/** Cell-grid render target: a 2D buffer of coloured glyphs. */
export interface Canvas {
  /** Grid width in cells. */
  readonly width: number
  /** Grid height in cells. */
  readonly height: number
  /**
   * Clear every cell to `background` (or the previous clear colour).
   *
   * @param background - Colour to fill with.
   */
  clear(background?: Color): void
  /**
   * Set a single cell's glyph and colours. Out-of-bounds writes are ignored.
   *
   * @param x - Column.
   * @param y - Row.
   * @param character - Glyph to write.
   * @param foreground - Glyph colour (default white).
   * @param background - Cell background (default the clear colour).
   */
  setCell(x: number, y: number, character: string, foreground?: Color, background?: Color): void
  /**
   * Set a cell from raw 0–255 byte channels (alpha forced to 255). Out-of-bounds
   * writes are ignored.
   *
   * @param x - Column.
   * @param y - Row.
   * @param character - Glyph to write.
   * @param fgR - Foreground red (0–255).
   * @param fgG - Foreground green (0–255).
   * @param fgB - Foreground blue (0–255).
   * @param bgR - Background red (0–255).
   * @param bgG - Background green (0–255).
   * @param bgB - Background blue (0–255).
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
  ): void
  /**
   * Set a cell from raw 0–255 byte channels without bounds checking. Faster
   * than {@link setCellBytes} but the caller must guarantee valid coordinates.
   *
   * @param x - Column.
   * @param y - Row.
   * @param character - Glyph to write.
   * @param fgR - Foreground red (0–255).
   * @param fgG - Foreground green (0–255).
   * @param fgB - Foreground blue (0–255).
   * @param bgR - Background red (0–255).
   * @param bgG - Background green (0–255).
   * @param bgB - Background blue (0–255).
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
  ): void
  /**
   * Write a string left-to-right starting at `(x, y)`.
   *
   * @param x - Leftmost column.
   * @param y - Row.
   * @param text - String to write.
   * @param foreground - Glyph colour (default white).
   * @param background - Cell background (default the clear colour).
   */
  drawText(x: number, y: number, text: string, foreground?: Color, background?: Color): void
  /**
   * Fill an axis-aligned rectangle with `color` (space glyph, that background).
   *
   * @param x - Left column.
   * @param y - Top row.
   * @param width - Rectangle width in cells.
   * @param height - Rectangle height in cells.
   * @param color - Fill colour.
   */
  fillRectangle(x: number, y: number, width: number, height: number, color: Color): void
  /** Publish the current frame to the host terminal. */
  flush(): void
}

interface CellRecord {
  character: string
  foreground: Color
  background: Color
}

/**
 * Mutable byte-range (0–255) view of a cell, for allocation-free read-back during
 * post-processing. `char` is the glyph code point.
 */
export interface CellBytes {
  /** Glyph code point. */
  char: number
  /** Foreground red channel (0–255). */
  fgR: number
  /** Foreground green channel (0–255). */
  fgG: number
  /** Foreground blue channel (0–255). */
  fgB: number
  /** Background red channel (0–255). */
  bgR: number
  /** Background green channel (0–255). */
  bgG: number
  /** Background blue channel (0–255). */
  bgB: number
}

/**
 * In-engine {@link Canvas} backed by flat typed arrays for the glyph and colour
 * channels, with a second buffer for diffing against the previous frame.
 *
 * @example
 * ```ts
 * const canvas = new InMemoryCanvas(80, 24)
 * canvas.setCell(10, 5, "@", Color.RED)
 * canvas.flush()
 * ```
 */
export class InMemoryCanvas implements Canvas {
  readonly width: number
  readonly height: number
  private readonly size: number

  private chars: Uint16Array
  private fR: Uint8Array
  private fG: Uint8Array
  private fB: Uint8Array
  private fA: Uint8Array
  private bR: Uint8Array
  private bG: Uint8Array
  private bB: Uint8Array
  private bA: Uint8Array

  private prevChars: Uint16Array
  private prevFR: Uint8Array
  private prevFG: Uint8Array
  private prevFB: Uint8Array
  private prevFA: Uint8Array
  private prevBR: Uint8Array
  private prevBG: Uint8Array
  private prevBB: Uint8Array
  private prevBA: Uint8Array

  private clearR: number
  private clearG: number
  private clearB: number
  private clearA: number
  private clearColor: Color

  /**
   * @param width - Grid width in cells (clamped to at least 1).
   * @param height - Grid height in cells (clamped to at least 1).
   * @param clearColor - Initial and default background (default black).
   */
  constructor(width: number, height: number, clearColor: Color = Color.BLACK) {
    this.width = Math.max(1, Math.floor(width))
    this.height = Math.max(1, Math.floor(height))
    this.size = this.width * this.height

    this.chars = new Uint16Array(this.size)
    this.fR = new Uint8Array(this.size)
    this.fG = new Uint8Array(this.size)
    this.fB = new Uint8Array(this.size)
    this.fA = new Uint8Array(this.size)
    this.bR = new Uint8Array(this.size)
    this.bG = new Uint8Array(this.size)
    this.bB = new Uint8Array(this.size)
    this.bA = new Uint8Array(this.size)

    this.prevChars = new Uint16Array(this.size)
    this.prevFR = new Uint8Array(this.size)
    this.prevFG = new Uint8Array(this.size)
    this.prevFB = new Uint8Array(this.size)
    this.prevFA = new Uint8Array(this.size)
    this.prevBR = new Uint8Array(this.size)
    this.prevBG = new Uint8Array(this.size)
    this.prevBB = new Uint8Array(this.size)
    this.prevBA = new Uint8Array(this.size)

    this.clearColor = Color.BLACK
    this.clearR = 0
    this.clearG = 0
    this.clearB = 0
    this.clearA = 255
    this.clear(clearColor)

    this.prevChars.fill(0xffff)
    this.prevFR.fill(0xff)
    this.prevFG.fill(0xff)
    this.prevFA.fill(0xff)
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  /**
   * Read a cell back as a record (allocates new {@link Color} instances).
   *
   * @param x - Column.
   * @param y - Row.
   * @returns The cell record, or `null` if out of bounds.
   */
  cellAt(x: number, y: number): CellRecord | null {
    if (!this.inBounds(x, y)) return null
    const i = y * this.width + x
    return {
      character: String.fromCharCode(this.chars[i]!),
      foreground: new Color(this.fR[i]! / 255, this.fG[i]! / 255, this.fB[i]! / 255, this.fA[i]! / 255),
      background: new Color(this.bR[i]! / 255, this.bG[i]! / 255, this.bB[i]! / 255, this.bA[i]! / 255),
    }
  }

  /**
   * Read a cell's glyph and fg/bg bytes into `out` without allocating, for
   * post-processing passes that sample the composited frame. Returns false (and
   * leaves `out` untouched) for out-of-bounds coordinates.
   *
   * @param x - Column.
   * @param y - Row.
   * @param out - Target to fill.
   * @returns `true` if `out` was filled; `false` if out of bounds.
   */
  readCell(x: number, y: number, out: CellBytes): boolean {
    if (!this.inBounds(x, y)) return false
    const i = y * this.width + x
    out.char = this.chars[i]!
    out.fgR = this.fR[i]!
    out.fgG = this.fG[i]!
    out.fgB = this.fB[i]!
    out.bgR = this.bR[i]!
    out.bgG = this.bG[i]!
    out.bgB = this.bB[i]!
    return true
  }

  /**
   * Reset every cell to `background` (space glyph, that background) and remember
   * it as the default for subsequent writes.
   *
   * @param background - Colour to clear with (default the last clear colour).
   */
  clear(background: Color = this.clearColor): void {
    this.clearColor = background
    this.clearR = Math.round(background.red * 255)
    this.clearG = Math.round(background.green * 255)
    this.clearB = Math.round(background.blue * 255)
    this.clearA = Math.round(background.alpha * 255)
    this.chars.fill(SPACE_CODE)
    this.fR.fill(255)
    this.fG.fill(255)
    this.fB.fill(255)
    this.fA.fill(255)
    this.bR.fill(this.clearR)
    this.bG.fill(this.clearG)
    this.bB.fill(this.clearB)
    this.bA.fill(this.clearA)
  }

  /**
   * Set a single cell's glyph and colours. Out-of-bounds writes are ignored.
   *
   * @param x - Column.
   * @param y - Row.
   * @param character - Glyph to write.
   * @param foreground - Glyph colour (default white).
   * @param background - Cell background (default the clear colour).
   */
  setCell(x: number, y: number, character: string, foreground: Color = Color.WHITE, background?: Color): void {
    if (!this.inBounds(x, y)) return
    const bg = background ?? this.clearColor
    const i = y * this.width + x
    this.chars[i] = character.charCodeAt(0)
    this.fR[i] = Math.round(foreground.red * 255)
    this.fG[i] = Math.round(foreground.green * 255)
    this.fB[i] = Math.round(foreground.blue * 255)
    this.fA[i] = Math.round(foreground.alpha * 255)
    this.bR[i] = Math.round(bg.red * 255)
    this.bG[i] = Math.round(bg.green * 255)
    this.bB[i] = Math.round(bg.blue * 255)
    this.bA[i] = Math.round(bg.alpha * 255)
  }

  /**
   * Set a cell from raw 0–255 byte channels (alpha forced to 255). Out-of-bounds
   * writes are ignored.
   *
   * @param x - Column.
   * @param y - Row.
   * @param character - Glyph to write.
   * @param fgR - Foreground red (0–255).
   * @param fgG - Foreground green (0–255).
   * @param fgB - Foreground blue (0–255).
   * @param bgR - Background red (0–255).
   * @param bgG - Background green (0–255).
   * @param bgB - Background blue (0–255).
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
    if (!this.inBounds(x, y)) return
    const i = y * this.width + x
    this.chars[i] = character.charCodeAt(0)
    this.fR[i] = fgR
    this.fG[i] = fgG
    this.fB[i] = fgB
    this.fA[i] = 255
    this.bR[i] = bgR
    this.bG[i] = bgG
    this.bB[i] = bgB
    this.bA[i] = 255
  }

  /**
   * Set a cell from raw 0–255 byte channels without bounds checking. Faster
   * than {@link setCellBytes} but the caller must guarantee valid coordinates.
   *
   * @param x - Column.
   * @param y - Row.
   * @param character - Glyph to write.
   * @param fgR - Foreground red (0–255).
   * @param fgG - Foreground green (0–255).
   * @param fgB - Foreground blue (0–255).
   * @param bgR - Background red (0–255).
   * @param bgG - Background green (0–255).
   * @param bgB - Background blue (0–255).
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
    const i = y * this.width + x
    this.chars[i] = character.charCodeAt(0)
    this.fR[i] = fgR
    this.fG[i] = fgG
    this.fB[i] = fgB
    this.fA[i] = 255
    this.bR[i] = bgR
    this.bG[i] = bgG
    this.bB[i] = bgB
    this.bA[i] = 255
  }

  /**
   * Write a string left-to-right starting at `(x, y)`.
   *
   * @param x - Leftmost column.
   * @param y - Row.
   * @param text - String to write.
   * @param foreground - Glyph colour (default white).
   * @param background - Cell background (default the clear colour).
   */
  drawText(x: number, y: number, text: string, foreground: Color = Color.WHITE, background?: Color): void {
    const bg = background ?? this.clearColor
    const fgR = Math.round(foreground.red * 255)
    const fgG = Math.round(foreground.green * 255)
    const fgB = Math.round(foreground.blue * 255)
    const bgR = Math.round(bg.red * 255)
    const bgG = Math.round(bg.green * 255)
    const bgB = Math.round(bg.blue * 255)
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (ch === undefined) continue
      this.setCellBytes(x + i, y, ch, fgR, fgG, fgB, bgR, bgG, bgB)
    }
  }

  /**
   * Fill an axis-aligned rectangle with `color` (space glyph, that background).
   *
   * @param x - Left column.
   * @param y - Top row.
   * @param width - Rectangle width in cells.
   * @param height - Rectangle height in cells.
   * @param color - Fill colour.
   */
  fillRectangle(x: number, y: number, width: number, height: number, color: Color): void {
    const bgR = Math.round(color.red * 255)
    const bgG = Math.round(color.green * 255)
    const bgB = Math.round(color.blue * 255)
    const bgA = Math.round(color.alpha * 255)
    for (let row = 0; row < height; row++) {
      const cy = y + row
      if (cy < 0 || cy >= this.height) continue
      const start = Math.max(0, x)
      const end = Math.min(this.width, x + width)
      for (let col = start; col < end; col++) {
        const i = cy * this.width + col
        this.chars[i] = SPACE_CODE
        this.fR[i] = 255
        this.fG[i] = 255
        this.fB[i] = 255
        this.fA[i] = 255
        this.bR[i] = bgR
        this.bG[i] = bgG
        this.bB[i] = bgB
        this.bA[i] = bgA
      }
    }
  }

  /** Copy the current frame into the previous-frame buffer for diffing. */
  flush(): void {
    this.prevChars.set(this.chars)
    this.prevFR.set(this.fR)
    this.prevFG.set(this.fG)
    this.prevFB.set(this.fB)
    this.prevFA.set(this.fA)
    this.prevBR.set(this.bR)
    this.prevBG.set(this.bG)
    this.prevBB.set(this.bB)
    this.prevBA.set(this.bA)
  }
}
