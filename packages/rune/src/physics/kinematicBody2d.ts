/**
 * A platformer movement model: integrates velocity with gravity/friction, applies
 * a buffered, coyote-time jump, then resolves the move against terrain with the
 * engine's swept-AABB test (moveAndCollide). It is the kinematic sibling of
 * RigidBody2D — the caller owns the body's `box`/position and feeds input each
 * fixed step; the body owns velocity and the grounded/coyote bookkeeping.
 *
 * @module
 */

import type { Rectangle } from "@/math/rectangle"
import { clamp } from "@/math/scalar"
import { Vector2 } from "@/math/vector2"
import { type CollisionResult, moveAndCollide } from "./moveAndCollide"

/** Construction options for a {@link KinematicBody2D}. */
export interface KinematicBody2DOptions {
  /** Downward acceleration (cells / second²) and the terminal fall speed it builds to. */
  gravity: number
  /** Terminal downward speed (cells / second). */
  maxFall: number
  /** Horizontal acceleration while steering (cells / second²). */
  walkAccel: number
  /** Horizontal deceleration while idle (cells / second²). */
  friction: number
  /** Top horizontal speed (cells / second). */
  maxWalk: number
  /** Upward impulse applied when a buffered jump fires (cells / second). */
  jumpVelocity: number
  /**
   * Jump forgiveness. coyote: still jumpable for this long after leaving the ground.
   * jumpBuffer: a jump pressed this long before landing still fires on touchdown.
   */
  coyoteMilliseconds?: number
  /** See {@link KinematicBody2DOptions.coyoteMilliseconds}. */
  jumpBufferMilliseconds?: number
}

/** Per-step input driving a {@link KinematicBody2D}. */
export interface KinematicInput {
  /** Horizontal intent in `[-1, 1]` (left … right). */
  move: number
  /**
   * `true` on the step the jump key was pressed (terminals don't report held keys,
   * so a single firm impulse is the reliable scheme — hence the buffer + coyote).
   */
  jump: boolean
}

/**
 * A kinematic platformer body. See the module docstring for the movement model.
 */
export class KinematicBody2D {
  /** Current velocity (cells / second); the body mutates this as it collides. */
  readonly velocity = new Vector2(0, 0)
  /** `true` while the body rests on a floor this step. */
  grounded = false

  private readonly gravity: number
  private readonly maxFall: number
  private readonly walkAccel: number
  private readonly friction: number
  private readonly maxWalk: number
  private readonly jumpVelocity: number
  private readonly coyoteMilliseconds: number
  private readonly jumpBufferMilliseconds: number
  private coyote = 0
  private jumpBuffer = 0

  /**
   * @param options - Movement tuning. See {@link KinematicBody2DOptions}.
   */
  constructor(options: KinematicBody2DOptions) {
    this.gravity = options.gravity
    this.maxFall = options.maxFall
    this.walkAccel = options.walkAccel
    this.friction = options.friction
    this.maxWalk = options.maxWalk
    this.jumpVelocity = options.jumpVelocity
    this.coyoteMilliseconds = options.coyoteMilliseconds ?? 0
    this.jumpBufferMilliseconds = options.jumpBufferMilliseconds ?? 0
  }

  /**
   * Advance one fixed step: mutates `box` to the resolved position and returns the
   * collision result so the caller can react to ceilings/grounding. Velocity
   * components that collided are zeroed here; the caller may still overwrite
   * `velocity` afterwards (e.g. a stomp bounce).
   *
   * @param box - The body's AABB; updated to the resolved position.
   * @param input - Steering + jump intent for this step.
   * @param deltaMilliseconds - Step duration in milliseconds.
   * @param obstacles - Axis-aligned terrain rectangles to collide against.
   * @returns The {@link CollisionResult} from this step.
   */
  step(
    box: Rectangle,
    input: KinematicInput,
    deltaMilliseconds: number,
    obstacles: readonly Rectangle[],
  ): CollisionResult {
    const deltaSeconds = deltaMilliseconds / 1000

    if (input.move !== 0) {
      this.velocity.x = clamp(this.velocity.x + input.move * this.walkAccel * deltaSeconds, -this.maxWalk, this.maxWalk)
    } else {
      const drop = this.friction * deltaSeconds
      this.velocity.x = this.velocity.x > 0 ? Math.max(0, this.velocity.x - drop) : Math.min(0, this.velocity.x + drop)
    }

    if (input.jump) this.jumpBuffer = this.jumpBufferMilliseconds
    this.coyote = this.grounded ? this.coyoteMilliseconds : this.coyote - deltaMilliseconds
    this.jumpBuffer -= deltaMilliseconds
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.velocity.y = -this.jumpVelocity
      this.grounded = false
      this.coyote = 0
      this.jumpBuffer = 0
    }

    this.velocity.y = Math.min(this.velocity.y + this.gravity * deltaSeconds, this.maxFall)

    const deltaX = this.velocity.x * deltaSeconds
    const deltaY = this.velocity.y * deltaSeconds
    const result = moveAndCollide(box, deltaX, deltaY, obstacles)
    if (result.hitX) this.velocity.x = 0
    this.grounded = result.grounded
    if (result.grounded) this.velocity.y = 0
    if (result.ceiling) this.velocity.y = 0
    return result
  }
}
