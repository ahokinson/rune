import { type Camera, type CanvasSurface, Entity2D, moveAndCollide, type Particles, Rectangle, Vector2 } from "@ahokinson/rune"
import { TILE } from "../level"
import * as theme from "../theme"
import type { Level } from "./Level"
import type { Player } from "./Player"
import type { Session } from "./session"

export enum PowerUpKind {
  Mushroom = "mushroom",
  OneUp = "oneUp",
  Flower = "flower",
  Star = "star",
}

const SIZE = 2
const WALK_SPEED = 11
const STAR_SPEED = 14
const STAR_BOUNCE = 30
const GRAVITY = 92
const MAX_FALL = 64
const EMERGE_MS = 320

// An item that rises out of a bonked block, then behaves by kind: mushrooms and
// 1-Ups stroll and fall off ledges, the Fire Flower sits still, and the Starman
// bounces like a super-ball. Collected on overlap with the runner.
export interface PowerUpOptions {
  center: Vector2
  kind: PowerUpKind
  player: Player
  level: Level
  session: Session
  sparkle: Particles
}

export class PowerUp extends Entity2D {
  private readonly kind: PowerUpKind
  private readonly velocity = new Vector2(0, 0)
  private readonly box = new Rectangle(0, 0, SIZE, SIZE)
  private readonly level: Level
  private readonly player: Player
  private readonly session: Session
  private readonly sparkle: Particles
  private direction = 1
  private emerge = EMERGE_MS

  constructor(options: PowerUpOptions) {
    super({
      position: new Vector2(options.center.x - SIZE / 2, options.center.y - SIZE / 2),
      size: new Vector2(SIZE, SIZE),
      zIndex: 7,
    })
    this.kind = options.kind
    this.level = options.level
    this.player = options.player
    this.session = options.session
    this.sparkle = options.sparkle
    if (this.kind === PowerUpKind.Mushroom || this.kind === PowerUpKind.OneUp) this.velocity.x = WALK_SPEED
    else if (this.kind === PowerUpKind.Star) this.velocity.x = STAR_SPEED
  }

  override update(deltaMilliseconds: number): void {
    const deltaSeconds = deltaMilliseconds / 1000

    // Rise out of the block (one tile) before any physics or collection.
    if (this.emerge > 0) {
      this.emerge -= deltaMilliseconds
      this.position.y -= (TILE / EMERGE_MS) * deltaMilliseconds
      return
    }

    if (this.kind !== PowerUpKind.Flower) {
      this.velocity.x = this.direction * (this.kind === PowerUpKind.Star ? STAR_SPEED : WALK_SPEED)
      this.velocity.y = Math.min(this.velocity.y + GRAVITY * deltaSeconds, MAX_FALL)

      const deltaX = this.velocity.x * deltaSeconds
      const deltaY = this.velocity.y * deltaSeconds
      this.box.x = this.position.x
      this.box.y = this.position.y
      const obstacles = this.level.collidersNear(this.box, Math.abs(deltaX) + Math.abs(deltaY) + 1)
      const result = moveAndCollide(this.box, deltaX, deltaY, obstacles)
      this.position.x = this.box.x
      this.position.y = this.box.y
      if (result.hitX) this.direction = -this.direction
      if (result.grounded) this.velocity.y = this.kind === PowerUpKind.Star ? -STAR_BOUNCE : 0
    }

    if (this.player.bounds.intersects(this.bounds)) this.collect()
  }

  private collect(): void {
    switch (this.kind) {
      case PowerUpKind.Mushroom:
        this.player.grow()
        break
      case PowerUpKind.Flower:
        this.player.toFire()
        break
      case PowerUpKind.OneUp:
        this.session.lives++
        break
      case PowerUpKind.Star:
        this.player.startStar()
        break
    }
    this.session.score += 1000
    this.sparkle.origin = new Vector2(this.position.x + SIZE / 2, this.position.y + SIZE / 2)
    this.sparkle.emit(14)
    this.markForRemoval()
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    const screen = camera.worldToScreen(this.position)
    const x = Math.round(screen.x)
    const y = Math.round(screen.y)
    switch (this.kind) {
      case PowerUpKind.Mushroom:
        canvas.setCell(x, y, "█", theme.MUSHROOM_CAP)
        canvas.setCell(x + 1, y, "█", theme.MUSHROOM_SPOT)
        canvas.setCell(x, y + 1, "█", theme.MUSHROOM_STEM)
        canvas.setCell(x + 1, y + 1, "█", theme.MUSHROOM_STEM)
        break
      case PowerUpKind.OneUp:
        canvas.setCell(x, y, "█", theme.ONE_UP_CAP)
        canvas.setCell(x + 1, y, "█", theme.MUSHROOM_SPOT)
        canvas.setCell(x, y + 1, "█", theme.MUSHROOM_STEM)
        canvas.setCell(x + 1, y + 1, "█", theme.MUSHROOM_STEM)
        break
      case PowerUpKind.Flower:
        canvas.setCell(x, y, "█", theme.FLOWER_PETAL)
        canvas.setCell(x + 1, y, "█", theme.FLOWER_CORE)
        canvas.setCell(x, y + 1, "█", theme.FLOWER_STEM)
        canvas.setCell(x + 1, y + 1, "█", theme.FLOWER_STEM)
        break
      case PowerUpKind.Star: {
        canvas.setCell(x, y, "★", theme.STAR)
        canvas.setCell(x + 1, y, "✦", theme.STAR_DIM)
        canvas.setCell(x, y + 1, "✦", theme.STAR_DIM)
        canvas.setCell(x + 1, y + 1, "★", theme.STAR)
        break
      }
    }
  }
}
