import {
  type ActionSnapshot,
  AnimatedSpriteEntity,
  type Camera,
  type CanvasSurface,
  drawSprite,
  KinematicBody2D,
  type Particles,
  Rectangle,
  Vector2,
} from "@ahokinson/rune"
import type { RunAction } from "../actions"
import { type BlockContent, CASTLE_COLUMN, TILE } from "../level"
import { buildMarioSprite } from "../sprites"
import { Koopa } from "./Koopa"
import type { Level } from "./Level"
import { PLAYER_LAYER } from "./layers"
import type { Mob } from "./mob"
import type { Session } from "./session"

const WIDTH = 3
const SMALL_HEIGHT = 4
const BIG_HEIGHT = 6

// Horizontal feel (cells / second).
const WALK_ACCEL = 110
const FRICTION = 140
const MAX_WALK = 17
// Vertical feel.
const GRAVITY = 92
const JUMP_VELOCITY = 42
const MAX_FALL = 64
const STOMP_BOUNCE = 24
// Jump forgiveness (milliseconds).
const JUMP_BUFFER_MS = 120
const COYOTE_MS = 90
// Power timers.
const STAR_MS = 9000
const IFRAME_MS = 1200

export enum PowerState {
  Small = "small",
  Big = "big",
  Fire = "fire",
}

export interface PlayerEffects {
  sparkle: Particles
  shatter: Particles
  puff: Particles
}

// The runner. Reads the action snapshot for movement, integrates simple platformer
// physics, resolves against terrain with swept-AABB collision, and now carries a
// power state (small/big/fire) that drives its size, brick-breaking, fireballs,
// and how it survives a hit.
export interface PlayerOptions {
  spawnFoot: Vector2
  controls: ActionSnapshot<RunAction>
  level: Level
  mobs: Mob[]
  effects: PlayerEffects
  session: Session
  spawnFireball: (origin: Vector2, direction: number) => void
  spawnItem: (content: BlockContent, x: number, y: number) => void
}

export class Player extends AnimatedSpriteEntity {
  power = PowerState.Small
  private bodyHeight = SMALL_HEIGHT
  private readonly box = new Rectangle(0, 0, WIDTH, SMALL_HEIGHT)
  // Platformer movement (gravity, friction, coyote-time + buffered jump, swept
  // collision) lives in the engine's KinematicBody2D; this entity just feeds it
  // input each step and reacts to the result.
  private readonly body = new KinematicBody2D({
    gravity: GRAVITY,
    maxFall: MAX_FALL,
    walkAccel: WALK_ACCEL,
    friction: FRICTION,
    maxWalk: MAX_WALK,
    jumpVelocity: JUMP_VELOCITY,
    coyoteMilliseconds: COYOTE_MS,
    jumpBufferMilliseconds: JUMP_BUFFER_MS,
  })
  private facing = 1
  private starRemaining = 0
  private iframeRemaining = 0
  private blink = 0
  private readonly spawnFoot: Vector2
  private readonly controls: ActionSnapshot<RunAction>
  private readonly level: Level
  private readonly mobs: Mob[]
  private readonly effects: PlayerEffects
  private readonly session: Session
  private readonly spawnFireball: (origin: Vector2, direction: number) => void
  private readonly spawnItem: (content: BlockContent, x: number, y: number) => void

  constructor(options: PlayerOptions) {
    super({
      animation: buildMarioSprite(),
      position: new Vector2(options.spawnFoot.x - WIDTH / 2, options.spawnFoot.y - SMALL_HEIGHT),
      size: new Vector2(WIDTH, SMALL_HEIGHT),
      zIndex: 10,
      collisionLayer: PLAYER_LAYER,
    })
    this.spawnFoot = options.spawnFoot.clone()
    this.controls = options.controls
    this.level = options.level
    this.mobs = options.mobs
    this.effects = options.effects
    this.session = options.session
    this.spawnFireball = options.spawnFireball
    this.spawnItem = options.spawnItem
  }

  private get invincible(): boolean {
    return this.starRemaining > 0 || this.iframeRemaining > 0
  }

  grow(): void {
    if (this.power === PowerState.Small) this.setPower(PowerState.Big)
    this.session.score += 1000
  }

  toFire(): void {
    this.setPower(PowerState.Fire)
  }

  startStar(): void {
    this.starRemaining = STAR_MS
  }

  // Forced loss (a timer running out): straight to the death path.
  defeat(): void {
    if (!this.session.gameOver && !this.session.won) this.die()
  }

  override update(deltaMilliseconds: number): void {
    if (this.session.gameOver) {
      this.body.velocity.set(0, 0)
      this.updateAnimation(deltaMilliseconds)
      return
    }
    const deltaSeconds = deltaMilliseconds / 1000
    this.starRemaining = Math.max(0, this.starRemaining - deltaMilliseconds)
    this.iframeRemaining = Math.max(0, this.iframeRemaining - deltaMilliseconds)
    this.blink += deltaMilliseconds

    // Once the flag is touched the runner strides into the castle on its own.
    const won = this.session.won
    const input = won
      ? this.position.x + WIDTH / 2 < CASTLE_COLUMN * TILE
        ? 1
        : 0
      : (this.controls.isDown("right") ? 1 : 0) - (this.controls.isDown("left") ? 1 : 0)
    if (input !== 0) this.facing = input
    const jump = !won && this.controls.wasPressed("jump")

    if (!won && this.power === PowerState.Fire && this.controls.wasPressed("fire")) {
      this.spawnFireball(new Vector2(this.position.x + WIDTH / 2, this.position.y + 1), this.facing)
    }

    this.box.x = this.position.x
    this.box.y = this.position.y
    this.box.height = this.bodyHeight
    const reach = (Math.abs(this.body.velocity.x) + Math.abs(this.body.velocity.y)) * deltaSeconds + 2
    const obstacles = this.level.collidersNear(this.box, reach)
    const result = this.body.step(this.box, { move: input, jump }, deltaMilliseconds, obstacles)
    this.position.x = this.box.x
    this.position.y = this.box.y

    if (result.ceiling) {
      this.resolveBump(result.ceiling)
    } else if (this.body.velocity.y < 0) {
      this.checkHiddenBlock()
    }

    if (!won) this.handleEnemies()
    this.handleBounds()
    this.updateAnimation(deltaMilliseconds)

    if (!won && this.position.x + WIDTH / 2 >= this.level.markers.goalX) this.session.won = true
  }

  private resolveBump(tile: Rectangle): void {
    const result = this.level.bumpAt(tile, this.power !== PowerState.Small)
    if (result.effect === "coin") {
      this.session.coins++
      this.session.score += 200
      this.effects.sparkle.origin = new Vector2(result.x, result.y - 1)
      this.effects.sparkle.emit(12)
    } else if (result.effect === "shatter") {
      this.session.score += 50
      this.effects.shatter.origin = new Vector2(result.x, result.y)
      this.effects.shatter.emit(14)
    }
    if (result.spawn !== null) this.spawnItem(result.spawn, result.x, result.y)
  }

  // Rising through the invisible 1-Up block activates it from below.
  private checkHiddenBlock(): void {
    const centerX = this.position.x + WIDTH / 2
    if (this.level.cellAt(centerX, this.position.y) === "hidden") {
      const column = Math.floor(centerX / TILE)
      const row = Math.floor(this.position.y / TILE)
      this.resolveBump(new Rectangle(column * TILE, row * TILE, TILE, TILE))
    }
  }

  private handleEnemies(): void {
    const me = this.bounds
    for (const mob of this.mobs) {
      if (!mob.alive) continue
      const other = mob.bounds
      if (!me.intersects(other)) continue
      const stomping = this.body.velocity.y > 0 && this.position.y + this.bodyHeight - other.y < this.bodyHeight * 0.6
      const pushDir = me.x + me.width / 2 < other.x + other.width / 2 ? 1 : -1
      if (mob instanceof Koopa) {
        this.hitKoopa(mob, stomping, pushDir)
      } else if (stomping) {
        mob.kill(0)
        this.bounceOff(other)
        this.session.score += 100
      } else if (this.starRemaining > 0) {
        mob.kill(pushDir)
        this.session.score += 100
      } else if (this.iframeRemaining <= 0) {
        this.hit()
      }
    }
  }

  private hitKoopa(koopa: Koopa, stomping: boolean, pushDir: number): void {
    if (stomping) {
      if (koopa.state === "walk") koopa.becomeShell()
      else if (koopa.state === "shell") koopa.kick(pushDir)
      else koopa.stopShell()
      this.bounceOff(koopa.bounds)
      this.session.score += 100
      return
    }
    if (this.starRemaining > 0) {
      koopa.kill(pushDir)
    } else if (koopa.state === "shell") {
      koopa.kick(pushDir)
    } else if (this.iframeRemaining <= 0) {
      this.hit()
    }
  }

  private bounceOff(other: Rectangle): void {
    this.body.velocity.y = -STOMP_BOUNCE
    this.effects.puff.origin = new Vector2(other.x + other.width / 2, other.y)
    this.effects.puff.emit(10)
  }

  private hit(): void {
    if (this.invincible) return
    if (this.power === PowerState.Fire) this.setPower(PowerState.Big)
    else if (this.power === PowerState.Big) this.setPower(PowerState.Small)
    else {
      this.die()
      return
    }
    this.iframeRemaining = IFRAME_MS
  }

  private die(): void {
    this.session.lives--
    if (this.session.lives <= 0) {
      this.session.gameOver = true
      return
    }
    this.resetTo(PowerState.Small)
    this.position.set(this.spawnFoot.x - WIDTH / 2, this.spawnFoot.y - SMALL_HEIGHT)
    this.body.velocity.set(0, 0)
    this.iframeRemaining = IFRAME_MS
  }

  // Resize around the feet so growing/shrinking keeps the runner on the ground.
  private setPower(power: PowerState): void {
    const newHeight = power === PowerState.Small ? SMALL_HEIGHT : BIG_HEIGHT
    const foot = this.position.y + this.bodyHeight
    this.position.y = foot - newHeight
    this.applyHeight(power, newHeight)
  }

  private resetTo(power: PowerState): void {
    this.applyHeight(power, power === PowerState.Small ? SMALL_HEIGHT : BIG_HEIGHT)
  }

  private applyHeight(power: PowerState, height: number): void {
    this.power = power
    this.bodyHeight = height
    this.box.height = height
    this.size.y = height
  }

  // Keep the runner inside the course; falling into a pit is a death.
  private handleBounds(): void {
    if (this.position.x < 0) {
      this.position.x = 0
      this.body.velocity.x = 0
    }
    if (this.position.y > this.spawnFoot.y + 24) this.die()
  }

  private updateAnimation(deltaMilliseconds: number): void {
    const motion = !this.body.grounded ? "jump" : Math.abs(this.body.velocity.x) > 1 ? "run" : "idle"
    this.animation.play(`${this.power}-${motion}`)
    this.animation.update(deltaMilliseconds)
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    // Flash while invincible (post-hit i-frames or a Starman): skip every other
    // short interval so the runner blinks.
    if (this.invincible && Math.floor(this.blink / 70) % 2 === 0) return
    drawSprite(canvas, this.animation.currentFrame(), this.position.x, this.position.y, camera)
  }
}
