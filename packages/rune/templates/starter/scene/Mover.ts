import { type ActionSnapshot, type Camera, type CanvasSurface, Color, clamp, Entity2D, Vector2 } from "@ahokinson/rune"
import type { MoveAction } from "../actions"

export interface MoverOptions {
  position: Vector2
  controls: ActionSnapshot<MoveAction>
  area: Vector2
}

// A player-controlled glyph: the smallest complete game object. It extends the
// Entity2D primitive, reads input in update(), and paints itself in draw().
// Replace this with your own entities as the game grows.
export class Mover extends Entity2D {
  private readonly controls: ActionSnapshot<MoveAction>
  private readonly area: Vector2
  private readonly speed = 18 // cells per second

  constructor(options: MoverOptions) {
    super({ position: options.position, size: new Vector2(1, 1), zIndex: 10 })
    this.controls = options.controls
    this.area = options.area
  }

  override update(deltaMilliseconds: number): void {
    const deltaSeconds = deltaMilliseconds / 1000
    const dx = (this.controls.isDown("right") ? 1 : 0) - (this.controls.isDown("left") ? 1 : 0)
    const dy = (this.controls.isDown("down") ? 1 : 0) - (this.controls.isDown("up") ? 1 : 0)
    this.position.x = clamp(this.position.x + dx * this.speed * deltaSeconds, 0, this.area.x - 1)
    this.position.y = clamp(this.position.y + dy * this.speed * deltaSeconds, 0, this.area.y - 1)
  }

  override draw(canvas: CanvasSurface, camera: Camera): void {
    const screen = camera.worldToScreen(this.position)
    canvas.setCell(Math.round(screen.x), Math.round(screen.y), "◍", Color.fromHex("#7dd3fc"))
  }
}
