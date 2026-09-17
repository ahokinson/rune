/**
 * ASCII brightness ramps for shading cells by luminance.
 *
 * @module
 */

/** Default ramp from darkest (space) to brightest, for mapping a 0..1 brightness to a shade. */
export const DEFAULT_CHAR_RAMP = " .:;=+*#%@"

/**
 * Pick a glyph from `ramp` for a 0..1 brightness. Out-of-range values clamp to
 * the ends of the ramp.
 *
 * @param brightness - Value in 0..1 (clamped to range).
 * @param ramp - Character ramp to sample (default {@link DEFAULT_CHAR_RAMP}).
 * @returns The character at the clamped index.
 */
export function brightnessToChar(brightness: number, ramp = DEFAULT_CHAR_RAMP): string {
  const idx = Math.max(0, Math.min(ramp.length - 1, Math.floor(brightness * ramp.length)))
  return ramp[idx]!
}
