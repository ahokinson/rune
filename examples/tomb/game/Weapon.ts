import { type AnimatedSprite, type CanvasSurface, Easing, Entity2D, type Sprite, Vector2 } from "@ahokinson/rune"
import type { WeaponConfig } from "../assets/weapon"

export type WeaponState = "idle" | "fire"

export interface WeaponOptions {
  viewportWidth: number
  viewportHeight: number
  config: WeaponConfig
}

export class Weapon extends Entity2D {
  private readonly animation: AnimatedSprite<Sprite>
  private readonly viewportWidth: number
  private readonly viewportHeight: number
  private readonly config: WeaponConfig
  private playerMovementMillis = 0
  private wasMoving = false
  private recoilRemainingMs = 0
  bobAmplitude = 1

  constructor(viewportWidth: number, viewportHeight: number, config: WeaponConfig) {
    super({ position: new Vector2(0, 0), size: new Vector2(0, 0) })
    this.viewportWidth = viewportWidth
    this.viewportHeight = viewportHeight
    this.config = config
    this.animation = config.animation
    this.zIndex = 800
  }

  trigger(): void {
    this.animation.play("fire")
    this.animation.restart()
    this.recoilRemainingMs = this.config.recoilDurationMs
  }

  notifyMovement(deltaMilliseconds: number, isMoving: boolean): void {
    this.wasMoving = isMoving
    if (isMoving) this.playerMovementMillis += deltaMilliseconds
  }

  override update(deltaMilliseconds: number): void {
    this.animation.update(deltaMilliseconds)
    if (this.animation.currentClipName === "fire" && this.animation.isFinished()) {
      this.animation.play("idle")
    }
    if (this.recoilRemainingMs > 0) {
      this.recoilRemainingMs = Math.max(0, this.recoilRemainingMs - deltaMilliseconds)
    }
  }

  override draw(canvas: CanvasSurface): void {
    const sprite = this.animation.currentFrame()
    const bob = this.wasMoving
      ? Math.round(Math.sin(this.playerMovementMillis / this.config.bobPeriodMs) * this.bobAmplitude)
      : 0
    const recoilProgress = this.recoilRemainingMs / this.config.recoilDurationMs
    const recoilEase = Easing.cubicOut(Math.min(1, Math.max(0, recoilProgress)))
    const recoilOffset = Math.round(recoilEase * this.config.recoilKickRows)
    const originColumn = Math.floor(this.viewportWidth / 2 - sprite.width / 2) + bob
    const originRow = this.viewportHeight - sprite.height - 3 + recoilOffset
    for (let row = 0; row < sprite.height; row++) {
      for (let column = 0; column < sprite.width; column++) {
        const cell = sprite.cellAt(column, row)
        if (!cell || cell.transparent) continue
        const targetColumn = originColumn + column
        const targetRow = originRow + row
        if (targetColumn < 0 || targetColumn >= this.viewportWidth) continue
        if (targetRow < 0 || targetRow >= this.viewportHeight) continue
        if (cell.background) {
          canvas.setCell(targetColumn, targetRow, cell.character, cell.foreground, cell.background)
        } else {
          canvas.setCell(targetColumn, targetRow, cell.character, cell.foreground)
        }
      }
    }
  }
}
