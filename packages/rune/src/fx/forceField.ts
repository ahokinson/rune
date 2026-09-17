import type { Vector2 } from "@/math/vector2"

/**
 * A force field accumulates acceleration onto `out` for a particle at `position`
 * moving at `velocity`. Particles sum every field each step, so fields compose:
 * drop a gravity well next to a wind gust next to a drag field. Built-in factories
 * cover the common shapes; write your own for anything bespoke.
 *
 * @module
 */

/**
 * Force field function: add acceleration onto `out` for a particle at
 * `position` with `velocity`.
 */
export type ForceField = (position: Vector2, velocity: Vector2, out: Vector2) => void

/**
 * Constant directional force (wind, buoyancy). Gravity is just
 * {@link directionalForce} with a downward vector, but Particles already has a
 * dedicated gravity option.
 *
 * @param x - X acceleration per step.
 * @param y - Y acceleration per step.
 * @returns A {@link ForceField}.
 */
export function directionalForce(x: number, y: number): ForceField {
  return (_position, _velocity, out) => {
    out.x += x
    out.y += y
  }
}

/**
 * Pull toward (positive strength) or push from (negative) a point, with strength
 * falling off as 1/distance so it stays finite near the centre. A gravity well,
 * a black hole, an explosion shockwave (negative).
 *
 * @param centerX - Attractor X.
 * @param centerY - Attractor Y.
 * @param strength - Signed magnitude; positive pulls, negative pushes.
 * @param softening - Added to distance² to avoid singularity at the centre (default 1).
 * @returns A {@link ForceField}.
 */
export function pointAttractor(centerX: number, centerY: number, strength: number, softening = 1): ForceField {
  return (position, _velocity, out) => {
    const dx = centerX - position.x
    const dy = centerY - position.y
    const distanceSquared = dx * dx + dy * dy + softening
    const inverse = strength / (Math.sqrt(distanceSquared) * distanceSquared)
    out.x += dx * inverse
    out.y += dy * inverse
  }
}

/**
 * Swirl around a centre (a whirlpool / tornado): force is perpendicular to the
 * radius, magnitude `strength` scaled by 1/distance.
 *
 * @param centerX - Vortex centre X.
 * @param centerY - Vortex centre Y.
 * @param strength - Signed magnitude.
 * @param softening - Added to distance² to avoid singularity (default 1).
 * @returns A {@link ForceField}.
 */
export function vortex(centerX: number, centerY: number, strength: number, softening = 1): ForceField {
  return (position, _velocity, out) => {
    const dx = position.x - centerX
    const dy = position.y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy + softening)
    const magnitude = strength / distance
    // Perpendicular to (dx, dy).
    out.x += -dy * (magnitude / distance)
    out.y += dx * (magnitude / distance)
  }
}

/**
 * Velocity-proportional drag (air resistance), `coefficient` ≥ 0.
 *
 * @param coefficient - Drag strength; higher stops particles faster.
 * @returns A {@link ForceField}.
 */
export function drag(coefficient: number): ForceField {
  return (_position, velocity, out) => {
    out.x -= velocity.x * coefficient
    out.y -= velocity.y * coefficient
  }
}
