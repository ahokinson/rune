import { type AnimatedSprite, Asset, data, type Sprite, terminalSpriteAnimation } from "@ahokinson/rune"

interface WeaponData {
  name: string
  cooldownMs: number
  recoilDurationMs: number
  recoilKickRows: number
  bobPeriodMs: number
  bobAmplitude: number
}

export interface WeaponConfig {
  animation: AnimatedSprite<Sprite>
  cooldownMs: number
  recoilDurationMs: number
  recoilKickRows: number
  bobPeriodMs: number
  bobAmplitude: number
}

export class WeaponAsset extends Asset {
  declare animation: AnimatedSprite<Sprite>
  declare stats: WeaponData

  static schema = {
    animation: terminalSpriteAnimation({ initial: "idle" }),
    stats: data<WeaponData>(),
  } as const

  get config(): WeaponConfig {
    return {
      animation: this.animation,
      cooldownMs: this.stats.cooldownMs,
      recoilDurationMs: this.stats.recoilDurationMs,
      recoilKickRows: this.stats.recoilKickRows,
      bobPeriodMs: this.stats.bobPeriodMs,
      bobAmplitude: this.stats.bobAmplitude,
    }
  }
}
