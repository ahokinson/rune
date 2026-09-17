import type { TileMap } from "@ahokinson/rune"
import { type ActionSnapshot, Angle, Cooldown, castRay, Entity2D, type MouseSnapshot, Vector2 } from "@ahokinson/rune"
import type { PlayerAction } from "../actions"
import { getCeilingHeight, getFloorHeight, isBlocking, type TombCell, toggleDoor } from "./map"

const MOVE_SPEED_CELLS_PER_SECOND = 4
const MOUSE_LOOK_RADIANS_PER_CELL = 0.08
const FIRE_COOLDOWN_MILLISECONDS = 250
const COLLISION_RADIUS = 0.25
const MAX_HITSCAN_DISTANCE = 24
const USE_REACH = 1.2

const STEP_UP_THRESHOLD = 0.375
const PLAYER_HEIGHT = 0.55
const GRAVITY = 18
const JUMP_VELOCITY = 4.2
const GROUND_EPSILON = 0.001

export interface FireResult {
  origin: Vector2
  direction: Vector2
  distance: number
}

export interface CircleObstacle {
  readonly solid: boolean
  readonly position: { readonly x: number; readonly y: number }
  readonly collisionRadius: number
}

export interface PlayerOptions {
  position: Vector2
  yaw?: number
  controls: ActionSnapshot<PlayerAction>
  mouse: MouseSnapshot
  tileMap: TileMap<TombCell>
  obstacles?: ReadonlyArray<CircleObstacle>
  onFire: (result: FireResult) => void
  onDoorToggle?: (column: number, row: number, isOpen: boolean) => void
}

export class Player extends Entity2D {
  yaw: number
  z = 0
  velocityZ = 0
  isGrounded = true
  private readonly controls: ActionSnapshot<PlayerAction>
  private readonly mouse: MouseSnapshot
  private readonly tileMap: TileMap<TombCell>
  private readonly obstacles: ReadonlyArray<CircleObstacle>
  private readonly onFire: (result: FireResult) => void
  private readonly onDoorToggle: (column: number, row: number, isOpen: boolean) => void
  private readonly fireCooldown = new Cooldown(FIRE_COOLDOWN_MILLISECONDS)

  constructor(options: PlayerOptions) {
    super({ position: options.position.clone(), size: new Vector2(0.5, 0.5) })
    this.yaw = options.yaw ?? 0
    this.controls = options.controls
    this.mouse = options.mouse
    this.tileMap = options.tileMap
    this.obstacles = options.obstacles ?? []
    this.onFire = options.onFire
    this.onDoorToggle = options.onDoorToggle ?? (() => {})
    this.z = getFloorHeight(this.tileMap, Math.floor(this.position.x), Math.floor(this.position.y))
  }

  forwardDirection(): Vector2 {
    return Vector2.fromAngle(this.yaw)
  }

  override update(deltaMilliseconds: number): void {
    this.fireCooldown.tick(deltaMilliseconds)
    const deltaSeconds = deltaMilliseconds / 1000

    if (this.mouse.deltaX !== 0) {
      this.yaw = Angle.normalize(this.yaw + this.mouse.deltaX * MOUSE_LOOK_RADIANS_PER_CELL)
    }

    const currentFloor = getFloorHeight(this.tileMap, Math.floor(this.position.x), Math.floor(this.position.y))
    if (this.isGrounded && currentFloor < this.z - GROUND_EPSILON) {
      this.isGrounded = false
    }

    const forward = (this.controls.isDown("moveForward") ? 1 : 0) - (this.controls.isDown("moveBackward") ? 1 : 0)
    const strafe = (this.controls.isDown("strafeRight") ? 1 : 0) - (this.controls.isDown("strafeLeft") ? 1 : 0)

    if (forward !== 0 || strafe !== 0) {
      const cosYaw = Math.cos(this.yaw)
      const sinYaw = Math.sin(this.yaw)
      const step = MOVE_SPEED_CELLS_PER_SECOND * deltaSeconds
      const dx = (cosYaw * forward - sinYaw * strafe) * step
      const dy = (sinYaw * forward + cosYaw * strafe) * step
      this.tryMove(dx, dy)
    }

    this.updateVertical(deltaSeconds)

    if (this.controls.wasPressed("use")) this.tryUseDoor()

    const wantsToFire = this.controls.wasPressed("fire") || this.controls.isDown("fire")
    if (wantsToFire && this.fireCooldown.fire()) {
      this.fireHitscan()
    }
  }

  private tryMove(dx: number, dy: number): void {
    const nextX = this.position.x + dx
    const probeColX = Math.floor(nextX + Math.sign(dx) * COLLISION_RADIUS)
    if (
      this.canEnterCell(probeColX, Math.floor(this.position.y)) &&
      !this.collidesWithObstacles(nextX, this.position.y)
    ) {
      this.position.x = nextX
    }
    const nextY = this.position.y + dy
    const probeRowY = Math.floor(nextY + Math.sign(dy) * COLLISION_RADIUS)
    if (
      this.canEnterCell(Math.floor(this.position.x), probeRowY) &&
      !this.collidesWithObstacles(this.position.x, nextY)
    ) {
      this.position.y = nextY
    }
    if (this.isGrounded) {
      const floorHere = getFloorHeight(this.tileMap, Math.floor(this.position.x), Math.floor(this.position.y))
      if (floorHere > this.z) this.z = floorHere
      else if (this.z - floorHere <= STEP_UP_THRESHOLD) this.z = floorHere
    }
  }

  private collidesWithObstacles(x: number, y: number): boolean {
    for (const obstacle of this.obstacles) {
      if (!obstacle.solid) continue
      const dx = obstacle.position.x - x
      const dy = obstacle.position.y - y
      const minDist = obstacle.collisionRadius + COLLISION_RADIUS
      if (dx * dx + dy * dy < minDist * minDist) return true
    }
    return false
  }

  private canEnterCell(column: number, row: number): boolean {
    if (isBlocking(this.tileMap, column, row)) return false
    const nextFloor = getFloorHeight(this.tileMap, column, row)
    const nextCeil = getCeilingHeight(this.tileMap, column, row)
    if (nextCeil - nextFloor < PLAYER_HEIGHT) return false
    if (this.isGrounded) {
      if (nextFloor - this.z > STEP_UP_THRESHOLD) return false
      if (nextCeil < this.z + PLAYER_HEIGHT) return false
      return true
    }
    if (nextFloor > this.z) return false
    if (nextCeil < this.z + PLAYER_HEIGHT) return false
    return true
  }

  private updateVertical(deltaSeconds: number): void {
    const col = Math.floor(this.position.x)
    const row = Math.floor(this.position.y)
    const cellFloor = getFloorHeight(this.tileMap, col, row)
    const cellCeil = getCeilingHeight(this.tileMap, col, row)

    if (this.isGrounded && this.controls.wasPressed("jump")) {
      this.velocityZ = JUMP_VELOCITY
      this.isGrounded = false
    }

    if (!this.isGrounded) {
      this.velocityZ -= GRAVITY * deltaSeconds
      this.z += this.velocityZ * deltaSeconds

      if (this.z <= cellFloor) {
        this.z = cellFloor
        this.velocityZ = 0
        this.isGrounded = true
      }

      const headZ = this.z + PLAYER_HEIGHT
      if (headZ >= cellCeil && this.velocityZ > 0) {
        this.z = cellCeil - PLAYER_HEIGHT
        this.velocityZ = 0
      }
    }
  }

  private tryUseDoor(): void {
    const dir = this.forwardDirection()
    for (let reach = 0.6; reach <= USE_REACH; reach += 0.3) {
      const tx = Math.floor(this.position.x + dir.x * reach)
      const ty = Math.floor(this.position.y + dir.y * reach)
      const opened = toggleDoor(this.tileMap, tx, ty)
      if (opened === null) continue
      this.onDoorToggle(tx, ty, opened)
      return
    }
  }

  private fireHitscan(): void {
    const direction = this.forwardDirection()
    const blocked = (column: number, row: number) => isBlocking(this.tileMap, column, row)
    const hit = castRay(this.position, direction, blocked, MAX_HITSCAN_DISTANCE)
    const distance = hit ? hit.distance : MAX_HITSCAN_DISTANCE
    this.onFire({ origin: this.position.clone(), direction, distance })
  }
}
