/**
 * Built-in colour palettes (PICO-8, Game Boy DMG, DawnBringer 16) and a helper
 * to define your own from hex strings or {@link Color} values.
 *
 * @module
 */

import { Color } from "./color"

/** A named lookup from colour name to {@link Color}. */
export type Palette = Record<string, Color>

function buildPalette(entries: Record<string, string>): Palette {
  const palette: Palette = {}
  for (const [name, hex] of Object.entries(entries)) {
    palette[name] = Color.fromHex(hex)
  }
  return palette
}

const pico8 = buildPalette({
  black: "#000000",
  darkBlue: "#1d2b53",
  darkPurple: "#7e2553",
  darkGreen: "#008751",
  brown: "#ab5236",
  darkGrey: "#5f574f",
  lightGrey: "#c2c3c7",
  white: "#fff1e8",
  red: "#ff004d",
  orange: "#ffa300",
  yellow: "#ffec27",
  green: "#00e436",
  blue: "#29adff",
  lavender: "#83769c",
  pink: "#ff77a8",
  peach: "#ffccaa",
})

/**
 * Game Boy DMG-01, true-LCD RGB values (lightest → darkest). The bluer ink
 * (#081820) reads more like a real lit DMG screen than the green-only web hexes.
 * Mirrored in examples/tamagotui/theme.ts as the four GB shades.
 */
const gameboy = buildPalette({
  lightest: "#e0f8d0",
  light: "#88c070",
  dark: "#346856",
  darkest: "#081820",
})

const dawnbringer16 = buildPalette({
  black: "#140c1c",
  maroon: "#442434",
  navy: "#30346d",
  grey: "#4e4a4e",
  brown: "#854c30",
  darkGreen: "#346524",
  red: "#d04648",
  taupe: "#757161",
  blue: "#597dce",
  orange: "#d27d2c",
  silver: "#8595a1",
  green: "#6daa2c",
  peach: "#d2aa99",
  cyan: "#6dc2ca",
  yellow: "#dad45e",
  white: "#deeed6",
})

/**
 * Build a palette from a mix of hex strings and {@link Color} values. Exposed
 * on {@link Palette} as `Palette.define`.
 */
function definePalette(entries: Record<string, string | Color>): Palette {
  const palette: Palette = {}
  for (const [name, value] of Object.entries(entries)) {
    palette[name] = value instanceof Color ? value : Color.fromHex(value)
  }
  return palette
}

/** Built-in palettes plus a {@link Palette.define | define} helper. */
export const Palette = {
  pico8,
  gameboy,
  dawnbringer16,
  define: definePalette,
} as const
