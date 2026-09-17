import { Vector2 } from "@ahokinson/rune"

export class CameraShake {
  readonly offset = new Vector2(0, 0)
  private amplitude = 0
  private remainingMilliseconds = 0
  private totalMilliseconds = 0

  trigger(intensity: number, durationMs: number): void {
    if (intensity * durationMs > this.amplitude * this.remainingMilliseconds) {
      this.amplitude = intensity
      this.remainingMilliseconds = durationMs
      this.totalMilliseconds = durationMs
    }
  }

  update(deltaMilliseconds: number): void {
    if (this.remainingMilliseconds <= 0) {
      this.offset.x = 0
      this.offset.y = 0
      this.amplitude = 0
      return
    }
    this.remainingMilliseconds -= deltaMilliseconds
    const decay = Math.max(0, this.remainingMilliseconds / this.totalMilliseconds)
    const current = this.amplitude * decay
    this.offset.x = (Math.random() * 2 - 1) * current
    this.offset.y = (Math.random() * 2 - 1) * current
  }
}
