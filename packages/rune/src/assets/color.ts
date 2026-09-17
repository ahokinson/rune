/**
 * Color and pixel-legend parsing for the asset system.
 *
 * Converts authored color values (hex strings or RGB/RGBA byte tuples) into
 * runtime {@link Color} instances, and resolves pixel legends — including
 * `extends`-based inheritance chains — into flat character-to-color maps.
 *
 * @module
 */

import { Color } from "@/draw/color"
import type { ColorData, PixelLegendData } from "./types"

/**
 * Parse an authored color into a {@link Color}.
 *
 * Accepts a CSS hex string (`"#rrggbb"` / `"#rrggbbaa"`) or an
 * `[r, g, b]` / `[r, g, b, a]` byte tuple.
 *
 * @param data - The raw color value.
 * @returns A new {@link Color}.
 */
export function parseColor(data: ColorData): Color {
  if (typeof data === "string") {
    return Color.fromHex(data)
  }
  if (Array.isArray(data)) {
    const [r, g, b, a] = data
    return Color.fromBytes(r, g, b, a ?? 255)
  }
  throw new Error(`Invalid color data: ${JSON.stringify(data)}`)
}

/**
 * Flatten a pixel legend into a character-to-color map, merging an optional
 * base legend first (skipping the reserved `extends` key). `null` entries are
 * preserved as `null` so callers can mark "no color for this character".
 *
 * @param legend - The legend to parse.
 * @param base - Optional base legend to inherit from.
 * @returns A flat character-to-`Color | null` map.
 */
export function parsePixelLegend(legend: PixelLegendData, base?: PixelLegendData): Record<string, Color | null> {
  const merged: Record<string, ColorData | null> = {}
  if (base) {
    for (const [key, value] of Object.entries(base)) {
      if (key === "extends") continue
      merged[key] = value
    }
  }
  for (const [key, value] of Object.entries(legend)) {
    if (key === "extends") continue
    merged[key] = value
  }
  const result: Record<string, Color | null> = {}
  for (const [key, value] of Object.entries(merged)) {
    result[key] = value === null ? null : parseColor(value as ColorData)
  }
  return result
}

/**
 * Resolve every legend in a map, following `extends` chains and detecting
 * cycles.
 *
 * @param legends - Map of legend name to legend data.
 * @returns Map of legend name to flat character-to-`Color | null` map.
 */
export function resolvePixelLegends(
  legends: Record<string, PixelLegendData>,
): Record<string, Record<string, Color | null>> {
  const resolved: Record<string, Record<string, Color | null>> = {}
  const resolving = new Set<string>()

  function resolve(name: string): Record<string, Color | null> {
    if (resolved[name]) return resolved[name]
    if (resolving.has(name)) {
      throw new Error(`Circular legend inheritance: ${name}`)
    }
    resolving.add(name)

    const legend = legends[name]
    if (!legend) {
      throw new Error(`Legend "${name}" not found`)
    }

    const extendsName = legend.extends
    const _base = extendsName ? resolve(extendsName) : undefined
    const baseData = extendsName ? legends[extendsName] : undefined

    resolved[name] = parsePixelLegend(legend, baseData)
    resolving.delete(name)
    return resolved[name]
  }

  for (const name of Object.keys(legends)) {
    resolve(name)
  }

  return resolved
}
