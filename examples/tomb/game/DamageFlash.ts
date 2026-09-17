import { type CanvasSurface, CollisionLayer, Color, Entity2D, Vector2 } from "@ahokinson/rune"
import type { Accessor } from "solid-js"

export interface DamageFlashOptions {
  canvasWidth: number
  canvasHeight: number
  hudHeight: number
  health: Accessor<number>
  lowHealthThreshold?: number
}

const FLASH_COLOR = { r: 220, g: 30, b: 30 }
const LOW_HEALTH_CAP = 0.45

export class DamageFlash extends Entity2D {
  private readonly canvasWidth: number
  private readonly canvasHeight: number
  private readonly hudHeight: number
  private readonly health: Accessor<number>
  private readonly lowHealthThreshold: number
  private flashRemainingMs = 0
  private flashDurationMs = 0
  private flashAmplitude = 0

  constructor(options: DamageFlashOptions) {
    // Zero-size bounds + none layer so this UI overlay is never picked up by
    // TriggerVolume overlap checks (it would otherwise cover every trigger
    // on the playfield).
    super({ position: new Vector2(0, 0), size: new Vector2(0, 0) })
    this.canvasWidth = options.canvasWidth
    this.canvasHeight = options.canvasHeight
    this.hudHeight = options.hudHeight
    this.health = options.health
    this.lowHealthThreshold = options.lowHealthThreshold ?? 25
    this.zIndex = 800
    this.collisionLayer = CollisionLayer.none
  }

  trigger(intensity: number, durationMs: number): void {
    const remainingEnergy = this.flashAmplitude * this.flashRemainingMs
    if (intensity * durationMs <= remainingEnergy) return
    this.flashAmplitude = Math.min(1, intensity)
    this.flashDurationMs = durationMs
    this.flashRemainingMs = durationMs
  }

  override update(deltaMilliseconds: number): void {
    if (this.flashRemainingMs <= 0) return
    this.flashRemainingMs -= deltaMilliseconds
    if (this.flashRemainingMs <= 0) {
      this.flashRemainingMs = 0
      this.flashAmplitude = 0
    }
  }

  override draw(canvas: CanvasSurface): void {
    const flashIntensity =
      this.flashRemainingMs > 0 && this.flashDurationMs > 0
        ? this.flashAmplitude * (this.flashRemainingMs / this.flashDurationMs)
        : 0
    const healthValue = Math.max(0, this.health())
    const lowHealthIntensity =
      healthValue < this.lowHealthThreshold
        ? ((this.lowHealthThreshold - healthValue) / this.lowHealthThreshold) * LOW_HEALTH_CAP
        : 0
    const total = Math.min(1, flashIntensity + lowHealthIntensity)
    if (total <= 0) return

    const tint = Color.fromBytes(
      Math.floor(FLASH_COLOR.r * total),
      Math.floor(FLASH_COLOR.g * total),
      Math.floor(FLASH_COLOR.b * total),
    )
    const bandWidth = total > 0.5 ? 2 : 1
    const playFieldHeight = Math.max(0, this.canvasHeight - this.hudHeight)
    if (playFieldHeight <= 0) return

    canvas.fillRectangle(0, 0, this.canvasWidth, bandWidth, tint)
    canvas.fillRectangle(0, 0, bandWidth, playFieldHeight, tint)
    canvas.fillRectangle(this.canvasWidth - bandWidth, 0, bandWidth, playFieldHeight, tint)
  }
}
