import { Asset, data, type PixelSprite, pixelSprite } from "@ahokinson/rune"

interface PickupData {
  kind: "health" | "ammo"
  amount: number
  scale?: number
  collisionSize?: [number, number]
  bobAmplitude?: number
  bobFrequency?: number
}

export interface PickupConfig {
  kind: "health" | "ammo"
  amount: number
  scale: number
  collisionSize: [number, number]
  bobAmplitude: number
  bobFrequency: number
  sprite: PixelSprite
}

export class PickupAsset extends Asset {
  declare sprite: PixelSprite
  declare stats: PickupData

  static schema = {
    sprite: pixelSprite,
    stats: data<PickupData>(),
  } as const

  get config(): PickupConfig {
    return {
      kind: this.stats.kind,
      amount: this.stats.amount,
      scale: this.stats.scale ?? 0.5,
      collisionSize: this.stats.collisionSize ?? [0.6, 0.6],
      bobAmplitude: this.stats.bobAmplitude ?? 1.2,
      bobFrequency: this.stats.bobFrequency ?? 0.004,
      sprite: this.sprite,
    }
  }
}
