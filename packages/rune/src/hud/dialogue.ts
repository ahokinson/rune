/**
 * A typewriter dialogue box: reveals a page of text character-by-character over
 * time, advances on input, and steps through a queue of pages. {@link Dialogue}
 * owns the reveal/paging state (unit-tested without a canvas); {@link wrapText}
 * breaks a string into fixed-width lines and {@link drawDialogue} paints the box
 * via {@link drawLabeledPanel}. The staple of NPC chatter and tutorials.
 *
 * @module
 */

import type { Canvas } from "../draw/canvas"
import { Anchor } from "../draw/layout"
import { drawLabeledPanel, type LabeledPanelOptions } from "../draw/widgets"
import type { Rectangle } from "../math/rectangle"

/** Options for constructing a {@link Dialogue}. */
export interface DialogueOptions {
  /** The pages of text to show, in order. */
  pages: string[]
  /** Reveal speed in characters per second (default 30). */
  charactersPerSecond?: number
}

/**
 * A paged, character-by-character text reveal. Drive it from the frame loop with
 * {@link advance}; read {@link visibleText} to render. {@link skip} completes the
 * current page instantly and {@link next} moves on, so a single "confirm" key can
 * skip-then-advance the way dialogue boxes conventionally do.
 */
export class Dialogue {
  /** The pages of text. */
  readonly pages: string[]
  /** Index of the page being revealed. */
  pageIndex = 0
  private readonly charactersPerSecond: number
  private revealed = 0

  /**
   * @param options - Pages and reveal speed.
   */
  constructor(options: DialogueOptions) {
    this.pages = options.pages
    this.charactersPerSecond = options.charactersPerSecond ?? 30
  }

  /** The full text of the current page (empty once finished). */
  get current(): string {
    return this.pages[this.pageIndex] ?? ""
  }

  /** The portion of the current page revealed so far. */
  get visibleText(): string {
    return this.current.slice(0, Math.floor(this.revealed))
  }

  /** `true` once every character of the current page is shown. */
  get isPageComplete(): boolean {
    return this.revealed >= this.current.length
  }

  /** `true` once the last page has been advanced past. */
  get isFinished(): boolean {
    return this.pageIndex >= this.pages.length
  }

  /**
   * Reveal more of the current page based on elapsed time. A no-op once the page
   * is complete or the dialogue is finished.
   *
   * @param deltaMilliseconds - Frame delta in milliseconds.
   */
  advance(deltaMilliseconds: number): void {
    if (this.isFinished || this.isPageComplete) return
    this.revealed = Math.min(this.current.length, this.revealed + (this.charactersPerSecond * deltaMilliseconds) / 1000)
  }

  /** Reveal the rest of the current page immediately. */
  skip(): void {
    this.revealed = this.current.length
  }

  /**
   * Move to the next page and restart its reveal. Returns `false` once there are
   * no more pages (the dialogue is finished).
   *
   * @returns `true` if a next page is now showing, `false` if finished.
   */
  next(): boolean {
    if (this.isFinished) return false
    this.pageIndex++
    this.revealed = 0
    return !this.isFinished
  }
}

/**
 * Break `text` into lines no wider than `width` cells, splitting on spaces. Words
 * longer than `width` are hard-split. Operates on the plain string only — glyph
 * rendering stays with the canvas/terminal.
 *
 * @param text - Text to wrap.
 * @param width - Maximum line width in cells.
 * @returns The wrapped lines.
 */
export function wrapText(text: string, width: number): string[] {
  if (width <= 0) return [text]
  const lines: string[] = []
  let line = ""
  for (const word of text.split(/\s+/).filter((w) => w.length > 0)) {
    let remaining = word
    // Hard-split a word too long to ever fit on one line.
    while (remaining.length > width) {
      if (line.length > 0) {
        lines.push(line)
        line = ""
      }
      lines.push(remaining.slice(0, width))
      remaining = remaining.slice(width)
    }
    const candidate = line.length === 0 ? remaining : `${line} ${remaining}`
    if (candidate.length > width) {
      lines.push(line)
      line = remaining
    } else {
      line = candidate
    }
  }
  if (line.length > 0) lines.push(line)
  return lines.length > 0 ? lines : [""]
}

/** Options for {@link drawDialogue}; the {@link LabeledPanelOptions} fields plus a wrap width. */
export interface DialogueDrawOptions extends Omit<LabeledPanelOptions, "lines"> {
  /** Inner text width in cells; the visible text wraps to this. */
  width: number
  /** Glyph shown after the text once the page is fully revealed (default `"▼"`). */
  advanceGlyph?: string
}

/**
 * Draw `dialogue`'s currently visible text in a labelled panel `width` cells wide,
 * wrapping to fit, with an advance indicator appended once the page completes.
 *
 * @param canvas - Target canvas.
 * @param dialogue - The dialogue to render.
 * @param options - Panel placement/colours plus the wrap width.
 * @returns The panel's rectangle.
 */
export function drawDialogue(canvas: Canvas, dialogue: Dialogue, options: DialogueDrawOptions): Rectangle {
  const lines = wrapText(dialogue.visibleText, options.width)
  if (dialogue.isPageComplete && lines.length > 0) {
    const glyph = options.advanceGlyph ?? "▼"
    lines[lines.length - 1] = `${lines[lines.length - 1]} ${glyph}`.trimStart()
  }
  // Pad each line to the wrap width so the panel keeps a steady size as text reveals.
  const padded = lines.map((line) => line.padEnd(options.width, " "))
  return drawLabeledPanel(canvas, { anchor: Anchor.Bottom, marginY: 1, ...options, lines: padded })
}
