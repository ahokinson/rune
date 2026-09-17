import { Color, lerp } from "@ahokinson/rune"
import * as theme from "../theme"
import { dayPhase, type PetState } from "./state"

// 0 = full day, 1 = deep night, with short dusk/dawn ramps. By night the whole
// LCD inverts — dark field, light ink — like a backlight clicking off.
export function nightness(phase: number): number {
  if (phase < 0.5) return 0
  if (phase < 0.66) return lerp(0, 1, (phase - 0.5) / 0.16)
  if (phase < 0.95) return 1
  return lerp(1, 0, (phase - 0.95) / 0.05)
}

// The four DMG layers, each flipping lightest↔darkest across day/night so the UI
// keeps its contrast either way.
export function fieldColor(state: PetState): Color {
  return Color.lerp(theme.GB0, theme.GB3, nightness(dayPhase(state)))
}
export function panelColor(state: PetState): Color {
  return Color.lerp(theme.GB1, theme.GB2, nightness(dayPhase(state)))
}
export function frameColor(state: PetState): Color {
  return Color.lerp(theme.GB2, theme.GB1, nightness(dayPhase(state)))
}
export function inkColor(state: PetState): Color {
  return Color.lerp(theme.GB3, theme.GB0, nightness(dayPhase(state)))
}
