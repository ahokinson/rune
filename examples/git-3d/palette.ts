import { Color } from "@ahokinson/rune"

// File-type colours, keyed by extension (Gource paints files by type so the tree
// reads as coloured constellations of "kinds of code"). Anything unlisted falls
// back to NEUTRAL_FILE.
const EXTENSION_COLORS: Record<string, Color> = {
  ts: Color.fromBytes(86, 170, 255),
  tsx: Color.fromBytes(120, 200, 255),
  js: Color.fromBytes(240, 220, 90),
  jsx: Color.fromBytes(245, 230, 130),
  json: Color.fromBytes(160, 200, 120),
  md: Color.fromBytes(200, 200, 210),
  css: Color.fromBytes(200, 120, 230),
  html: Color.fromBytes(230, 130, 90),
  yaml: Color.fromBytes(120, 210, 200),
  yml: Color.fromBytes(120, 210, 200),
  toml: Color.fromBytes(150, 190, 180),
  obj: Color.fromBytes(180, 150, 120),
  png: Color.fromBytes(230, 150, 190),
  svg: Color.fromBytes(230, 160, 200),
  lock: Color.fromBytes(110, 120, 130),
  sh: Color.fromBytes(150, 230, 150),
}

const NEUTRAL_FILE = Color.fromBytes(170, 175, 185)

// The directory glyph colour and the connecting-edge colour: dim and neutral so
// the coloured file leaves and bright author beams read on top of them.
export const DIRECTORY_COLOR = Color.fromBytes(120, 128, 140)
export const EDGE_COLOR = Color.fromBytes(60, 66, 78)

// Author/actor accent colours, assigned round-robin as new authors appear so each
// contributor keeps a stable, distinct hue across the replay.
const AUTHOR_COLORS: readonly Color[] = [
  Color.fromBytes(255, 120, 120),
  Color.fromBytes(120, 220, 160),
  Color.fromBytes(150, 170, 255),
  Color.fromBytes(255, 200, 110),
  Color.fromBytes(220, 140, 255),
  Color.fromBytes(120, 230, 230),
  Color.fromBytes(255, 160, 200),
  Color.fromBytes(190, 230, 120),
]

// HSV → Color (hue in degrees, saturation/value 0..1). Small local helper so the
// district tints can be generated across the hue wheel.
function hsvColor(hueDegrees: number, saturation: number, value: number): Color {
  const c = value * saturation
  const h = (((hueDegrees % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((h % 2) - 1))
  const m = value - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 1) [r, g, b] = [c, x, 0]
  else if (h < 2) [r, g, b] = [x, c, 0]
  else if (h < 3) [r, g, b] = [0, c, x]
  else if (h < 4) [r, g, b] = [0, x, c]
  else if (h < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return new Color(r + m, g + m, b + m)
}

// District tint, hashed from the directory path so each neighbourhood keeps a
// stable, distinct hue across the replay. Desaturated and mid-dark so the bright
// file buildings and author bursts read on top of the collapsed blocks.
export function districtColor(path: string): Color {
  let hash = 2166136261
  for (let i = 0; i < path.length; i++) {
    hash ^= path.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hsvColor((hash >>> 0) % 360, 0.3, 0.52)
}

export function extensionColor(path: string): Color {
  const dot = path.lastIndexOf(".")
  const slash = path.lastIndexOf("/")
  if (dot <= slash + 1) return NEUTRAL_FILE
  const extension = path.slice(dot + 1).toLowerCase()
  return EXTENSION_COLORS[extension] ?? NEUTRAL_FILE
}

// Stable colour per author, allocated in first-seen order. The map lets the HUD
// and the actor share the exact same hue for a given name.
export class AuthorPalette {
  private readonly colors = new Map<string, Color>()

  colorFor(author: string): Color {
    const existing = this.colors.get(author)
    if (existing) return existing
    const color = AUTHOR_COLORS[this.colors.size % AUTHOR_COLORS.length]!
    this.colors.set(author, color)
    return color
  }
}
