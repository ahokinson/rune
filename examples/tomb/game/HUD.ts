import { type CanvasSurface, Color, drawPanel, Entity2D, Vector2 } from "@ahokinson/rune"
import type { Accessor } from "solid-js"

export interface HUDOptions {
  health: Accessor<number>
  ammo: Accessor<number>
  canvasWidth: number
  canvasHeight: number
}

const HUD_HEIGHT = 3
const HUD_FOREGROUND = Color.fromBytes(220, 200, 80)
const HUD_BACKGROUND = Color.fromBytes(20, 20, 20)
const HUD_DANGER = Color.fromBytes(220, 60, 60)
const HUD_FRAME = Color.fromBytes(140, 120, 50)

export class HUD extends Entity2D {
  private readonly health: Accessor<number>
  private readonly ammo: Accessor<number>
  private readonly canvasWidth: number
  private readonly canvasHeight: number

  constructor(options: HUDOptions) {
    super({
      position: new Vector2(0, options.canvasHeight - HUD_HEIGHT),
      size: new Vector2(options.canvasWidth, HUD_HEIGHT),
    })
    this.health = options.health
    this.ammo = options.ammo
    this.canvasWidth = options.canvasWidth
    this.canvasHeight = options.canvasHeight
    this.zIndex = 1000
  }

  override draw(canvas: CanvasSurface): void {
    const startRow = this.canvasHeight - HUD_HEIGHT
    canvas.fillRectangle(0, startRow, this.canvasWidth, HUD_HEIGHT, HUD_BACKGROUND)
    drawPanel(canvas, 0, startRow, this.canvasWidth, HUD_HEIGHT, HUD_BACKGROUND, HUD_FRAME, "heavy")

    const healthValue = Math.max(0, this.health())
    const ammoValue = Math.max(0, this.ammo())
    const face = this.faceFor(healthValue)

    const healthColor = healthValue <= 25 ? HUD_DANGER : HUD_FOREGROUND
    canvas.drawText(3, startRow + 1, `HP ${String(healthValue).padStart(3, " ")}`, healthColor, HUD_BACKGROUND)
    canvas.drawText(Math.floor(this.canvasWidth / 2) - 2, startRow + 1, face, HUD_FOREGROUND, HUD_BACKGROUND)
    canvas.drawText(
      this.canvasWidth - 13,
      startRow + 1,
      `AMMO ${String(ammoValue).padStart(3, " ")}`,
      HUD_FOREGROUND,
      HUD_BACKGROUND,
    )
  }

  private faceFor(health: number): string {
    if (health <= 0) return "X.X"
    if (health <= 25) return ">_<"
    if (health <= 50) return "o_o"
    if (health <= 75) return "._."
    return "^_^"
  }
}
