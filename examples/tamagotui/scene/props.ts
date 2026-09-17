import { type Camera, type CanvasSurface, drawPixelSprite, Entity2D, PixelSprite } from "@ahokinson/rune"
import * as theme from "../theme"

// Floor-level props the pet's autonomous AI heads for: a food bowl, a bed to
// sleep in, and a toy to play with. Each sits at a fixed offset from centre so
// the StateMachine has concrete targets to seek. Drawn at the same ground line
// as the droppings so the whole scene shares one floor.
export enum PropKind {
  Bowl = "bowl",
  Bed = "bed",
  Toy = "toy",
}

const GROUND_FRACTION = 0.58

const BOWL = PixelSprite.fromString(
  `
.wwww.
wbbbbw
wbbbbw
.dddd.`,
  { w: theme.SHELL, b: theme.BELLY, d: theme.BODY_DARK, ".": null, " ": null },
)

const BED = PixelSprite.fromString(
  `
.wwwwwww.
wbbbbbbbw
wbbbbbbbw
.ddddddd.`,
  { w: theme.SHELL, b: theme.BELLY, d: theme.BODY_DARK, ".": null, " ": null },
)

const TOY = PixelSprite.fromString(
  `
.ww.
wwww
wwww
.dd.`,
  { w: theme.CHEEK, d: theme.BODY_DARK, ".": null, " ": null },
)

const SPRITES: Record<PropKind, PixelSprite> = {
  [PropKind.Bowl]: BOWL,
  [PropKind.Bed]: BED,
  [PropKind.Toy]: TOY,
}

export interface PropOptions {
  kind: PropKind
  offsetCells: number
}

export class Prop extends Entity2D {
  readonly kind: PropKind
  readonly offsetCells: number

  constructor(options: PropOptions) {
    super({ zIndex: 5 })
    this.kind = options.kind
    this.offsetCells = options.offsetCells
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const sprite = SPRITES[this.kind]
    const x = Math.round(canvas.width / 2 + this.offsetCells - sprite.width / 2)
    const y = Math.round(canvas.height * GROUND_FRACTION)
    drawPixelSprite(canvas, sprite, x, y)
  }
}
