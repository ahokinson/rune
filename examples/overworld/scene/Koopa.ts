import {
  AnimatedSpriteEntity,
  type Camera,
  type CanvasSurface,
  drawSprite,
  moveAndCollide,
  playClipForState,
  Rectangle,
  StateMachine,
  Vector2,
} from "@ahokinson/rune"
import { HEIGHT_CELLS } from "../level"
import { buildKoopaSprite } from "../sprites"
import type { Level } from "./Level"
import type { Mob } from "./mob"

const WIDTH = 3
const HEIGHT = 4
const WALK_SPEED = 5
const SLIDE_SPEED = 34
const GRAVITY = 92
const MAX_FALL = 64

export type KoopaState = "walk" | "shell" | "slide"

// A green Koopa Troopa: walks like a goomba until stomped, when it retracts into
// a shell. Stomping or bumping the resting shell kicks it into a fast slide that
// mows down other enemies (handled in World) and ricochets off walls. A sliding
// shell hurts the runner on contact; stomping it stops it again.
export interface KoopaOptions {
  spawnFoot: Vector2
  level: Level
}

export class Koopa extends AnimatedSpriteEntity implements Mob {
  alive = true
  // The walk/shell/slide lifecycle is a StateMachine; playClipForState() keeps the
  // sprite clip in lockstep with it (walk loop vs. the shared shell frame), so the
  // transition methods never touch the animation directly.
  private readonly ai: StateMachine<KoopaState>
  private readonly velocity = new Vector2(0, 0)
  private readonly box = new Rectangle(0, 0, WIDTH, HEIGHT)
  private direction = -1
  private flipping = false
  private readonly level: Level

  constructor(options: KoopaOptions) {
    super({
      animation: buildKoopaSprite(),
      position: new Vector2(options.spawnFoot.x - WIDTH / 2, options.spawnFoot.y - HEIGHT),
      size: new Vector2(WIDTH, HEIGHT),
      zIndex: 8,
    })
    this.level = options.level
    this.ai = new StateMachine<KoopaState>()
      .addState("walk")
      .addState("shell", { onEnter: () => this.velocity.set(0, this.velocity.y) })
      .addState("slide")
    this.ai.transitionTo("walk")
  }

  get state(): KoopaState {
    return this.ai.current ?? "walk"
  }

  becomeShell(): void {
    this.ai.transitionTo("shell")
  }

  kick(direction: number): void {
    this.direction = direction
    this.ai.transitionTo("slide")
  }

  stopShell(): void {
    this.ai.transitionTo("shell")
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
      this.velocity.y = Math.min(this.velocity.y + GRAVITY * deltaSeconds, MAX_FALL)
      this.position.x += this.velocity.x * deltaSeconds
      this.position.y += this.velocity.y * deltaSeconds
      if (this.position.y > HEIGHT_CELLS + 4) this.markForRemoval()
      return
    }

    if (this.state === "walk") this.velocity.x = this.direction * WALK_SPEED
    else if (this.state === "slide") this.velocity.x = this.direction * SLIDE_SPEED
    else this.velocity.x = 0
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

    if (result.hitX) {
      // Walls turn a walker and ricochet a sliding shell.
      this.direction = -this.direction
    } else if (this.state === "walk" && result.grounded && !this.groundAhead()) {
      this.direction = -this.direction
    }

    playClipForState(this.ai, this.animation, { walk: "walk", shell: "shell", slide: "shell" })
    this.animation.update(deltaMilliseconds)
  }

  private groundAhead(): boolean {
    const aheadX = this.direction < 0 ? this.position.x - 1 : this.position.x + WIDTH + 1
    const probe = new Rectangle(aheadX, this.position.y + HEIGHT + 0.5, 1, 1)
    return this.level.collidersNear(probe, 0).length > 0
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    const frame = this.animation.currentFrame()
    // The retracted shell is shorter than the walking body; anchor it to the
    // bottom of the box so it rests flush on the ground.
    const offsetY = this.state === "walk" || this.flipping ? 0 : HEIGHT - frame.height
    drawSprite(canvas, frame, this.position.x, this.position.y + offsetY, camera)
  }
}
