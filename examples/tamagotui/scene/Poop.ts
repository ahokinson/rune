import { type Camera, type CanvasSurface, drawPixelSprite, Entity2D, PixelSprite } from "@ahokinson/rune"
import * as theme from "../theme"

const PILE = PixelSprite.fromString(
  `
..oo..
.oooo.
oooooo
.dddd.`,
  { o: theme.POOP, d: theme.POOP_DARK, ".": null },
)

const GROUND_FRACTION = 0.58

export interface PoopOptions {
  // Cells left/right of centre, so piles spread across the floor.
  offsetCells: number
}

// A pile that drains hygiene until the pet is cleaned. Removed via markForRemoval.
export class Poop extends Entity2D {
  private readonly offsetCells: number

  constructor(options: PoopOptions) {
    super({ zIndex: 8 })
    this.offsetCells = options.offsetCells
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const x = Math.round(canvas.width / 2 + this.offsetCells)
    const y = Math.round(canvas.height * GROUND_FRACTION)
    drawPixelSprite(canvas, PILE, x, y)
  }
}
