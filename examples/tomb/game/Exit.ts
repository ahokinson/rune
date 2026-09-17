import {
  type AnimatedSprite,
  type BillboardEntry,
  type CanvasSurface,
  type Entity,
  type PixelSprite,
  type TileMap,
  TriggerVolume,
  Vector2,
} from "@ahokinson/rune"
import type { ExitConfig } from "../assets/exit"
import { EXIT_LAYER, PLAYER_LAYER } from "./layers"
import { floorWorldZ, type TombCell } from "./map"
import type { Player } from "./Player"

export interface ExitOptions {
  position: Vector2
  config: ExitConfig
  tileMap: TileMap<TombCell>
  onReached: () => void
}

export class Exit extends TriggerVolume implements BillboardEntry {
  verticalOffsetRows = 0
  private readonly config: ExitConfig
  private readonly tileMap: TileMap<TombCell>
  private readonly animation: AnimatedSprite<PixelSprite>
  private readonly onReached: () => void
  private fired = false

  constructor(options: ExitOptions) {
    super({ position: options.position.clone(), size: new Vector2(1, 1) })
    this.config = options.config
    this.tileMap = options.tileMap
    this.animation = options.config.animation
    this.onReached = options.onReached
    this.triggerMask = PLAYER_LAYER
    this.collisionLayer = EXIT_LAYER
  }

  override update(deltaMilliseconds: number): void {
    this.animation.update(deltaMilliseconds)
  }

  spriteAt(_timeMilliseconds: number): PixelSprite {
    return this.animation.currentFrame()
  }

  worldZ(): number {
    return floorWorldZ(this.tileMap, this.position, 0.5)
  }

  override onOverlapEnter(_player: Player | Entity): void {
    if (this.fired) return
    this.fired = true
    this.onReached()
  }

  override draw(_canvas: CanvasSurface): void {}
}
