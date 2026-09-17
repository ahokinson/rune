/**
 * A clickable labelled region drawn into the canvas grid and hit-tested against
 * the mouse. {@link Button} tracks its own bounds, hover, and pressed state from a
 * {@link MouseSnapshot}; {@link drawButton} renders it in the matching visual
 * state. Pairs with the keyboard-driven {@link Menu} so pointer and keys can drive
 * the same overlay.
 *
 * @module
 */

import type { Canvas } from "../draw/canvas"
import type { Color } from "../draw/color"
import { MouseButton as Buttons, type MouseButton, type MouseSnapshot } from "../input/mouse"
import { Rectangle } from "../math/rectangle"

/** Options for constructing a {@link Button}. */
export interface ButtonOptions {
  /** Display text. */
  label: string
  /** Whether the button responds to the pointer (default `true`). */
  enabled?: boolean
}

/**
 * A canvas-space push button. Its {@link bounds} are set by {@link drawButton}
 * each frame; {@link update} reads a {@link MouseSnapshot} to refresh hover/press
 * and reports a completed click (press then release inside the bounds).
 */
export class Button {
  /** Display text. */
  label: string
  /** Whether the button responds to the pointer. */
  enabled: boolean
  /** Last drawn rectangle, used for hit-testing. */
  bounds = new Rectangle()
  /** `true` while the pointer is over the button. */
  hovered = false
  /** `true` while a press started on the button and the pointer hasn't released. */
  pressed = false

  /**
   * @param options - Label and enabled state.
   */
  constructor(options: ButtonOptions) {
    this.label = options.label
    this.enabled = options.enabled ?? true
  }

  /**
   * Point-in-bounds test against the last drawn rectangle.
   *
   * @param x - Pointer column.
   * @param y - Pointer row.
   * @returns `true` if `(x, y)` is inside {@link bounds}.
   */
  contains(x: number, y: number): boolean {
    const r = this.bounds
    return x >= r.left && x < r.right && y >= r.top && y < r.bottom
  }

  /**
   * Update hover/press from the pointer and report whether a click completed this
   * call. A click is a press that began on the button and released while still
   * over it. Disabled buttons never hover, press, or click.
   *
   * @param mouse - Current mouse snapshot.
   * @param button - Which mouse button to react to (default {@link MouseButton.Left}).
   * @returns `true` exactly on the frame the click completes.
   */
  update(mouse: MouseSnapshot, button: MouseButton = Buttons.Left): boolean {
    if (!this.enabled) {
      this.hovered = false
      this.pressed = false
      return false
    }
    this.hovered = this.contains(mouse.x, mouse.y)
    if (this.hovered && mouse.wasPressed(button)) this.pressed = true
    let clicked = false
    if (mouse.wasReleased(button)) {
      clicked = this.pressed && this.hovered
      this.pressed = false
    }
    return clicked
  }
}

/** Visual state a {@link Button} can render in. */
interface ButtonColors {
  /** Glyph colour. */
  foreground: Color
  /** Cell background. */
  background: Color
}

/** Options for {@link drawButton}. */
export interface ButtonDrawOptions {
  /** Left column. */
  x: number
  /** Row. */
  y: number
  /** Resting colours. */
  normal: ButtonColors
  /** Colours while hovered (default `normal`). */
  hover?: ButtonColors
  /** Colours while pressed (default `hover`). */
  pressed?: ButtonColors
  /** Colours while disabled (default `normal`). */
  disabled?: ButtonColors
  /** Horizontal padding cells around the label (default 1). */
  padding?: number
}

/**
 * Draw `button` as a ` label ` chip at `(x, y)` in the colours for its current
 * state, recording the drawn rectangle into {@link Button.bounds} so a subsequent
 * {@link Button.update} can hit-test it.
 *
 * @param canvas - Target canvas.
 * @param button - The button to draw (its `bounds` are updated).
 * @param options - Placement, padding, and per-state colours.
 * @returns The drawn rectangle.
 */
export function drawButton(canvas: Canvas, button: Button, options: ButtonDrawOptions): Rectangle {
  const padding = options.padding ?? 1
  const pad = " ".repeat(padding)
  const text = `${pad}${button.label}${pad}`
  const colors = !button.enabled
    ? (options.disabled ?? options.normal)
    : button.pressed
      ? (options.pressed ?? options.hover ?? options.normal)
      : button.hovered
        ? (options.hover ?? options.normal)
        : options.normal
  canvas.drawText(options.x, options.y, text, colors.foreground, colors.background)
  button.bounds = new Rectangle(options.x, options.y, text.length, 1)
  return button.bounds
}
