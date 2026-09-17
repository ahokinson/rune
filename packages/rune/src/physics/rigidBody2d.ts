/**
 * A translational 2D rigid body: a velocity-carrying AABB that falls under
 * gravity and is resolved against axis-aligned terrain with the engine's
 * swept-AABB collision. Real momentum, restitution (bounce) and ground friction —
 * the dynamics a platformer or top-down mover wants — without the per-entity
 * hand-rolled velocity bookkeeping. Collision is AABB-only, so the body has no
 * rotational dynamics (an oriented box would need a polygon solver); spin a
 * thrown sprite cosmetically in the entity layer if you want it.
 *
 * Coordinates match the 2D renderer: +Y is down, so a positive `gravity`
 * accelerates the body downward and a floor below it reports `grounded`.
 *
 * @module
 */

import { Rectangle } from "@/math/rectangle"
import { Vector2 } from "@/math/vector2"
import { type CollisionResult, moveAndCollide } from "./moveAndCollide"

/** Construction options for a {@link RigidBody2D}. */
export interface RigidBody2DOptions {
  /** Top-left starting X position, in world units. */
  x?: number
  /** Top-left starting Y position, in world units. */
  y?: number
  /** Box width, in world units. */
  width?: number
  /** Box height, in world units. */
  height?: number
  /** Downward (+Y) acceleration, world units per second². */
  gravity?: number
  /**
   * Fraction of the incoming normal speed returned on impact (0 = stop dead,
   * 1 = perfectly elastic). Applied on floor, ceiling and wall hits.
   */
  restitution?: number
  /** Ground friction: fraction of horizontal speed shed per second while grounded. */
  friction?: number
  /** Air drag: fraction of speed shed per second on both axes, always. */
  linearDamping?: number
  /**
   * Speeds below these (after a collision) are snapped to zero so the body comes
   * fully to rest instead of jittering.
   */
  restThreshold?: number
}

/** A translational 2D rigid body (AABB) with gravity, restitution, and friction. */
export class RigidBody2D {
  /** The collision box; `box.x`/`box.y` are the body's top-left position. */
  readonly box: Rectangle
  /** Current velocity (world units / second). */
  readonly velocity = new Vector2()
  /** `true` while the body rests on a floor this step. */
  grounded = false

  private readonly gravity: number
  private readonly restitution: number
  private readonly friction: number
  private readonly linearDamping: number
  private readonly restThreshold: number

  /**
   * @param options - Construction options; all fields optional (see {@link RigidBody2DOptions}).
   */
  constructor(options: RigidBody2DOptions = {}) {
    this.box = new Rectangle(options.x ?? 0, options.y ?? 0, options.width ?? 1, options.height ?? 1)
    this.gravity = options.gravity ?? 0
    this.restitution = options.restitution ?? 0
    this.friction = options.friction ?? 0
    this.linearDamping = options.linearDamping ?? 0
    this.restThreshold = options.restThreshold ?? 0.01
  }

  /**
   * Convenience view of the box's top-left as a fresh `Vector2` (the box is the
   * source of truth; mutate `box.x`/`box.y` to teleport).
   *
   * @returns A new {@link Vector2} with the body's top-left coordinates.
   */
  get position(): Vector2 {
    return new Vector2(this.box.x, this.box.y)
  }

  /**
   * Advance one step: integrate gravity and damping, then sweep the box by the
   * resulting displacement against `obstacles`, applying bounce/friction from the
   * collision result. Returns the CollisionResult so callers can react to a
   * ground/ceiling hit (e.g. a landing sound, a bonked block).
   *
   * @param deltaSeconds - Step duration.
   * @param obstacles - Axis-aligned terrain rectangles to collide against.
   * @returns The {@link CollisionResult} from this step.
   */
  step(deltaSeconds: number, obstacles: readonly Rectangle[]): CollisionResult {
    this.velocity.y += this.gravity * deltaSeconds
    if (this.linearDamping > 0) {
      const retained = Math.max(0, 1 - this.linearDamping * deltaSeconds)
      this.velocity.x *= retained
      this.velocity.y *= retained
    }

    const result = moveAndCollide(this.box, this.velocity.x * deltaSeconds, this.velocity.y * deltaSeconds, obstacles)

    if (result.hitX) {
      this.velocity.x = -this.velocity.x * this.restitution
      if (Math.abs(this.velocity.x) < this.restThreshold) this.velocity.x = 0
    }
    if (result.grounded) {
      // Landed on a floor: bounce or stop the downward motion.
      this.velocity.y = -this.velocity.y * this.restitution
      if (Math.abs(this.velocity.y) < this.restThreshold) this.velocity.y = 0
      if (this.friction > 0) {
        const retained = Math.max(0, 1 - this.friction * deltaSeconds)
        this.velocity.x *= retained
        if (Math.abs(this.velocity.x) < this.restThreshold) this.velocity.x = 0
      }
    }
    if (result.ceiling) {
      // Bonked a ceiling: reverse or kill the upward motion.
      this.velocity.y = -this.velocity.y * this.restitution
      if (Math.abs(this.velocity.y) < this.restThreshold) this.velocity.y = 0
    }

    this.grounded = result.grounded
    return result
  }
}
