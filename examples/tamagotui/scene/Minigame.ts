import { type Camera, type CanvasSurface, clamp, drawPanel, Entity2D } from "@ahokinson/rune"
import { fieldColor, frameColor, inkColor, panelColor } from "./sky"
import type { PetState } from "./state"

// A short reaction minigame triggered by the Play action. A marker sweeps a bar
// and the player presses enter to stop it; the closer to the centre sweet spot,
// the bigger the happiness payoff. Times out after DURATION_MS for a clean miss.
//
// Input is owned by the World, not this entity: the scene ticks before the
// World's update loop, so if the minigame read `confirm` itself it would resolve
// during the scene tick and the same press would then re-fire into the menu in
// the World's tick. Instead the World calls `resolve()` when it sees the
// confirm key while the minigame is up. This entity only advances the marker
// and handles the timeout auto-miss.

const DURATION_MS = 1800
const SWEEP_PERIOD_MS = 1500
const BAR_WIDTH = 22
const SWEET_HALF = 2 // cells either side of centre that count as a "perfect"

export interface MinigameOptions {
  state: PetState
  // Called once with a 0..1 accuracy score, then the entity retires itself.
  onDone: (score: number) => void
}

export class Minigame extends Entity2D {
  private readonly state: PetState
  private readonly onDone: (score: number) => void
  private elapsed = 0
  private resolved = false

  constructor(options: MinigameOptions) {
    super({ zIndex: 2000 })
    this.state = options.state
    this.onDone = options.onDone
  }

  private markerCell(): number {
    // Triangle wave 0..1..0 over SWEEP_PERIOD_MS, mapped across the bar.
    const half = SWEEP_PERIOD_MS / 2
    const t = 1 - Math.abs((this.elapsed % SWEEP_PERIOD_MS) - half) / half
    return Math.round(t * (BAR_WIDTH - 1))
  }

  private scoreFor(cell: number): number {
    const center = (BAR_WIDTH - 1) / 2
    const distance = Math.abs(cell - center)
    if (distance <= SWEET_HALF) return 1 // perfect
    return clamp(1 - (distance - SWEET_HALF) / (center - SWEET_HALF), 0, 1)
  }

  private finish(score: number): void {
    if (this.resolved) return
    this.resolved = true
    this.onDone(score)
    this.markForRemoval()
  }

  // Called by the World on a confirm press while the minigame is active. Scores
  // the marker's current cell.
  resolve(): void {
    if (this.resolved) return
    this.finish(this.scoreFor(this.markerCell()))
  }

  override update(deltaMilliseconds: number): void {
    if (this.resolved) return
    this.elapsed += deltaMilliseconds
    if (this.elapsed >= DURATION_MS) this.finish(0)
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const field = fieldColor(this.state)
    const panel = panelColor(this.state)
    const ink = inkColor(this.state)
    const frame = frameColor(this.state)

    const panelW = BAR_WIDTH + 6
    const panelH = 6
    const px = Math.floor((canvas.width - panelW) / 2)
    const py = Math.floor((canvas.height - panelH) / 2)

    drawPanel(canvas, px, py, panelW, panelH, panel, frame, "block")
    canvas.drawText(px + 2, py + 1, "PLAY!  time the marker", ink, panel)

    // The bar: faint fill, a bright sweet spot in the middle, the sweeping
    // marker on top, and a centre tick below.
    const barX = px + 3
    const barY = py + 2
    const center = (BAR_WIDTH - 1) / 2
    for (let i = 0; i < BAR_WIDTH; i++) {
      const inSweet = Math.abs(i - center) <= SWEET_HALF
      canvas.setCell(barX + i, barY, inSweet ? "▓" : "░", inSweet ? ink : frame, panel)
    }
    canvas.setCell(barX + Math.round(center), barY + 1, "▼", ink, field)
    const marker = this.markerCell()
    canvas.setCell(barX + marker, barY, "◆", ink, panel)

    canvas.drawText(px + 2, py + 4, "enter to stop · miss in 1.8s", frame, panel)
  }
}
