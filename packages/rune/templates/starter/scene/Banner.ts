import { type Camera, type CanvasSurface, Color, Entity2D } from "@ahokinson/rune"

// A static HUD entity drawn in screen space (it ignores the camera). Shows the
// title and controls so a freshly scaffolded game has something to say.
export class Banner extends Entity2D {
  constructor() {
    super({ zIndex: 0 })
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const title = "rune starter"
    canvas.drawText(Math.max(0, ((canvas.width - title.length) / 2) | 0), 1, title, Color.fromHex("#e2e8f0"))
    const hint = "move: arrows / WASD   quit: ctrl-c"
    canvas.drawText(
      Math.max(0, ((canvas.width - hint.length) / 2) | 0),
      canvas.height - 2,
      hint,
      Color.fromHex("#64748b"),
    )
  }
}
