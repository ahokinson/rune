/**
 * Box-drawing glyph sets for framed rectangles, exposed via {@link boxStyles}
 * and selected by name with {@link BoxStyleName}.
 *
 * @module
 */

/** Glyphs for the corners and edges of a bordered box. */
export interface BoxStyle {
  /** Top-left corner glyph. */
  topLeft: string
  /** Top-right corner glyph. */
  topRight: string
  /** Bottom-left corner glyph. */
  bottomLeft: string
  /** Bottom-right corner glyph. */
  bottomRight: string
  /** Horizontal edge glyph. */
  horizontal: string
  /** Vertical edge glyph. */
  vertical: string
}

/** Named box-drawing glyph sets: `single`, `double`, `rounded`, `heavy`, `ascii`. */
export const boxStyles = {
  single: {
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
    horizontal: "─",
    vertical: "│",
  },
  double: {
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
    horizontal: "═",
    vertical: "║",
  },
  rounded: {
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
    horizontal: "─",
    vertical: "│",
  },
  heavy: {
    topLeft: "┏",
    topRight: "┓",
    bottomLeft: "┗",
    bottomRight: "┛",
    horizontal: "━",
    vertical: "┃",
  },
  ascii: {
    topLeft: "+",
    topRight: "+",
    bottomLeft: "+",
    bottomRight: "+",
    horizontal: "-",
    vertical: "|",
  },
} as const satisfies Record<string, BoxStyle>

/** Names of the built-in {@link boxStyles} sets. */
export type BoxStyleName = keyof typeof boxStyles
