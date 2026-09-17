/**
 * Conversions between rune's {@link Color} and opentui's `RGBA` tuple type.
 *
 * @module
 */

import { RGBA } from "@opentui/core"
import { Color } from "./color"

/**
 * Convert a {@link Color} to an opentui `RGBA` instance.
 *
 * @param color - Source colour.
 * @returns A new `RGBA` with the same channels.
 */
export function colorToRGBA(color: Color): RGBA {
  return RGBA.fromValues(color.red, color.green, color.blue, color.alpha)
}

/**
 * Convert an opentui `RGBA` tuple to a rune {@link Color}.
 *
 * @param rgba - Source RGBA.
 * @returns A new {@link Color}.
 */
export function rgbaToColor(rgba: RGBA): Color {
  return new Color(rgba.r, rgba.g, rgba.b, rgba.a)
}
