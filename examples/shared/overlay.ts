import { type ASCIIFontName, fonts, measureText } from "@opentui/core"
import { type CanvasSurface, Color } from "@ahokinson/rune"

const BLACK = Color.BLACK

// Game-specific screen-overlay text FX: two-tone ASCII-font banners (built on
// OpenTUI's bundled fonts) and a "decoding" text reveal. Draws cell-by-cell onto
// the Canvas surface so it composites with the rest of the scene and respects
// whatever palette the caller drives — pass the current ink/background colors in.
//
// The reusable meter/panel widgets (drawBar, drawGauge, drawSparkline,
// drawTicker, drawPanel, drawSectionHeader) now live in the engine; import them
// from "@ahokinson/rune".

// A travelling highlight band swept through a banner to make it read as a live
// hologram: cells within `width` of `x` are repainted in `color`.
export interface Shimmer {
  x: number
  width: number
  color: Color
}

// Draw one row-segment of an ASCII-font glyph, honoring OpenTUI's inline color
// tags (<c1>/<c2> select the face/accent color; spaces stay transparent so the
// banner composites cleanly over `bg`). Returns the x just past the segment.
export function drawFontRowSegment(
  canvas: CanvasSurface,
  x: number,
  y: number,
  seg: string,
  c1: Color,
  c2: Color,
  bg: Color,
  shimmer: Shimmer | undefined,
): number {
  let cur = c1
  let cx = x
  let i = 0
  while (i < seg.length) {
    const ch = seg[i]!
    if (ch === "<") {
      const close = seg.indexOf(">", i)
      if (close !== -1) {
        const tag = seg.slice(i + 1, close)
        cur = tag === "c2" ? c2 : c1
        i = close + 1
        continue
      }
    }
    if (ch !== " ") {
      const lit = shimmer !== undefined && Math.abs(cx - shimmer.x) <= shimmer.width
      canvas.setCell(cx, y, ch, lit ? shimmer.color : cur, bg)
    }
    cx++
    i++
  }
  return cx
}

// Render `text` as a multi-row ASCII-font banner using OpenTUI's bundled fonts,
// painted cell-by-cell onto the canvas over `bg`. The bold fonts
// ("block"/"slick"/…) are two-tone: c1 is the glyph face, c2 the bevel/hatch
// accent; single-color fonts ("tiny") ignore c2. Returns the rendered extent for
// layout.
export function drawBigText(
  canvas: CanvasSurface,
  x: number,
  y: number,
  text: string,
  font: ASCIIFontName,
  c1: Color,
  c2: Color,
  bg: Color = BLACK,
  shimmer?: Shimmer,
): { width: number; height: number } {
  const f = fonts[font]
  const glyphs = f.chars as Record<string, string[]>
  const chars = text.toUpperCase()
  for (let row = 0; row < f.lines; row++) {
    let cx = x
    for (let i = 0; i < chars.length; i++) {
      if (i > 0) cx = drawFontRowSegment(canvas, cx, y + row, f.letterspace[row]!, c1, c2, bg, shimmer)
      const glyph = glyphs[chars[i]!] ?? glyphs[" "]!
      cx = drawFontRowSegment(canvas, cx, y + row, glyph[row]!, c1, c2, bg, shimmer)
    }
  }
  return measureText({ text: chars, font })
}

// Measure an ASCII-font banner without drawing it (for centering/fit checks).
export function measureBigText(text: string, font: ASCIIFontName): { width: number; height: number } {
  return measureText({ text: text.toUpperCase(), font })
}

// Glyph pool for the "decoding" reveal: block halves, symbols, and
// alphanumerics, so the unresolved cells still read as noise.
const SCRAMBLE = "▚▞▙▟▛▜▒░#%&@$/\\<>=+*0123456789ABCDEF"

// Progressively resolve `text` from scrambled glyphs to the real string as
// `progress` goes 0→1 (a "decoding" reveal). Unresolved cells flicker each
// `tick`; spaces, the arrow separator, and common punctuation are left intact
// so the shape reads.
export function scrambleReveal(text: string, progress: number, tick: number): string {
  if (progress >= 1) return text
  const revealed = Math.floor(text.length * progress)
  let out = ""
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (i < revealed || ch === " " || ch === "→" || ch === "!" || ch === "." || ch === "?") {
      out += ch
    } else {
      out += SCRAMBLE[(tick * 7 + i * 13) % SCRAMBLE.length]
    }
  }
  return out
}
