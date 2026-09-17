import { type Camera, type CanvasSurface, Color, Entity2D } from "@ahokinson/rune"
import { drawBigText, measureBigText, type Shimmer } from "../../shared/overlay"
import * as theme from "../theme"
import { fieldColor, inkColor, panelColor } from "./sky"
import { LifeStage, type PetState } from "./state"

// The evolution moment: a brief, juicy reveal when the pet grows into a new
// stage. Three layered effects over ~900ms:
//   1. A screen flash — the whole LCD floods lightest-green then drains back
//      to the field colour (the DMG "white-out" on a big event).
//   2. Horizontal tear bands — a few rows of ▀ in the lightest shade, sine-
//      shifted and fading, like the LCD skipping a refresh.
//   3. A two-tone ASCII-font banner of the new stage name with a shimmer band
//      sweeping across it, so the name "arrives" rather than just appearing.
//
// The banner fit-checks against the terminal width: `slick` (the bold two-tone
// face) is preferred, falling back to `tiny` on narrow terminals, then to plain
// text. Retires itself after the lifetime; the World owns the sparkle burst and
// the scramble-reveal status line that accompany it.

const LIFETIME_MS = 900
const FLASH_MS = 180
const TEAR_MS = 500
const BANNER_START_MS = 80
const BANNER_END_MS = 780
const SHIMMER_WIDTH = 6 // cells either side of the sweep centre that light up

// Tear-band rows, as fractions of screen height. Fixed seed so the tear reads
// the same each time rather than flickering randomly.
const TEAR_ROWS = [0.28, 0.46, 0.62, 0.74]

export interface EvolveRevealOptions {
  state: PetState
  stage: LifeStage
}

export class EvolveReveal extends Entity2D {
  private readonly state: PetState
  private readonly stage: LifeStage
  private elapsed = 0

  constructor(options: EvolveRevealOptions) {
    super({ zIndex: 3000 })
    this.state = options.state
    this.stage = options.stage
  }

  override update(deltaMilliseconds: number): void {
    this.elapsed += deltaMilliseconds
    if (this.elapsed >= LIFETIME_MS) this.markForRemoval()
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const field = fieldColor(this.state)
    const ink = inkColor(this.state)
    const panel = panelColor(this.state)

    // --- 1. Flash ---------------------------------------------------------
    if (this.elapsed < FLASH_MS) {
      const t = this.elapsed / FLASH_MS
      const flash = Color.lerp(theme.GB0, field, t)
      canvas.fillRectangle(0, 0, canvas.width, canvas.height, flash)
    }

    // --- 2. Tear bands ----------------------------------------------------
    if (this.elapsed < TEAR_MS) {
      const tearT = this.elapsed / TEAR_MS
      // Fade the tear out over its window; amplitude shrinks too.
      const alpha = 1 - tearT
      const amp = (1 - tearT) * 8
      const bandColor = Color.lerp(theme.GB0, field, 0.6 + 0.4 * tearT)
      for (let i = 0; i < TEAR_ROWS.length; i++) {
        const y = Math.floor(canvas.height * TEAR_ROWS[i]!)
        if (y < 0 || y >= canvas.height) continue
        // Each band shifts by a different phase so they don't move in lockstep.
        const shift = Math.round(Math.sin(this.elapsed / 90 + i * 1.7) * amp)
        // Sparse the band as it fades: draw every other cell once alpha is low.
        const stride = alpha < 0.4 ? 2 : 1
        for (let x = 0; x < canvas.width; x += stride) {
          const sx = (((x + shift) % canvas.width) + canvas.width) % canvas.width
          canvas.setCell(sx, y, "▀", bandColor, field)
        }
      }
    }

    // --- 3. Banner + shimmer ---------------------------------------------
    if (this.elapsed >= BANNER_START_MS && this.elapsed < BANNER_END_MS) {
      const bannerT = (this.elapsed - BANNER_START_MS) / (BANNER_END_MS - BANNER_START_MS)
      const text = bannerText(this.stage)
      this.drawBanner(canvas, text, ink, panel, field, bannerT)
    }
  }

  private drawBanner(
    canvas: CanvasSurface,
    text: string,
    ink: Color,
    accent: Color,
    field: Color,
    bannerT: number,
  ): void {
    // Fit-check: slick (bold two-tone) → tiny → plain text.
    const margin = 4
    const maxWidth = canvas.width - margin
    let font: "slick" | "tiny" | null = "slick"
    let size = measureBigText(text, "slick")
    if (size.width > maxWidth) {
      font = "tiny"
      size = measureBigText(text, "tiny")
      if (size.width > maxWidth) font = null
    }

    if (font === null) {
      // Plain centered text as the last resort.
      const y = Math.floor(canvas.height / 2)
      const x = Math.floor((canvas.width - text.length) / 2)
      canvas.drawText(x, y, text, ink, field)
      return
    }

    const x = Math.floor((canvas.width - size.width) / 2)
    const y = Math.floor(canvas.height / 2 - size.height / 2)

    // Shimmer band sweeps left→right across the banner over its lifetime.
    const sweepX = x + Math.round(bannerT * size.width)
    const shimmer: Shimmer = { x: sweepX, width: SHIMMER_WIDTH, color: theme.GB0 }

    drawBigText(canvas, x, y, text, font, ink, accent, field, shimmer)
  }
}

function bannerText(stage: LifeStage): string {
  if (stage === LifeStage.Mochi) return "HATCHED!"
  return `${stage.toUpperCase()}!`
}
