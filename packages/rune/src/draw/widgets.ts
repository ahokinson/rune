/**
 * HUD widget primitives: bezelled panels, fractional magnitude bars, sparklines,
 * gauges, scrolling tickers, and section rules. Every widget draws cell-by-cell
 * onto a {@link Canvas} so it composites with the rest of the scene and honours
 * whatever palette the caller drives — pass the current panel/frame/ink colours
 * in. These are the higher-level siblings of the shape primitives in
 * {@link module:draw/shapes}.
 *
 * @module
 */

import type { Rectangle } from "../math/rectangle"
import { clamp } from "../math/scalar"
import type { BoxStyleName } from "./box"
import type { Canvas } from "./canvas"
import { Color } from "./color"
import { Anchor, flowExtent, resolveAnchor } from "./layout"
import { drawBox } from "./shapes"

const BLACK = Color.BLACK

/**
 * Eighth-block ramp for horizontal fractional fills: index 0 is empty, 8 is a
 * full cell. Used by {@link drawBar} to render a sub-cell-accurate bar end.
 */
const H_BLOCKS = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"]

/** Vertical eighth-block ramp for sparklines (one glyph per sample column). */
const SPARK_BARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]

/**
 * Selects a panel's bezel look: `"block"` draws the chunky block-character
 * frame; any other value is a {@link BoxStyleName} (`"single"`/`"double"`/…)
 * drawn via {@link drawBox}.
 */
export type PanelBezel = "block" | BoxStyleName

/**
 * Draw a framed panel. `bezel: "block"` draws the chunky block-character frame
 * (▛▀▜ / ▙▄▟ / ▌▐), filled with `panel` and outlined in `frame`; any other
 * `bezel` is a {@link BoxStyleName} passed to {@link drawBox} in `frame` over
 * `panel`. With a `title`, the line bezel insets the title into the top edge as
 * ┤ TITLE ├ so the panel reads as a labelled card rather than a bare rectangle.
 * Does nothing if `w` or `h` is less than 2.
 *
 * @param canvas - Target canvas.
 * @param x - Left column.
 * @param y - Top row.
 * @param w - Panel width in cells.
 * @param h - Panel height in cells.
 * @param panel - Interior fill colour.
 * @param frame - Bezel/outline colour.
 * @param bezel - Frame look (default `single`).
 * @param title - Optional label inset into the top edge (line bezels only).
 * @param titleCol - Title colour (default `frame`).
 */
export function drawPanel(
  canvas: Canvas,
  x: number,
  y: number,
  w: number,
  h: number,
  panel: Color,
  frame: Color,
  bezel: PanelBezel = "single",
  title?: string,
  titleCol: Color = frame,
): void {
  if (w < 2 || h < 2) return
  if (bezel === "block") {
    canvas.fillRectangle(x, y, w, h, panel)
    canvas.drawText(x, y, `▛${"▀".repeat(w - 2)}▜`, frame, panel)
    canvas.drawText(x, y + h - 1, `▙${"▄".repeat(w - 2)}▟`, frame, panel)
    for (let r = 1; r < h - 1; r++) {
      canvas.drawText(x, y + r, "▌", frame, panel)
      canvas.drawText(x + w - 1, y + r, "▐", frame, panel)
    }
    return
  }
  drawBox(canvas, x, y, w, h, bezel, frame, panel)
  if (!title) return
  // Inset the title into the top edge: ┤ TITLE ├, clipped to the panel width.
  const maxTitle = w - 6
  if (maxTitle <= 0) return
  const label = title.length > maxTitle ? title.slice(0, maxTitle) : title
  let tx = x + 2
  canvas.setCell(tx++, y, "┤", frame, panel)
  canvas.drawText(tx, y, ` ${label} `, titleCol, panel)
  tx += label.length + 2
  canvas.setCell(tx, y, "├", frame, panel)
}

/**
 * Draw a lightweight section header: the title, then a dim rule filling to
 * `right`. Lighter than a boxed panel, so a stack of sections reads as an airy
 * rail.
 *
 * @param canvas - Target canvas.
 * @param x - Left column.
 * @param y - Row.
 * @param right - Last column the rule extends to.
 * @param title - Header label.
 * @param ruleCol - Rule colour.
 * @param titleCol - Title colour.
 * @param bg - Cell background (default black).
 */
export function drawSectionHeader(
  canvas: Canvas,
  x: number,
  y: number,
  right: number,
  title: string,
  ruleCol: Color,
  titleCol: Color,
  bg: Color = BLACK,
): void {
  canvas.drawText(x, y, title, titleCol, bg)
  for (let i = x + title.length + 1; i <= right; i++) canvas.setCell(i, y, "─", ruleCol, bg)
}

/**
 * Draw a `width`-cell window onto an endlessly looping marquee string, scrolled
 * by `offset` characters — a news-style ticker. `text` should already include
 * its own separators so the wrap reads seamlessly.
 *
 * @param canvas - Target canvas.
 * @param x - Left column.
 * @param y - Row.
 * @param width - Visible window width in cells.
 * @param text - Marquee string (looped).
 * @param offset - Scroll offset in characters.
 * @param color - Glyph colour.
 * @param bg - Cell background (default black).
 */
export function drawTicker(
  canvas: Canvas,
  x: number,
  y: number,
  width: number,
  text: string,
  offset: number,
  color: Color,
  bg: Color = BLACK,
): void {
  if (width <= 0 || text.length === 0) return
  const o = ((offset % text.length) + text.length) % text.length
  let s = ""
  for (let i = 0; i < width; i++) s += text[(o + i) % text.length]
  canvas.drawText(x, y, s, color, bg)
}

/**
 * Draw a horizontal magnitude bar `cells` wide. `frac` (clamped 0..1) fills
 * `fillChar` (default `█`; pass `▓` for a softer ramp look) left-to-right with an
 * eighth-accurate end cell; the remainder is `░` in `trackCol` over `bg` so the
 * bar's full extent still reads when nearly empty.
 *
 * @param canvas - Target canvas.
 * @param x - Left column.
 * @param y - Row.
 * @param cells - Bar width in cells.
 * @param frac - Fill fraction (clamped 0..1).
 * @param color - Fill colour.
 * @param trackCol - Empty-track colour.
 * @param bg - Cell background (default black).
 * @param fillChar - Fill glyph (default `█`).
 */
export function drawBar(
  canvas: Canvas,
  x: number,
  y: number,
  cells: number,
  frac: number,
  color: Color,
  trackCol: Color,
  bg: Color = BLACK,
  fillChar: string = "█",
): void {
  const filled = clamp(frac, 0, 1) * cells
  const full = Math.floor(filled)
  const rem = Math.round((filled - full) * 8)
  for (let i = 0; i < cells; i++) {
    if (i < full) {
      canvas.setCell(x + i, y, fillChar, color, bg)
    } else if (i === full && rem > 0) {
      canvas.setCell(x + i, y, H_BLOCKS[rem]!, color, bg)
    } else {
      canvas.setCell(x + i, y, "░", trackCol, bg)
    }
  }
}

/**
 * Draw a sparkline of a numeric series, one column per sample (oldest left,
 * newest right), scaled to `maxVal`. Empty/zero samples render as a faint
 * baseline so the strip keeps a constant footprint.
 *
 * @param canvas - Target canvas.
 * @param x - Left column.
 * @param y - Row.
 * @param samples - Sample values (oldest first).
 * @param maxVal - Value mapped to the tallest glyph.
 * @param color - Glyph colour.
 * @param bg - Cell background (default black).
 */
export function drawSparkline(
  canvas: Canvas,
  x: number,
  y: number,
  samples: number[],
  maxVal: number,
  color: Color,
  bg: Color = BLACK,
): void {
  const scale = Math.max(1, maxVal)
  for (let i = 0; i < samples.length; i++) {
    const t = clamp(samples[i]! / scale, 0, 1)
    const idx = t <= 0 ? 0 : Math.min(SPARK_BARS.length - 1, Math.ceil(t * SPARK_BARS.length) - 1)
    canvas.setCell(x + i, y, SPARK_BARS[idx]!, color, bg)
  }
}

/**
 * Draw a segmented gauge meter: `[████████░░]` with `cells` inner segments.
 * Filled segments use `fillCol`, the remainder `trackCol`. Returns the x just
 * past the closing bracket so callers can place a label after it.
 *
 * @param canvas - Target canvas.
 * @param x - Left column (opening bracket).
 * @param y - Row.
 * @param cells - Number of inner segments.
 * @param frac - Fill fraction (clamped 0..1).
 * @param fillCol - Filled-segment colour.
 * @param trackCol - Empty-segment and bracket colour.
 * @param bg - Cell background (default black).
 * @returns The x column just past the closing bracket.
 */
export function drawGauge(
  canvas: Canvas,
  x: number,
  y: number,
  cells: number,
  frac: number,
  fillCol: Color,
  trackCol: Color,
  bg: Color = BLACK,
): number {
  const filled = Math.round(clamp(frac, 0, 1) * cells)
  canvas.setCell(x, y, "[", trackCol, bg)
  for (let i = 0; i < cells; i++) {
    const fill = i < filled
    canvas.setCell(x + 1 + i, y, fill ? "█" : "░", fill ? fillCol : trackCol, bg)
  }
  canvas.setCell(x + 1 + cells, y, "]", trackCol, bg)
  return x + cells + 2
}

// Fill `rect` opaque with `panel`, then frame it (and inset `title`). drawBox only
// strokes the border, so the fill is what makes the card read as solid over the
// scene behind it. Shared by the composed widgets below.
function fillCard(
  canvas: Canvas,
  rect: Rectangle,
  panel: Color,
  frame: Color,
  bezel: PanelBezel,
  title?: string,
  titleCol?: Color,
): void {
  canvas.fillRectangle(rect.x, rect.y, rect.width, rect.height, panel)
  drawPanel(canvas, rect.x, rect.y, rect.width, rect.height, panel, frame, bezel, title, titleCol)
}

/** One control hint in a {@link drawControlLegend}: a key glyph and its action label. */
export interface ControlEntry {
  /** Key(s) for the action, e.g. `"Space"` or `"←/→"`. */
  keys: string
  /** What the key does, e.g. `"jump"`. */
  label: string
}

/** Options for {@link drawControlLegend}. */
export interface ControlLegendOptions {
  /** Where the legend pins (default {@link Anchor.BottomLeft}). */
  anchor?: Anchor
  /** Inset from the hugged horizontal edge (default 1). */
  marginX?: number
  /** Inset from the hugged vertical edge (default 0). */
  marginY?: number
  /** The control hints, drawn left-to-right. */
  controls: readonly ControlEntry[]
  /** Colour for the key glyphs. */
  keyColor: Color
  /** Colour for the action labels. */
  labelColor: Color
  /** Panel fill colour. */
  panel: Color
  /** Panel frame colour. */
  frame: Color
  /** Frame look (default `"rounded"`). */
  bezel?: PanelBezel
  /** Cells between one label and the next key (default 3). */
  gap?: number
}

/**
 * Draw a one-line control legend — a framed panel that walks `controls`
 * left-to-right, each key in `keyColor` and its label in `labelColor`. Auto-sizes
 * to its contents and anchors itself, so callers don't measure or place it by
 * hand. This is the keys-then-labels footer most HUDs carry.
 *
 * @param canvas - Target canvas.
 * @param options - Legend contents, colours, and placement.
 * @returns The panel's resolved rectangle.
 */
export function drawControlLegend(canvas: Canvas, options: ControlLegendOptions): Rectangle {
  const gap = options.gap ?? 3
  const bezel = options.bezel ?? "rounded"
  const marginX = options.marginX ?? 1
  // Each entry occupies keys + a space + label; the flow gaps sit between entries.
  const entryWidths = options.controls.map((control) => control.keys.length + 1 + control.label.length)
  const inner = flowExtent(entryWidths, gap)
  const width = Math.min(inner + 4, canvas.width - marginX)
  const rect = resolveAnchor(canvas.width, canvas.height, {
    anchor: options.anchor ?? Anchor.BottomLeft,
    width,
    height: 3,
    marginX,
    marginY: options.marginY ?? 0,
  })
  fillCard(canvas, rect, options.panel, options.frame, bezel)
  let cursor = rect.x + 2
  const textY = rect.y + 1
  for (const control of options.controls) {
    canvas.drawText(cursor, textY, control.keys, options.keyColor, options.panel)
    cursor += control.keys.length + 1
    canvas.drawText(cursor, textY, control.label, options.labelColor, options.panel)
    cursor += control.label.length + gap
  }
  return rect
}

/** Options for {@link drawLabeledPanel}. */
export interface LabeledPanelOptions {
  /** Where the panel pins (default {@link Anchor.TopLeft}). */
  anchor?: Anchor
  /** Inset from the hugged horizontal edge (default 1). */
  marginX?: number
  /** Inset from the hugged vertical edge (default 0). */
  marginY?: number
  /** Optional label inset into the top edge. */
  title?: string
  /** Title colour (default `frame`). */
  titleColor?: Color
  /** Body text, one entry per row. */
  lines: readonly string[]
  /** Body text colour. */
  lineColor: Color
  /** Panel fill colour. */
  panel: Color
  /** Panel frame colour. */
  frame: Color
  /** Frame look (default `"rounded"`). */
  bezel?: PanelBezel
}

/**
 * Draw a titled status card: a framed panel sized to its `title` and `lines`, with
 * each line printed inside. Replaces the hand-rolled `inner`/`width` measuring and
 * `fillRectangle` + `drawPanel` + `forEach(drawText)` boilerplate HUDs repeat.
 *
 * @param canvas - Target canvas.
 * @param options - Title, lines, colours, and placement.
 * @returns The panel's resolved rectangle.
 */
export function drawLabeledPanel(canvas: Canvas, options: LabeledPanelOptions): Rectangle {
  const bezel = options.bezel ?? "rounded"
  const marginX = options.marginX ?? 1
  const titleWidth = options.title ? options.title.length + 2 : 0
  const inner = Math.max(titleWidth, ...options.lines.map((line) => line.length), 0)
  const width = Math.min(inner + 4, canvas.width - marginX)
  const height = options.lines.length + 2
  const rect = resolveAnchor(canvas.width, canvas.height, {
    anchor: options.anchor ?? Anchor.TopLeft,
    width,
    height,
    marginX,
    marginY: options.marginY ?? 0,
  })
  fillCard(canvas, rect, options.panel, options.frame, bezel, options.title, options.titleColor)
  options.lines.forEach((line, row) => {
    canvas.drawText(rect.x + 2, rect.y + 1 + row, line, options.lineColor, options.panel)
  })
  return rect
}

/** Options for {@link drawModal}. */
export interface ModalOptions {
  /** Headline text. */
  title: string
  /** Optional second line under the title. */
  detail?: string
  /** Title colour. */
  titleColor: Color
  /** Detail colour (default `titleColor`). */
  detailColor?: Color
  /** Panel fill colour. */
  panel: Color
  /** Panel frame colour. */
  frame: Color
  /** Frame look (default `"rounded"`). */
  bezel?: PanelBezel
}

/**
 * Draw a centred message box — a framed `title` with an optional `detail` line
 * under it, anchored to the middle of the canvas. The "loading"/"game over"/"not a
 * git repo" modal HUDs reach for.
 *
 * @param canvas - Target canvas.
 * @param options - Message text and colours.
 * @returns The modal's resolved rectangle.
 */
export function drawModal(canvas: Canvas, options: ModalOptions): Rectangle {
  const bezel = options.bezel ?? "rounded"
  const inner = Math.max(options.title.length, options.detail?.length ?? 0)
  const width = Math.min(inner + 4, canvas.width - 2)
  const height = options.detail ? 4 : 3
  const rect = resolveAnchor(canvas.width, canvas.height, { anchor: Anchor.Center, width, height })
  fillCard(canvas, rect, options.panel, options.frame, bezel)
  canvas.drawText(rect.x + 2, rect.y + 1, options.title, options.titleColor, options.panel)
  if (options.detail) {
    canvas.drawText(rect.x + 2, rect.y + 2, options.detail, options.detailColor ?? options.titleColor, options.panel)
  }
  return rect
}
