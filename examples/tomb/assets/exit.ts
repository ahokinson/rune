import { type AnimatedSprite, Asset, type PixelSprite, pixelSpriteAnimation } from "@ahokinson/rune"

export interface ExitConfig {
  animation: AnimatedSprite<PixelSprite>
}

export class ExitAsset extends Asset {
  declare animation: AnimatedSprite<PixelSprite>

  static schema = {
    animation: pixelSpriteAnimation({ initial: "pulse" }),
  } as const

  get config(): ExitConfig {
    return { animation: this.animation }
  }
}
