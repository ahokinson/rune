import { type Camera, type CanvasSurface, Entity2D, Random } from "@ahokinson/rune"
import { fieldColor, inkColor, nightness } from "./sky"
import { dayPhase, type PetState } from "./state"

interface Star {
  fx: number
  fy: number
  phase: number
}

export interface BackgroundOptions {
  state: PetState
}

// Fills the screen with a day/night sky and scatters twinkling stars after dark.
export class Background extends Entity2D {
  private readonly state: PetState
  private readonly stars: Star[] = []
  private elapsed = 0

  constructor(options: BackgroundOptions) {
    super({ zIndex: -100 })
    this.state = options.state
    const random = new Random(1337)
    for (let i = 0; i < 48; i++) {
      this.stars.push({ fx: random.float(0, 1), fy: random.float(0, 0.55), phase: random.float(0, Math.PI * 2) })
    }
  }

  override update(deltaMilliseconds: number): void {
    this.elapsed += deltaMilliseconds
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const dark = nightness(dayPhase(this.state))
    canvas.fillRectangle(0, 0, canvas.width, canvas.height, fieldColor(this.state))

    if (dark > 0.4) {
      const ink = inkColor(this.state)
      for (const star of this.stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(this.elapsed / 600 + star.phase)
        const x = Math.round(star.fx * (canvas.width - 1))
        const y = Math.round(star.fy * (canvas.height - 1))
        canvas.setCell(x, y, twinkle > 0.85 ? "✦" : "·", ink, fieldColor(this.state))
      }
    }
  }
}
