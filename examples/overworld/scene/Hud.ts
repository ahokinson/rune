import { Anchor, type Camera, type CanvasSurface, Entity2D, FramesPerSecondCounter, resolveAnchor } from "@ahokinson/rune"
import * as theme from "../theme"
import type { Session } from "./session"

export interface HudOptions {
  session: Session
}

// Screen-space overlay (ignores the camera): the Super Mario Bros. status bar —
// score, coins, world, and a countdown timer — a control hint, and centered
// banners when the course is cleared or all lives are spent.
export class Hud extends Entity2D {
  private readonly fps = new FramesPerSecondCounter()
  private lastDrawMs = performance.now()
  private readonly session: Session

  constructor(options: HudOptions) {
    super({ zIndex: 1000 })
    this.session = options.session
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const now = performance.now()
    this.fps.record(now - this.lastDrawMs)
    this.lastDrawMs = now

    const score = `MARIO ${this.session.score.toString().padStart(6, "0")}`
    canvas.drawText(2, 1, ` ${score} `, theme.HUD_TEXT, theme.HUD_SHADOW)
    const coins = `◉×${this.session.coins.toString().padStart(2, "0")}`
    canvas.drawText(2, 2, ` ${coins}  ×${this.session.lives} `, theme.COIN, theme.HUD_SHADOW)

    const world = `WORLD ${this.session.world}`
    const worldX = Math.floor((canvas.width - world.length) / 2)
    canvas.drawText(worldX, 1, world, theme.HUD_TEXT, theme.HUD_SHADOW)
    const time = `TIME ${Math.max(0, Math.ceil(this.session.time)).toString().padStart(3, "0")}`
    canvas.drawText(worldX + 1, 2, time, theme.HUD_DIM, theme.HUD_SHADOW)

    const fps = ` ${this.fps.value.toFixed(0)} fps `
    canvas.drawText(canvas.width - fps.length - 1, 1, fps, theme.HUD_DIM, theme.HUD_SHADOW)

    const hint = " WASD/←↑→ move+jump   x fire   esc quit "
    canvas.drawText(2, canvas.height - 2, hint, theme.HUD_DIM, theme.HUD_SHADOW)

    if (this.session.gameOver) this.banner(canvas, "  GAME OVER  ")
    else if (this.session.won) this.banner(canvas, "  ★  COURSE CLEAR!  ★  ")
  }

  private banner(canvas: CanvasSurface, text: string): void {
    // Flat SMB banner — anchored centre instead of hand-rolled centering math.
    const rect = resolveAnchor(canvas.width, canvas.height, { anchor: Anchor.Center, width: text.length, height: 1 })
    canvas.drawText(rect.x, rect.y, text, theme.HUD_TEXT, theme.HUD_SHADOW)
  }
}
