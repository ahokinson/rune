import {
  type AnimatedSprite,
  type BillboardEntry,
  type CanvasSurface,
  Entity2D,
  findPath,
  Heuristic,
  lineOfSight,
  type PixelSprite,
  StateMachine,
  type TileMap,
  Vector2,
} from "@ahokinson/rune"
import type { EnemyConfig } from "../assets/enemy"
import { getFloorHeight, isBlocking, type TombCell } from "./map"
import type { Player } from "./Player"

export type EnemyState = "idle" | "walk" | "attack" | "die"

export interface EnemyOptions {
  position: Vector2
  player: Player
  tileMap: TileMap<TombCell>
  config: EnemyConfig
  blockedCells?: ReadonlySet<number>
  onAttack?: (damage: number) => void
}

const FLOOR_TOLERANCE = 0.05

export class Enemy extends Entity2D implements BillboardEntry {
  readonly animation: AnimatedSprite<PixelSprite>
  private readonly player: Player
  private readonly tileMap: TileMap<TombCell>
  private readonly config: EnemyConfig
  private readonly blockedCells: ReadonlySet<number>
  private readonly onAttack: (damage: number) => void
  private readonly brain: StateMachine<EnemyState>
  private readonly homeFloor: number
  private repathTimer = 0
  private currentPath: Array<{ column: number; row: number }> = []
  private pathIndex = 0
  private dying = false
  private attackWindup = 0
  private attackCooldown = 0

  constructor(options: EnemyOptions) {
    super({
      position: options.position.clone(),
      size: new Vector2(options.config.collisionSize[0], options.config.collisionSize[1]),
    })
    this.player = options.player
    this.tileMap = options.tileMap
    this.config = options.config
    this.blockedCells = options.blockedCells ?? new Set()
    this.onAttack = options.onAttack ?? (() => {})
    this.animation = options.config.animation.clone()
    this.homeFloor = getFloorHeight(this.tileMap, Math.floor(options.position.x), Math.floor(options.position.y))

    this.brain = new StateMachine<EnemyState>()
    this.brain
      .addState("idle", { onEnter: () => this.animation.play("idle") })
      .addState("walk", { onEnter: () => this.animation.play("walk") })
      .addState("attack", {
        onEnter: () => {
          this.animation.play("attack")
          this.attackWindup = this.config.attackWindupMs
        },
      })
      .addState("die", { onEnter: () => this.animation.play("die") })
    this.brain.transitionTo("idle")
  }

  kill(): void {
    if (this.dying) return
    this.dying = true
    this.brain.transitionTo("die")
  }

  get isDead(): boolean {
    return this.dying
  }

  get floorHeight(): number {
    return this.homeFloor
  }

  get attackType() {
    return this.config.attackType
  }

  spriteAt(_timeMilliseconds: number): PixelSprite {
    return this.animation.currentFrame()
  }

  worldZ(): number {
    return getFloorHeight(this.tileMap, Math.floor(this.position.x), Math.floor(this.position.y)) + 0.5
  }

  private isHomeFloor(column: number, row: number): boolean {
    return Math.abs(getFloorHeight(this.tileMap, column, row) - this.homeFloor) <= FLOOR_TOLERANCE
  }

  private cellKey(column: number, row: number): number {
    return row * 16384 + column
  }

  override update(deltaMilliseconds: number): void {
    this.animation.update(deltaMilliseconds)
    this.brain.update(deltaMilliseconds)

    if (this.dying) {
      if (this.animation.isFinished()) this.markForRemoval()
      return
    }

    if (this.attackCooldown > 0) this.attackCooldown -= deltaMilliseconds

    const blocked = (column: number, row: number) =>
      isBlocking(this.tileMap, column, row) || this.blockedCells.has(this.cellKey(column, row))
    const passable = (column: number, row: number) => !blocked(column, row) && this.isHomeFloor(column, row)
    const visible = lineOfSight(this.position, this.player.position, blocked)
    const distanceToPlayer = this.position.distanceTo(this.player.position)
    const playerOnHomeFloor = Math.abs(this.player.z - this.homeFloor) <= FLOOR_TOLERANCE

    if (!visible || !playerOnHomeFloor || distanceToPlayer > this.config.sightRange) {
      this.brain.transitionTo("idle")
      this.currentPath = []
      return
    }

    if (distanceToPlayer <= this.config.attackRange && this.attackCooldown <= 0) {
      this.brain.transitionTo("attack")
      this.attackWindup -= deltaMilliseconds
      if (this.attackWindup <= 0) {
        const stillVisible = lineOfSight(this.position, this.player.position, blocked)
        const stillInRange = this.position.distanceTo(this.player.position) <= this.config.attackRange
        if (stillVisible && stillInRange) this.onAttack(this.config.attackDamage)
        this.attackCooldown = this.config.attackCooldownMs
        this.attackWindup = this.config.attackWindupMs
      }
      return
    }

    this.brain.transitionTo("walk")

    this.repathTimer -= deltaMilliseconds
    if (this.repathTimer <= 0 || this.currentPath.length === 0) {
      this.repathTimer = this.config.repathIntervalMs
      const path = findPath(
        { column: Math.floor(this.position.x), row: Math.floor(this.position.y) },
        { column: Math.floor(this.player.position.x), row: Math.floor(this.player.position.y) },
        passable,
        { allowDiagonal: true, heuristic: Heuristic.Chebyshev },
      )
      this.currentPath = path ?? []
      this.pathIndex = Math.min(1, this.currentPath.length - 1)
    }

    if (this.currentPath.length > 1 && this.pathIndex < this.currentPath.length) {
      const target = this.currentPath[this.pathIndex]
      if (target) {
        const targetX = target.column + 0.5
        const targetY = target.row + 0.5
        const deltaX = targetX - this.position.x
        const deltaY = targetY - this.position.y
        const distanceToTarget = Math.hypot(deltaX, deltaY)
        if (distanceToTarget < 0.1) {
          this.pathIndex++
        } else {
          const step = this.config.moveSpeed * (deltaMilliseconds / 1000)
          this.position.x += (deltaX / distanceToTarget) * Math.min(step, distanceToTarget)
          this.position.y += (deltaY / distanceToTarget) * Math.min(step, distanceToTarget)
        }
      }
    }
  }

  override draw(_canvas: CanvasSurface): void {}
}
