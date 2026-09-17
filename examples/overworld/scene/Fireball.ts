import { type Camera, type CanvasSurface, Entity2D, moveAndCollide, Rectangle, Vector2 } from "@ahokinson/rune"
import * as theme from "../theme"
import type { Level } from "./Level"

const SIZE = 1
const SPEED = 30
const GRAVITY = 120
const BOUNCE = 26
const MAX_FALL = 60
const LIFETIME_MS = 2200

// Fire Mario's projectile: flies in the facing direction, bounces off the floor,
// and pops on a wall or after a short life. World checks it against enemies.
export interface FireballOptions {
  origin: Vector2
  direction: number
  level: Level
}

export class Fireball extends Entity2D {
  alive = true
  private readonly velocity: Vector2
  private readonly box: Rectangle
  private readonly level: Level
  private remaining = LIFETIME_MS

  constructor(options: FireballOptions) {
    super({ position: options.origin.clone(), size: new Vector2(SIZE, SIZE), zIndex: 12 })
    this.velocity = new Vector2(options.direction * SPEED, 0)
    this.box = new Rectangle(options.origin.x, options.origin.y, SIZE, SIZE)
    this.level = options.level
  }

  pop(): void {
    if (!this.alive) return
    this.alive = false
    this.markForRemoval()
  }

  override update(deltaMilliseconds: number): void {
    this.remaining -= deltaMilliseconds
    if (this.remaining <= 0) {
      this.pop()
      return
    }
    const deltaSeconds = deltaMilliseconds / 1000
    this.velocity.y = Math.min(this.velocity.y + GRAVITY * deltaSeconds, MAX_FALL)

    const deltaX = this.velocity.x * deltaSeconds
    const deltaY = this.velocity.y * deltaSeconds
    this.box.x = this.position.x
    this.box.y = this.position.y
    const obstacles = this.level.collidersNear(this.box, Math.abs(deltaX) + Math.abs(deltaY) + 1)
    const result = moveAndCollide(this.box, deltaX, deltaY, obstacles)
    this.position.x = this.box.x
    this.position.y = this.box.y

    if (result.hitX) {
      this.pop()
      return
    }
    if (result.grounded) this.velocity.y = -BOUNCE
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    const screen = camera.worldToScreen(this.position)
    canvas.setCell(Math.round(screen.x), Math.round(screen.y), "●", theme.FIREBALL, theme.FIREBALL_CORE)
  }
}
