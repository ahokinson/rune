import { type AnimatedSprite, Asset, data, type PixelSprite, pixelSpriteAnimation } from "@ahokinson/rune"

export interface DecorationLight {
  color: [number, number, number]
  radius: number
  intensity?: number
}

interface DecorationData {
  name: string
  scale?: number
  bobAmplitude?: number
  bobFrequency?: number
  initialClip?: string
  wallMounted?: boolean
  mountHeight?: number
  solid?: boolean
  radius?: number
  light?: DecorationLight
}

export interface DecorationConfig {
  name: string
  scale: number
  bobAmplitude: number
  bobFrequency: number
  wallMounted: boolean
  mountHeight: number
  solid: boolean
  radius: number
  light: DecorationLight | null
  animation: AnimatedSprite<PixelSprite>
}

export class DecorationAsset extends Asset {
  declare animation: AnimatedSprite<PixelSprite>
  declare stats: DecorationData

  static schema = {
    animation: pixelSpriteAnimation(),
    stats: data<DecorationData>(),
  } as const

  get config(): DecorationConfig {
    return {
      name: this.stats.name,
      scale: this.stats.scale ?? 0.6,
      bobAmplitude: this.stats.bobAmplitude ?? 0,
      bobFrequency: this.stats.bobFrequency ?? 0,
      wallMounted: this.stats.wallMounted ?? false,
      mountHeight: this.stats.mountHeight ?? 0.5,
      solid: this.stats.solid ?? false,
      radius: this.stats.radius ?? 0.3,
      light: this.stats.light ?? null,
      animation: this.animation,
    }
  }
}
