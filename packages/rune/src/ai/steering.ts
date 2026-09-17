import { Random } from "@/math/random"
import { Vector2 } from "@/math/vector2"

/**
 * Reynolds steering behaviours: each returns a steering force (desired velocity −
 * current velocity) you add to an agent's velocity, then clamp to a max speed.
 * They compose by summing — seek a goal while separating from neighbours while
 * avoiding a wall — which is how flocks and crowds get their emergent motion.
 * 2D throughout (Vector2); agents are the lightweight Boid shape below.
 *
 * @module
 */

/** Lightweight agent shape used by the steering behaviours. */
export interface Boid {
  /** World-space position. */
  position: Vector2
  /** Current velocity. */
  velocity: Vector2
}

/**
 * Steer toward `target` at full speed.
 *
 * @param position - Agent position.
 * @param velocity - Agent velocity.
 * @param target - Point to seek.
 * @param maxSpeed - Maximum speed the agent may travel.
 * @returns A steering force to add to `velocity`.
 */
export function seek(position: Vector2, velocity: Vector2, target: Vector2, maxSpeed: number): Vector2 {
  const desired = target.subtract(position)
  const distance = desired.length()
  if (distance === 0) return new Vector2(0, 0)
  desired.scaleInPlace(maxSpeed / distance)
  return desired.subtractInPlace(velocity)
}

/**
 * Steer directly away from `target`.
 *
 * @param position - Agent position.
 * @param velocity - Agent velocity.
 * @param target - Point to flee from.
 * @param maxSpeed - Maximum speed the agent may travel.
 * @returns A steering force (the negation of {@link seek}).
 */
export function flee(position: Vector2, velocity: Vector2, target: Vector2, maxSpeed: number): Vector2 {
  return seek(position, velocity, target, maxSpeed).scale(-1)
}

/**
 * Seek `target`, but ramp the speed down inside `slowRadius` so the agent eases to
 * a stop on it instead of orbiting.
 *
 * @param position - Agent position.
 * @param velocity - Agent velocity.
 * @param target - Point to arrive at.
 * @param maxSpeed - Maximum speed the agent may travel.
 * @param slowRadius - Distance from `target` at which braking begins.
 * @returns A steering force to add to `velocity`.
 */
export function arrive(
  position: Vector2,
  velocity: Vector2,
  target: Vector2,
  maxSpeed: number,
  slowRadius: number,
): Vector2 {
  const toTarget = target.subtract(position)
  const distance = toTarget.length()
  if (distance === 0) return velocity.scale(-1)
  const speed = distance < slowRadius ? maxSpeed * (distance / slowRadius) : maxSpeed
  toTarget.scaleInPlace(speed / distance)
  return toTarget.subtractInPlace(velocity)
}

/**
 * Seek where the target will be, extrapolating from its velocity — the chase that
 * leads a moving quarry.
 *
 * @param position - Agent position.
 * @param velocity - Agent velocity.
 * @param targetPosition - Moving target's current position.
 * @param targetVelocity - Moving target's velocity.
 * @param maxSpeed - Maximum speed the agent may travel.
 * @returns A steering force aimed at the predicted intercept point.
 */
export function pursue(
  position: Vector2,
  velocity: Vector2,
  targetPosition: Vector2,
  targetVelocity: Vector2,
  maxSpeed: number,
): Vector2 {
  const distance = targetPosition.distanceTo(position)
  const lookahead = maxSpeed === 0 ? 0 : distance / maxSpeed
  const predicted = targetPosition.add(targetVelocity.scale(lookahead))
  return seek(position, velocity, predicted, maxSpeed)
}

/**
 * Wander holds the slowly-drifting target angle that gives smooth, non-jittery
 * random roaming (a jittered point on a circle projected ahead of the agent).
 */
export class Wander {
  private angle = 0
  private readonly random: Random

  /**
   * @param circleDistance - Distance ahead of the agent the wander circle sits.
   * @param circleRadius - Radius of the wander circle.
   * @param jitter - Maximum per-step nudge applied to the wander angle.
   * @param random - Optional seeded RNG; a fresh one is created if omitted.
   */
  constructor(
    private readonly circleDistance = 2,
    private readonly circleRadius = 1,
    private readonly jitter = 0.5,
    random?: Random,
  ) {
    this.random = random ?? new Random(1)
  }

  /**
   * One step of wandering: nudges the internal angle and returns a steering force.
   *
   * @param velocity - Agent velocity, used to derive the heading.
   * @param maxSpeed - Maximum speed the agent may travel.
   * @returns A steering force toward the wandering target.
   */
  step(velocity: Vector2, maxSpeed: number): Vector2 {
    this.angle += this.random.float(-this.jitter, this.jitter)
    const heading = velocity.length() > 1e-6 ? Math.atan2(velocity.y, velocity.x) : 0
    const center = Vector2.fromAngle(heading, this.circleDistance)
    const offset = Vector2.fromAngle(heading + this.angle, this.circleRadius)
    const desired = center.addInPlace(offset)
    const length = desired.length()
    if (length === 0) return new Vector2(0, 0)
    desired.scaleInPlace(maxSpeed / length)
    return desired.subtractInPlace(velocity)
  }
}

/**
 * Steer away from the average position of neighbours within `radius` — keeps a
 * flock from clumping. Weighted by inverse distance so nearer crowders push harder.
 *
 * @param self - The agent doing the steering.
 * @param neighbours - Other agents to consider.
 * @param radius - Neighbour inclusion distance.
 * @returns A steering force pushing `self` away from clustered neighbours.
 */
export function separation(self: Boid, neighbours: readonly Boid[], radius: number): Vector2 {
  const steer = new Vector2(0, 0)
  let count = 0
  for (const other of neighbours) {
    if (other === self) continue
    const distance = self.position.distanceTo(other.position)
    if (distance > 0 && distance < radius) {
      const away = self.position.subtract(other.position).scaleInPlace(1 / distance)
      steer.addInPlace(away)
      count++
    }
  }
  if (count > 0) steer.scaleInPlace(1 / count)
  return steer
}

/**
 * Steer toward the average heading of neighbours within `radius` — aligns a flock.
 *
 * @param self - The agent doing the steering.
 * @param neighbours - Other agents to consider.
 * @param radius - Neighbour inclusion distance.
 * @returns A steering force matching neighbour headings.
 */
export function alignment(self: Boid, neighbours: readonly Boid[], radius: number): Vector2 {
  const average = new Vector2(0, 0)
  let count = 0
  for (const other of neighbours) {
    if (other === self) continue
    if (self.position.distanceTo(other.position) < radius) {
      average.addInPlace(other.velocity)
      count++
    }
  }
  if (count === 0) return average
  average.scaleInPlace(1 / count)
  return average.subtractInPlace(self.velocity)
}

/**
 * Steer toward the average position of neighbours within `radius` — pulls a flock
 * together.
 *
 * @param self - The agent doing the steering.
 * @param neighbours - Other agents to consider.
 * @param radius - Neighbour inclusion distance.
 * @returns A steering force toward the neighbour centroid.
 */
export function cohesion(self: Boid, neighbours: readonly Boid[], radius: number): Vector2 {
  const center = new Vector2(0, 0)
  let count = 0
  for (const other of neighbours) {
    if (other === self) continue
    if (self.position.distanceTo(other.position) < radius) {
      center.addInPlace(other.position)
      count++
    }
  }
  if (count === 0) return center
  center.scaleInPlace(1 / count)
  return seek(self.position, self.velocity, center, self.velocity.length() || 1)
}
