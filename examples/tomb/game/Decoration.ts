import {
  type AnimatedSprite,
  type BillboardEntry,
  type CanvasSurface,
  Entity2D,
  type PixelSprite,
  type TileMap,
  Vector2,
} from "@ahokinson/rune"
import type { DecorationConfig, DecorationLight } from "../assets/decoration"
import { floorWorldZ, isBlocking, type TombCell } from "./map"

const WALL_OFFSET = 0.42

export interface DecorationOptions {
  position: Vector2
  config: DecorationConfig
  tileMap: TileMap<TombCell>
}

export class Decoration extends Entity2D implements BillboardEntry {
  readonly spriteScale: number
  readonly solid: boolean
  readonly collisionRadius: number
  readonly light: DecorationLight | null
  verticalOffsetRows = 0
  private readonly tileMap: TileMap<TombCell>
  private readonly animation: AnimatedSprite<PixelSprite>
  private readonly bobAmplitude: number
  private readonly bobFrequency: number
  private readonly mountHeight: number
  private elapsedMilliseconds = 0

  constructor(options: DecorationOptions) {
    super({ position: options.position.clone(), size: new Vector2(0, 0) })
    this.tileMap = options.tileMap
    this.animation = options.config.animation
    this.spriteScale = options.config.scale
    this.bobAmplitude = options.config.bobAmplitude
    this.bobFrequency = options.config.bobFrequency
    this.mountHeight = options.config.mountHeight
    this.solid = options.config.solid
    this.collisionRadius = options.config.radius
    this.light = options.config.light
    if (options.config.wallMounted) {
      this.snapToWall()
    }
  }

  private snapToWall(): void {
    const column = Math.floor(this.position.x)
    const row = Math.floor(this.position.y)
    const neighbors: Array<[number, number]> = [
      [column - 1, row],
      [column + 1, row],
      [column, row - 1],
      [column, row + 1],
    ]
    for (const [nc, nr] of neighbors) {
      if (!isBlocking(this.tileMap, nc, nr)) continue
      this.position.x = column + 0.5 + (nc - column) * WALL_OFFSET
      this.position.y = row + 0.5 + (nr - row) * WALL_OFFSET
      return
    }
  }

  override update(deltaMilliseconds: number): void {
    this.elapsedMilliseconds += deltaMilliseconds
    this.animation.update(deltaMilliseconds)
    if (this.bobAmplitude > 0 && this.bobFrequency > 0) {
      this.verticalOffsetRows = Math.sin(this.elapsedMilliseconds * this.bobFrequency) * this.bobAmplitude
    }
  }

  spriteAt(_timeMilliseconds: number): PixelSprite {
    return this.animation.currentFrame()
  }

  worldZ(): number {
    return floorWorldZ(this.tileMap, this.position, this.mountHeight)
  }

  override draw(_canvas: CanvasSurface): void {}
}
