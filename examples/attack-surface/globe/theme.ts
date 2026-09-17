import { Color } from "@ahokinson/rune"

// Single source of truth for the monitor's palette. The look is a holographic
// cyan globe over a deep-navy ocean, ringed by a soft blue atmosphere, with a
// cool slate-cyan HUD. Saturated attack-category hues (see attacks.ts) pop on
// top of this. Tune values here to restyle the whole app.

// ── Globe surface (RGB tuples — blended per-cell with the limb tint) ────────
// Land brightness ramp, day side (HOT) cooling toward the night terminator (DIM).
export const LAND_HOT: [number, number, number] = [155, 245, 255]
export const LAND_LIT: [number, number, number] = [60, 200, 235]
export const LAND_MID: [number, number, number] = [28, 130, 175]
export const LAND_DIM: [number, number, number] = [16, 66, 100]
// Deep navy ocean so continents read clearly.
export const OCEAN_LIT: [number, number, number] = [10, 26, 52]
export const OCEAN_DIM: [number, number, number] = [4, 12, 28]
// Phosphor scan sweep band that briefly energises the surface it crosses.
export const SWEEP = Color.fromBytes(170, 250, 255)
// Drifting cloud tint — bright white-cyan haze blended additively over the
// surface (see clouds.ts / render.ts), so continents glow through rather than
// being hidden.
export const CLOUD: [number, number, number] = [225, 248, 255]

// ── Atmosphere / limb ──────────────────────────────────────────────────────
// RGB tuples (not Color) so the rim glow can interpolate per-cell.
export const ATMO: [number, number, number] = [50, 140, 220]
export const ATMO_DIM: [number, number, number] = [16, 50, 95]

// ── HUD ─────────────────────────────────────────────────────────────────────
export const HEADER = Color.fromBytes(190, 240, 255)
export const LABEL_DIM = Color.fromBytes(70, 130, 160)
export const VALUE = Color.fromBytes(120, 245, 255)
export const FRAME = Color.fromBytes(40, 90, 120)
export const FRAME_DIM = Color.fromBytes(22, 52, 74)

// Semantic aliases for the dashboard widgets (panels, bars, sparkline, gauge).
// Empty bar/gauge segments sit on the dim frame tone; the rate sparkline glows
// in the value cyan. HEADER doubles as the inset panel-title color.
export const GAUGE_TRACK = FRAME_DIM
export const SPARK = VALUE

// Live indicator + threat-level state colors (semantic, kept vivid).
export const LIVE_ON = Color.fromBytes(255, 70, 70)
export const LEVEL_CRITICAL = Color.fromBytes(255, 40, 40)
export const LEVEL_SEVERE = Color.fromBytes(255, 140, 0)
export const LEVEL_ELEVATED = Color.fromBytes(255, 225, 0)
export const LEVEL_GUARDED = Color.fromBytes(80, 220, 120)

export const BG = Color.fromBytes(0, 1, 4)
export const BLACK = Color.BLACK
