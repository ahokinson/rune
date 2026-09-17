/**
 * Canvas anchoring and flow layout. Resolves a {@link Rectangle} for a fixed-size
 * box against the canvas bounds from a nine-point {@link Anchor} plus margins, and
 * lays a run of sized items out along a row or column with a gap. Lets HUD/overlay
 * widgets pin themselves to an edge or the centre instead of hand-rolling
 * `canvas.height - height` / `(canvas.width - width) / 2` cell arithmetic.
 *
 * @module
 */

import { Rectangle } from "../math/rectangle"

/**
 * Nine-point anchor for placing a box inside the canvas: the three rows
 * (top/middle/bottom) crossed with the three columns (left/centre/right).
 */
export enum Anchor {
  /** Pinned to the top-left corner. */
  TopLeft = "top-left",
  /** Centred horizontally along the top edge. */
  Top = "top",
  /** Pinned to the top-right corner. */
  TopRight = "top-right",
  /** Centred vertically along the left edge. */
  Left = "left",
  /** Centred in both axes. */
  Center = "center",
  /** Centred vertically along the right edge. */
  Right = "right",
  /** Pinned to the bottom-left corner. */
  BottomLeft = "bottom-left",
  /** Centred horizontally along the bottom edge. */
  Bottom = "bottom",
  /** Pinned to the bottom-right corner. */
  BottomRight = "bottom-right",
}

/** Options for {@link resolveAnchor}. */
export interface AnchorOptions {
  /** Which point of the canvas the box pins to. */
  anchor: Anchor
  /** Box width in cells. */
  width: number
  /** Box height in cells. */
  height: number
  /** Horizontal inset from a left/right edge, in cells (default 0). Ignored for centred columns. */
  marginX?: number
  /** Vertical inset from a top/bottom edge, in cells (default 0). Ignored for centred rows. */
  marginY?: number
}

// Per-anchor horizontal/vertical placement weights: 0 hugs the start edge, 0.5
// centres, 1 hugs the end edge. Margins only bite on the hugged edges.
const HORIZONTAL: Record<Anchor, number> = {
  [Anchor.TopLeft]: 0,
  [Anchor.Left]: 0,
  [Anchor.BottomLeft]: 0,
  [Anchor.Top]: 0.5,
  [Anchor.Center]: 0.5,
  [Anchor.Bottom]: 0.5,
  [Anchor.TopRight]: 1,
  [Anchor.Right]: 1,
  [Anchor.BottomRight]: 1,
}
const VERTICAL: Record<Anchor, number> = {
  [Anchor.TopLeft]: 0,
  [Anchor.Top]: 0,
  [Anchor.TopRight]: 0,
  [Anchor.Left]: 0.5,
  [Anchor.Center]: 0.5,
  [Anchor.Right]: 0.5,
  [Anchor.BottomLeft]: 1,
  [Anchor.Bottom]: 1,
  [Anchor.BottomRight]: 1,
}

/**
 * Resolve the screen-space {@link Rectangle} for a `width`×`height` box anchored
 * inside a `canvasWidth`×`canvasHeight` grid. Left/right anchors inset by
 * `marginX`, top/bottom anchors by `marginY`; centred axes ignore the margin. The
 * origin is rounded to whole cells and clamped so the box never starts off the
 * left/top edge (it may still overflow right/bottom if larger than the canvas).
 *
 * @param canvasWidth - Grid width in cells.
 * @param canvasHeight - Grid height in cells.
 * @param options - Anchor, size, and margins.
 * @returns The placed rectangle.
 */
export function resolveAnchor(canvasWidth: number, canvasHeight: number, options: AnchorOptions): Rectangle {
  const marginX = options.marginX ?? 0
  const marginY = options.marginY ?? 0
  const hx = HORIZONTAL[options.anchor]
  const vy = VERTICAL[options.anchor]
  // Free space the box can slide across, then biased by the anchor weight. The
  // margin only pushes the box in from a hugged edge (weight 0 or 1); a centred
  // axis (weight 0.5) ignores it.
  const freeX = canvasWidth - options.width
  const freeY = canvasHeight - options.height
  const marginShiftX = hx === 0 ? marginX : hx === 1 ? -marginX : 0
  const marginShiftY = vy === 0 ? marginY : vy === 1 ? -marginY : 0
  const rawX = freeX * hx + marginShiftX
  const rawY = freeY * vy + marginShiftY
  const x = Math.max(0, Math.round(rawX))
  const y = Math.max(0, Math.round(rawY))
  return new Rectangle(x, y, options.width, options.height)
}

/**
 * Lay `itemSizes` out end-to-end with `gap` cells between adjacent items,
 * returning the start offset of each item (the first at 0). Direction-agnostic —
 * use for a horizontal run via {@link flowRow} or a vertical stack via
 * {@link flowColumn}.
 *
 * @param itemSizes - Size of each item along the flow axis (widths or heights).
 * @param gap - Cells inserted between items (not before the first or after the last).
 * @returns Per-item start offsets, same length as `itemSizes`.
 */
function flow(itemSizes: number[], gap: number): number[] {
  const offsets: number[] = []
  let cursor = 0
  for (let i = 0; i < itemSizes.length; i++) {
    offsets.push(cursor)
    cursor += itemSizes[i]! + gap
  }
  return offsets
}

/**
 * Per-item X offsets for a left-to-right run of `itemSizes` (widths) separated by
 * `gap`. See {@link flow}.
 *
 * @param itemSizes - Item widths in cells.
 * @param gap - Cells between items.
 * @returns Per-item X offsets.
 */
export function flowRow(itemSizes: number[], gap: number): number[] {
  return flow(itemSizes, gap)
}

/**
 * Per-item Y offsets for a top-to-bottom stack of `itemSizes` (heights) separated
 * by `gap`. See {@link flow}.
 *
 * @param itemSizes - Item heights in cells.
 * @param gap - Cells between items.
 * @returns Per-item Y offsets.
 */
export function flowColumn(itemSizes: number[], gap: number): number[] {
  return flow(itemSizes, gap)
}

/**
 * Total extent of a flow run: the sum of `itemSizes` plus `gap` between each pair.
 * Handy for sizing a panel to wrap a {@link flowRow}/{@link flowColumn}.
 *
 * @param itemSizes - Item sizes along the flow axis.
 * @param gap - Cells between items.
 * @returns The run length in cells (0 for an empty run).
 */
export function flowExtent(itemSizes: number[], gap: number): number {
  if (itemSizes.length === 0) return 0
  let total = 0
  for (const size of itemSizes) total += size
  return total + gap * (itemSizes.length - 1)
}
