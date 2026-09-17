import { type AnimatedSprite, Asset, data, type PixelSprite, pixelSpriteAnimation } from "@ahokinson/rune"

export type AttackType = "melee" | "ranged"

interface EnemyData {
  sightRange: number
  attackRange: number
  moveSpeed: number
  repathIntervalMs: number
  collisionSize: [number, number]
  states: string[]
  attackType?: AttackType
  attackDamage?: number
  attackWindupMs?: number
  attackCooldownMs?: number
}

export interface EnemyConfig {
  sightRange: number
  attackRange: number
  moveSpeed: number
  repathIntervalMs: number
  collisionSize: [number, number]
  states: string[]
  attackType: AttackType
  attackDamage: number
  attackWindupMs: number
  attackCooldownMs: number
  animation: AnimatedSprite<PixelSprite>
}

export class EnemyAsset extends Asset {
  declare animation: AnimatedSprite<PixelSprite>
  declare stats: EnemyData

  static schema = {
    animation: pixelSpriteAnimation(),
    stats: data<EnemyData>(),
  } as const

  get config(): EnemyConfig {
    return {
      sightRange: this.stats.sightRange,
      attackRange: this.stats.attackRange,
      moveSpeed: this.stats.moveSpeed,
      repathIntervalMs: this.stats.repathIntervalMs,
      collisionSize: this.stats.collisionSize,
      states: this.stats.states,
      attackType: this.stats.attackType ?? "melee",
      attackDamage: this.stats.attackDamage ?? 5,
      attackWindupMs: this.stats.attackWindupMs ?? 350,
      attackCooldownMs: this.stats.attackCooldownMs ?? 800,
      animation: this.animation.clone(),
    }
  }
}
