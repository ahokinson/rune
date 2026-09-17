import {
  type BillboardEntry,
  type CanvasSurface,
  type Entity,
  type PixelSprite,
  type TileMap,
  TriggerVolume,
  Vector2,
} from "@ahokinson/rune"
import type { PickupConfig } from "../assets/pickup"
import { PICKUP_LAYER, PLAYER_LAYER } from "./layers"
import { floorWorldZ, type TombCell } from "./map"

export type PickupKind = "health" | "ammo"

export interface PickupOptions {
  position: Vector2
  kind: PickupKind
  amount: number
  config: PickupConfig
  tileMap: TileMap<TombCell>
  onCollected: (kind: PickupKind, amount: number) => void
}

export class Pickup extends TriggerVolume implements BillboardEntry {
  readonly kind: PickupKind
  readonly amount: number
  verticalOffsetRows = 0
  readonly spriteScale: number
  private readonly config: PickupConfig
  private readonly tileMap: TileMap<TombCell>
  private readonly onCollected: (kind: PickupKind, amount: number) => void
  private elapsedMilliseconds = 0
  private readonly sprite: PixelSprite

  constructor(options: PickupOptions) {
    super({
      position: options.position.clone(),
      size: new Vector2(options.config.collisionSize[0], options.config.collisionSize[1]),
    })
    this.kind = options.kind
    this.amount = options.amount
    this.config = options.config
    this.tileMap = options.tileMap
    this.onCollected = options.onCollected
    this.triggerMask = PLAYER_LAYER
    this.collisionLayer = PICKUP_LAYER
    this.spriteScale = options.config.scale
    this.sprite = options.config.sprite
  }

  override update(deltaMilliseconds: number): void {
    this.elapsedMilliseconds += deltaMilliseconds
    this.verticalOffsetRows = Math.sin(this.elapsedMilliseconds * this.config.bobFrequency) * this.config.bobAmplitude
  }

  spriteAt(_timeMilliseconds: number): PixelSprite {
    return this.sprite
  }

  worldZ(): number {
    return floorWorldZ(this.tileMap, this.position, 0.5)
  }

  override onOverlapEnter(_player: Entity): void {
    this.onCollected(this.kind, this.amount)
    this.markForRemoval()
  }

  override draw(_canvas: CanvasSurface): void {}
}
