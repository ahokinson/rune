import { type Camera, type CanvasSurface, Easing, Entity2D, type Particles, Tween, Vector2 } from "@ahokinson/rune"
import { COIN, COIN_SHADE } from "../theme"
import { PLAYER_LAYER } from "./layers"
import type { Session } from "./session"

export interface CoinOptions {
  center: Vector2
  sparkle: Particles
  session: Session
}

// A free-floating coin. Bobs on a looping yoyo tween and is collected when the
// runner overlaps it, popping a little sparkle and bumping the coin count. The
// overlap is dispatched by the engine's detectCollisions() pass (see World): the
// coin's bounds are the generous 3×3 pickup reach and it carries a PLAYER mask, so
// it collects itself in onCollide() instead of polling the player every frame.
export class Coin extends Entity2D {
  private readonly bob = new Tween({
    from: -0.6,
    to: 0.6,
    durationMilliseconds: 700,
    loop: true,
    yoyo: true,
    easing: Easing.sineInOut,
  })
  private readonly center: Vector2
  private readonly sparkle: Particles
  private readonly session: Session
  private collected = false

  constructor(options: CoinOptions) {
    super({
      position: new Vector2(options.center.x - 1.5, options.center.y - 1.5),
      size: new Vector2(3, 3),
      zIndex: 6,
      collisionMask: PLAYER_LAYER,
    })
    this.center = options.center.clone()
    this.sparkle = options.sparkle
    this.session = options.session
    this.bob.start()
  }

  override update(deltaMilliseconds: number): void {
    this.bob.advance(deltaMilliseconds)
  }

  override onCollide(): void {
    if (this.collected) return
    this.collected = true
    this.session.coins++
    this.session.score += 200
    this.sparkle.origin = this.center.clone()
    this.sparkle.emit(12)
    this.markForRemoval()
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    const screen = camera.worldToScreen(new Vector2(this.center.x, this.center.y + this.bob.value))
    const x = Math.round(screen.x)
    const y = Math.round(screen.y)
    canvas.setCell(x, y, "◉", COIN)
    canvas.setCell(x, y + 1, "▀", COIN_SHADE)
  }
}
