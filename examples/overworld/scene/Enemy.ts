import {
  AnimatedSpriteEntity,
  type Camera,
  type CanvasSurface,
  drawSprite,
  moveAndCollide,
  Rectangle,
  Vector2,
} from "@ahokinson/rune"
import { HEIGHT_CELLS } from "../level"
import { buildGoombaSprite } from "../sprites"
import { GOOMBA_BODY } from "../theme"
import type { Level } from "./Level"
import type { Mob } from "./mob"

const WIDTH = 3
const HEIGHT = 3
const SPEED = 6
const GRAVITY = 92
const MAX_FALL = 64
const SQUASH_MS = 260

// A goomba: paces back and forth, turning at walls and ledges, falling under
// gravity, and resolving against terrain with the same swept-AABB helper the
// runner uses. Stomping flattens it briefly; a fireball, a kicked shell, or a
// star-invincible runner flips it off the screen instead.
export interface EnemyOptions {
  spawnFoot: Vector2
  level: Level
}

export class Enemy extends AnimatedSpriteEntity implements Mob {
  alive = true
  private readonly velocity = new Vector2(0, 0)
  private readonly box = new Rectangle(0, 0, WIDTH, HEIGHT)
  private direction = -1
  private squashRemaining = 0
  private flipping = false
  private readonly level: Level

  constructor(options: EnemyOptions) {
    super({
      animation: buildGoombaSprite(),
      position: new Vector2(options.spawnFoot.x - WIDTH / 2, options.spawnFoot.y - HEIGHT),
      size: new Vector2(WIDTH, HEIGHT),
      zIndex: 8,
    })
    this.level = options.level
  }

  stomp(): void {
    if (!this.alive) return
    this.alive = false
    this.squashRemaining = SQUASH_MS
  }

  kill(direction: number): void {
    if (!this.alive) return
    this.alive = false
    this.flipping = true
    this.velocity.set(direction * 10, -30)
  }

  override update(deltaMilliseconds: number): void {
    const deltaSeconds = deltaMilliseconds / 1000

    if (!this.alive) {
      if (this.flipping) {
        this.velocity.y = Math.min(this.velocity.y + GRAVITY * deltaSeconds, MAX_FALL)
        this.position.x += this.velocity.x * deltaSeconds
        this.position.y += this.velocity.y * deltaSeconds
        if (this.position.y > HEIGHT_CELLS + 4) this.markForRemoval()
      } else {
        this.squashRemaining -= deltaMilliseconds
        if (this.squashRemaining <= 0) this.markForRemoval()
      }
      return
    }

    this.velocity.x = this.direction * SPEED
    this.velocity.y = Math.min(this.velocity.y + GRAVITY * deltaSeconds, MAX_FALL)

    const deltaX = this.velocity.x * deltaSeconds
    const deltaY = this.velocity.y * deltaSeconds
    this.box.x = this.position.x
    this.box.y = this.position.y
    const obstacles = this.level.collidersNear(this.box, Math.abs(deltaX) + Math.abs(deltaY) + 1)
    const result = moveAndCollide(this.box, deltaX, deltaY, obstacles)
    this.position.x = this.box.x
    this.position.y = this.box.y
    if (result.grounded) this.velocity.y = 0

    // Turn around at a wall, or at the lip of a ledge so it never walks off.
    if (result.hitX) {
      this.direction = -this.direction
    } else if (result.grounded && !this.groundAhead()) {
      this.direction = -this.direction
    }

    this.animation.update(deltaMilliseconds)
  }

  private groundAhead(): boolean {
    const aheadX = this.direction < 0 ? this.position.x - 1 : this.position.x + WIDTH + 1
    const probe = new Rectangle(aheadX, this.position.y + HEIGHT + 0.5, 1, 1)
    return this.level.collidersNear(probe, 0).length > 0
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    if (this.alive || this.flipping) {
      drawSprite(canvas, this.animation.currentFrame(), this.position.x, this.position.y, camera)
      return
    }
    // Squashed: a flat slab on the ground for the last moments before removal.
    const screen = camera.worldToScreen(new Vector2(this.position.x, this.position.y + HEIGHT - 1))
    const x = Math.round(screen.x)
    const y = Math.round(screen.y)
    for (let column = 0; column < WIDTH; column++) canvas.setCell(x + column, y, "▄", GOOMBA_BODY)
  }
}
