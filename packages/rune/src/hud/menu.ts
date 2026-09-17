/**
 * A selectable list of items with a moving cursor — the building block for title
 * screens, pause menus, and the action bars terminal games carry. {@link Menu}
 * holds the pure navigation state (cursor, wrap, skipping disabled items) so it
 * unit-tests without a canvas; {@link drawMenu} renders it (as a vertical list or
 * a horizontal chip bar) and returns each item's clickable rectangle for mouse
 * hit-testing.
 *
 * @module
 */

import type { Canvas } from "../draw/canvas"
import type { Color } from "../draw/color"
import { Rectangle } from "../math/rectangle"

/** Layout direction for a {@link Menu} and {@link drawMenu}. */
export enum MenuOrientation {
  /** One item per row, top to bottom. */
  Vertical = "vertical",
  /** Items as a left-to-right chip bar. */
  Horizontal = "horizontal",
}

/** One entry in a {@link Menu}. */
export interface MenuItem<T> {
  /** The value selecting this entry yields. */
  value: T
  /** Display text. */
  label: string
  /** Whether the cursor may land here (default `true`). Disabled items are skipped and dimmed. */
  enabled?: boolean
}

/** Options for constructing a {@link Menu}. */
export interface MenuOptions<T> {
  /** The entries, in display order. */
  items: MenuItem<T>[]
  /** Layout direction (default {@link MenuOrientation.Vertical}). */
  orientation?: MenuOrientation
  /** Whether moving past an end wraps to the other end (default `true`). */
  wrap?: boolean
  /** Initial cursor index (default the first enabled item). */
  cursor?: number
}

/**
 * Cursor state over a list of {@link MenuItem}s. Navigation skips disabled items
 * and, when `wrap` is set, rolls around the ends. Input-source agnostic: drive it
 * from a keyboard snapshot, an action map, or mouse hit-testing — it only owns the
 * selection.
 */
export class Menu<T> {
  /** The entries. */
  items: MenuItem<T>[]
  /** Index of the highlighted item. */
  cursor: number
  /** Layout direction. */
  readonly orientation: MenuOrientation
  /** Whether navigation wraps at the ends. */
  readonly wrap: boolean

  /**
   * @param options - Items and navigation behaviour.
   */
  constructor(options: MenuOptions<T>) {
    this.items = options.items
    this.orientation = options.orientation ?? MenuOrientation.Vertical
    this.wrap = options.wrap ?? true
    this.cursor = options.cursor ?? this.firstEnabled()
  }

  private firstEnabled(): number {
    const index = this.items.findIndex((item) => item.enabled !== false)
    return index === -1 ? 0 : index
  }

  /** The highlighted item, or `undefined` if the menu is empty. */
  get current(): MenuItem<T> | undefined {
    return this.items[this.cursor]
  }

  /** The highlighted item's value, or `undefined` if the menu is empty. */
  get value(): T | undefined {
    return this.current?.value
  }

  /**
   * Move the cursor `delta` steps (sign = direction), skipping disabled items.
   * Wraps around the ends when `wrap` is set, otherwise stops at the last enabled
   * item. A no-op if no item is enabled.
   *
   * @param delta - Steps to move; negative moves toward the start.
   */
  moveBy(delta: number): void {
    const count = this.items.length
    if (count === 0 || delta === 0) return
    const step = delta > 0 ? 1 : -1
    let index = this.cursor
    for (let taken = 0; taken < count; taken++) {
      const next = index + step
      if (next < 0 || next >= count) {
        if (!this.wrap) break
        index = (next + count) % count
      } else {
        index = next
      }
      if (this.items[index]!.enabled !== false) {
        this.cursor = index
        return
      }
    }
  }

  /** Move to the next enabled item (see {@link moveBy}). */
  next(): void {
    this.moveBy(1)
  }

  /** Move to the previous enabled item (see {@link moveBy}). */
  previous(): void {
    this.moveBy(-1)
  }

  /**
   * Jump the cursor to `index` if that item exists and is enabled.
   *
   * @param index - Target item index.
   * @returns `true` if the cursor moved there.
   */
  setCursor(index: number): boolean {
    const item = this.items[index]
    if (!item || item.enabled === false) return false
    this.cursor = index
    return true
  }
}

/** Visual options for {@link drawMenu}. */
export interface MenuDrawOptions {
  /** Left column of the first item. */
  x: number
  /** Top row of the first item. */
  y: number
  /** Colour for an unselected, enabled item. */
  itemColor: Color
  /** Foreground for the selected item. */
  selectedColor: Color
  /** Background highlight for the selected item. */
  selectedBackground: Color
  /** Cell background for unselected items. */
  background: Color
  /** Colour for disabled items (default `itemColor`). */
  disabledColor?: Color
  /** Cells between items (default 0 vertical, 1 horizontal). */
  gap?: number
  /** Horizontal padding cells around each chip label (horizontal only, default 1). */
  padding?: number
}

/**
 * Render `menu` and return each item's clickable {@link Rectangle} (same order as
 * `menu.items`) so callers can hit-test the mouse. A vertical menu prints one item
 * per row with a `▶` caret on the selection; a horizontal menu prints ` label `
 * chips, the selection drawn inverted. Disabled items render dimmed.
 *
 * @param canvas - Target canvas.
 * @param menu - The menu to draw.
 * @param options - Placement and colours.
 * @returns Per-item bounding rectangles.
 */
export function drawMenu<T>(canvas: Canvas, menu: Menu<T>, options: MenuDrawOptions): Rectangle[] {
  const disabled = options.disabledColor ?? options.itemColor
  const rects: Rectangle[] = []
  if (menu.orientation === MenuOrientation.Horizontal) {
    const gap = options.gap ?? 1
    const padding = options.padding ?? 1
    const pad = " ".repeat(padding)
    let cursorX = options.x
    menu.items.forEach((item, index) => {
      const text = `${pad}${item.label}${pad}`
      const selected = index === menu.cursor
      const fg = item.enabled === false ? disabled : selected ? options.selectedColor : options.itemColor
      const bg = selected ? options.selectedBackground : options.background
      canvas.drawText(cursorX, options.y, text, fg, bg)
      rects.push(new Rectangle(cursorX, options.y, text.length, 1))
      cursorX += text.length + gap
    })
    return rects
  }

  const gap = options.gap ?? 0
  let cursorY = options.y
  menu.items.forEach((item, index) => {
    const selected = index === menu.cursor
    const caret = selected ? "▶ " : "  "
    const fg = item.enabled === false ? disabled : selected ? options.selectedColor : options.itemColor
    const bg = selected ? options.selectedBackground : options.background
    const text = `${caret}${item.label}`
    canvas.drawText(options.x, cursorY, text, fg, bg)
    rects.push(new Rectangle(options.x, cursorY, text.length, 1))
    cursorY += 1 + gap
  })
  return rects
}

/**
 * Index of the item whose rectangle (from {@link drawMenu}) contains `(x, y)`, or
 * `-1` if none. The bridge from a mouse cursor to a {@link Menu.setCursor} call.
 *
 * @param rects - Item rectangles returned by {@link drawMenu}.
 * @param x - Pointer column.
 * @param y - Pointer row.
 * @returns The hit item index, or `-1`.
 */
export function menuItemAt(rects: readonly Rectangle[], x: number, y: number): number {
  for (let index = 0; index < rects.length; index++) {
    const rect = rects[index]!
    if (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom) return index
  }
  return -1
}
