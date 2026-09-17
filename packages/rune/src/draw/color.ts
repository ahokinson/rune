/**
 * RGBA colour type and helpers: byte/float conversions, hex parsing, channel
 * interpolation, and the common named constants.
 *
 * @module
 */

import { clamp } from "@/math/scalar"

/** Mutable RGB out-param, byte range 0–255. Shared by the raycaster and mesh pipelines. */
export interface SurfaceColor {
  /** Red channel (0–255). */
  r: number
  /** Green channel (0–255). */
  g: number
  /** Blue channel (0–255). */
  b: number
}

/**
 * Immutable RGBA colour with channels normalised to 0–1.
 *
 * @example
 * ```ts
 * const c = Color.fromHex("#ff8000")
 * c.withAlpha(0.5)                  // 50% transparent orange
 * Color.lerp(c, Color.BLACK, 0.5)   // darken toward black
 * ```
 */
export class Color {
  /** Red channel (0–1). */
  readonly red: number
  /** Green channel (0–1). */
  readonly green: number
  /** Blue channel (0–1). */
  readonly blue: number
  /** Alpha channel (0–1, 1 = opaque). */
  readonly alpha: number

  /**
   * @param red - Red (clamped to 0–1).
   * @param green - Green (clamped to 0–1).
   * @param blue - Blue (clamped to 0–1).
   * @param alpha - Alpha (clamped to 0–1, default 1).
   */
  constructor(red: number, green: number, blue: number, alpha = 1) {
    this.red = clamp(red, 0, 1)
    this.green = clamp(green, 0, 1)
    this.blue = clamp(blue, 0, 1)
    this.alpha = clamp(alpha, 0, 1)
  }

  /**
   * Build a colour from 0–255 byte channels.
   *
   * @param red - Red (0–255).
   * @param green - Green (0–255).
   * @param blue - Blue (0–255).
   * @param alpha - Alpha (0–255, default 255).
   * @returns A new {@link Color}.
   */
  static fromBytes(red: number, green: number, blue: number, alpha = 255): Color {
    return new Color(red / 255, green / 255, blue / 255, alpha / 255)
  }

  /**
   * Parse a CSS-style hex string (`#rgb`, `#rrggbb`, or `#rrggbbaa`, with or
   * without the leading `#`).
   *
   * @param hex - Hex string to parse.
   * @returns A new {@link Color}.
   */
  static fromHex(hex: string): Color {
    let value = hex.trim()
    if (value.startsWith("#")) value = value.slice(1)
    if (value.length === 3) {
      value = value
        .split("")
        .map((c) => c + c)
        .join("")
    }
    if (value.length === 6) {
      const red = parseInt(value.slice(0, 2), 16)
      const green = parseInt(value.slice(2, 4), 16)
      const blue = parseInt(value.slice(4, 6), 16)
      return Color.fromBytes(red, green, blue, 255)
    }
    if (value.length === 8) {
      const red = parseInt(value.slice(0, 2), 16)
      const green = parseInt(value.slice(2, 4), 16)
      const blue = parseInt(value.slice(4, 6), 16)
      const alpha = parseInt(value.slice(6, 8), 16)
      return Color.fromBytes(red, green, blue, alpha)
    }
    throw new Error(`Color.fromHex: unrecognised hex string "${hex}"`)
  }

  /**
   * Return a copy of this colour with `alpha` substituted.
   *
   * @param alpha - New alpha (clamped to 0–1).
   * @returns A new {@link Color}.
   */
  withAlpha(alpha: number): Color {
    return new Color(this.red, this.green, this.blue, alpha)
  }

  /**
   * Linear interpolation between two colours across all four channels.
   *
   * @param a - Start colour.
   * @param b - End colour.
   * @param t - Interpolation factor (0 = `a`, 1 = `b`).
   * @returns A new {@link Color}.
   */
  static lerp(a: Color, b: Color, t: number): Color {
    return new Color(
      a.red + (b.red - a.red) * t,
      a.green + (b.green - a.green) * t,
      a.blue + (b.blue - a.blue) * t,
      a.alpha + (b.alpha - a.alpha) * t,
    )
  }

  /**
   * Convert to 0–255 byte channels.
   *
   * @returns An object with `red`, `green`, `blue`, `alpha` in 0–255.
   */
  toBytes(): { red: number; green: number; blue: number; alpha: number } {
    return {
      red: Math.round(this.red * 255),
      green: Math.round(this.green * 255),
      blue: Math.round(this.blue * 255),
      alpha: Math.round(this.alpha * 255),
    }
  }

  /**
   * Convert to a plain `[r, g, b, a]` tuple in 0–1.
   *
   * @returns The 4-tuple `[red, green, blue, alpha]`.
   */
  toRGBATuple(): [number, number, number, number] {
    return [this.red, this.green, this.blue, this.alpha]
  }

  /** Opaque black. */
  static readonly BLACK = new Color(0, 0, 0, 1)
  /** Opaque white. */
  static readonly WHITE = new Color(1, 1, 1, 1)
  /** Opaque red. */
  static readonly RED = new Color(1, 0, 0, 1)
  /** Opaque green. */
  static readonly GREEN = new Color(0, 1, 0, 1)
  /** Opaque blue. */
  static readonly BLUE = new Color(0, 0, 1, 1)
  /** Opaque yellow. */
  static readonly YELLOW = new Color(1, 1, 0, 1)
  /** Opaque cyan. */
  static readonly CYAN = new Color(0, 1, 1, 1)
  /** Opaque magenta. */
  static readonly MAGENTA = new Color(1, 0, 1, 1)
  /** Fully transparent black. */
  static readonly TRANSPARENT = new Color(0, 0, 0, 0)
}
