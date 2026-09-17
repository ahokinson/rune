import {
  Anchor,
  type Camera,
  type CanvasSurface,
  type Color,
  clamp,
  drawBar,
  drawPanel,
  Entity2D,
  resolveAnchor,
} from "@ahokinson/rune"
import { scrambleReveal } from "../../shared/overlay"
import * as theme from "../theme"
import { MENU } from "./menu"
import { fieldColor, frameColor, inkColor, panelColor } from "./sky"
import { ageDays, hasCriticalNeed, isNightPhase, type PetState } from "./state"

// Transient UI state the HUD reads but the sim owns: a short status line
// ("yum!", "evolved!", …), how long it stays up, how long ago it was set (for
// the scramble-reveal), and which menu item is currently selected by the
// ◄/► cursor.
export interface PetUi {
  message: string
  messageRemaining: number
  messageAge: number
  menuIndex: number
}

export function createPetUi(): PetUi {
  return { message: "", messageRemaining: 0, messageAge: 0, menuIndex: 0 }
}

// The scramble-reveal resolves over this many ms, then the message holds clear
// for the rest of its lifetime.
const MESSAGE_REVEAL_MS = 600
const METER_CELLS = 8

export interface HudOptions {
  state: PetState
  ui: PetUi
}

// Screen-space overlay (ignores the camera). A Game Boy DMG dashboard: framed LCD
// panels, ramp-bar meters, and inverse key chips, all in four greens that flip
// light↔dark with the day/night cycle.
export class Hud extends Entity2D {
  private readonly state: PetState
  private readonly ui: PetUi
  private elapsed = 0
  // Recomputed every frame in draw(); seeded with the day palette.
  private field: Color = theme.GB0
  private panel: Color = theme.GB1
  private frame: Color = theme.GB2
  private ink: Color = theme.GB3

  constructor(options: HudOptions) {
    super({ zIndex: 1000 })
    this.state = options.state
    this.ui = options.ui
  }

  override update(deltaMilliseconds: number): void {
    this.elapsed += deltaMilliseconds
    if (this.ui.messageRemaining > 0) this.ui.messageAge += deltaMilliseconds
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    this.field = fieldColor(this.state)
    this.panel = panelColor(this.state)
    this.frame = frameColor(this.state)
    this.ink = inkColor(this.state)

    this.drawStatus(canvas)
    this.drawInfo(canvas)
    this.drawAlert(canvas)
    this.drawMenu(canvas)

    if (this.ui.messageRemaining > 0 && this.ui.message) {
      const y = Math.floor(canvas.height * 0.42) + 6
      const progress = clamp(this.ui.messageAge / MESSAGE_REVEAL_MS, 0, 1)
      const text = scrambleReveal(this.ui.message, progress, Math.floor(this.elapsed / 80))
      this.centered(canvas, y, text, this.ink)
    }

    if (this.state.dead) this.banner(canvas, "R.I.P.  —  press R for a new egg")
    else if (this.state.sleeping) this.banner(canvas, "z z Z")
  }

  // --- Panels ----------------------------------------------------------------

  private drawStatus(canvas: CanvasSurface): void {
    const x = 1
    const w = 18
    drawPanel(canvas, x, 0, w, 6, this.panel, this.frame, "block")
    this.meter(canvas, x + 2, 1, "FOOD", this.state.hunger)
    this.meter(canvas, x + 2, 2, "HAPPY", this.state.happiness)
    this.meter(canvas, x + 2, 3, "ENRGY", this.state.energy)
    this.meter(canvas, x + 2, 4, "CLEAN", this.state.hygiene)
  }

  private meter(canvas: CanvasSurface, x: number, y: number, label: string, value: number): void {
    canvas.drawText(x, y, label.padEnd(6), this.ink, this.panel)
    drawBar(canvas, x + 6, y, METER_CELLS, value, this.ink, this.frame, this.panel, "▓")
  }

  private drawInfo(canvas: CanvasSurface): void {
    const clock = isNightPhase(this.state) ? "☾" : "☀"
    const dayNum = Math.floor(ageDays(this.state)) + 1
    const stage = this.state.stage.toUpperCase()
    const weight = `${Math.round(this.state.weight)}g`
    // Segmented, multi-color readout so the eye picks out the parts at a glance:
    // ☔ day(n) in ink, stage in frame, weight in ink — like a styled <span> run.
    const parts: Array<{ text: string; color: Color }> = [
      { text: `${clock} `, color: this.ink },
      { text: `DAY ${dayNum}  `, color: this.frame },
      { text: `${stage}  `, color: this.ink },
      { text: weight, color: this.frame },
    ]
    const textWidth = parts.reduce((sum, p) => sum + p.text.length, 0)
    const w = textWidth + 4
    const x = canvas.width - w - 1
    drawPanel(canvas, x, 0, w, 3, this.panel, this.frame, "block")
    let cx = x + 2
    for (const part of parts) {
      canvas.drawText(cx, 1, part.text, part.color, this.panel)
      cx += part.text.length
    }
  }

  private drawAlert(canvas: CanvasSurface): void {
    if (!hasCriticalNeed(this.state)) return
    if (Math.floor(this.elapsed / 350) % 2 !== 0) return
    const text = this.state.sick ? "! SICK !" : "! NEEDS YOU !"
    this.centered(canvas, 1, text, this.ink)
  }

  private drawMenu(canvas: CanvasSurface): void {
    // Each item is a key chip + label; a ► cursor sits in the gap before the
    // selected one, which also inverts (panel-colour text on ink) so the
    // selection reads at a glance. ◄/► move it, enter activates.
    const cellWidth = (item: (typeof MENU)[number]) => 3 + 1 + item.label.length // " F " + space + label
    const gap = 2
    const content = MENU.reduce((sum, item) => sum + cellWidth(item) + gap, -gap)
    const panelW = content + 4
    const px = resolveAnchor(canvas.width, canvas.height, { anchor: Anchor.Bottom, width: panelW, height: 3 }).x
    const py = canvas.height - 4
    drawPanel(canvas, px, py, panelW, 3, this.panel, this.frame, "block")

    let x = px + 2
    const y = py + 1
    const selected = this.ui.menuIndex % MENU.length
    for (let i = 0; i < MENU.length; i++) {
      const item = MENU[i]!
      const chip = ` ${item.key.toUpperCase()} `
      if (i === selected) {
        canvas.drawText(x - 1, y, "►", this.panel, this.ink)
        canvas.drawText(x, y, chip, this.panel, this.ink)
        canvas.drawText(x + 4, y, item.label, this.panel, this.ink)
      } else {
        canvas.drawText(x, y, chip, this.frame, this.panel)
        canvas.drawText(x + 4, y, item.label, this.frame, this.panel)
      }
      x += cellWidth(item) + gap
    }

    this.centered(canvas, canvas.height - 1, "◄ ► select · enter do · R new egg · esc quit", this.frame)
  }

  // --- Helpers ---------------------------------------------------------------

  private centered(canvas: CanvasSurface, y: number, text: string, color: Color): void {
    const x = resolveAnchor(canvas.width, canvas.height, { anchor: Anchor.Center, width: text.length, height: 1 }).x
    canvas.drawText(x, y, text, color, this.field)
  }

  private banner(canvas: CanvasSurface, text: string): void {
    const w = text.length + 4
    const rect = resolveAnchor(canvas.width, canvas.height, { anchor: Anchor.Center, width: w, height: 3 })
    drawPanel(canvas, rect.x, rect.y, w, 3, this.panel, this.frame, "block")
    canvas.drawText(rect.x + 2, rect.y + 1, text, this.ink, this.panel)
  }
}
