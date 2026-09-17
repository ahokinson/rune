import { Color, Palette } from "@ahokinson/rune"

// Game Boy DMG 4-shade palette, lightest → darkest. Everything on screen is
// drawn from these four greens so the whole thing reads as one LCD. The values
// live in the engine's `Palette.gameboy` (true-LCD RGB, incl. the bluer ink) so
// the example and the engine share one source of truth.
export const GB0 = Palette.gameboy.lightest! // lightest — the lit screen
export const GB1 = Palette.gameboy.light! // light
export const GB2 = Palette.gameboy.dark! // dark
export const GB3 = Palette.gameboy.darkest! // darkest — ink

// The pet (monochrome): a mid-green body with a lighter belly, dark outline and
// face, and a faint light blush.
export const BODY = GB2
export const BODY_DARK = GB3
export const BELLY = GB1
export const EYE = GB3
export const MOUTH = GB3
export const CHEEK = GB0
export const SICK = GB3

// The egg shell.
export const SHELL = GB1
export const SHELL_SPOT = GB2

// Droppings.
export const POOP = GB2
export const POOP_DARK = GB3

// A near-black for the rare place that needs pure ink (kept for clarity; the
// DMG aesthetic prefers GB3 over true black).
export const INK_BLACK = Color.BLACK
