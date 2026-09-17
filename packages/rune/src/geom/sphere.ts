import { clamp } from "@/math/scalar"
import { Vector3 } from "@/math/vector3"

/**
 * Spherical-coordinate helpers on the unit sphere. Angles are radians:
 * `theta` is the elevation from the equatorial plane (−π/2 at the −y pole,
 * +π/2 at the +y pole) and `phi` is the azimuth about the y axis. The y axis
 * points "down" to match rune's screen-space convention (Vector3.up === (0, −1, 0)).
 *
 * @module
 */

/**
 * Unit direction for an elevation/azimuth (radians).
 *
 * @param theta - Elevation from the equatorial plane.
 * @param phi - Azimuth about the y axis.
 * @returns A new unit {@link Vector3}.
 */
export function sphericalToVector3(theta: number, phi: number): Vector3 {
  return sphericalToVector3Into(new Vector3(), theta, phi)
}

/**
 * Allocation-free variant of {@link sphericalToVector3}: writes the unit
 * direction into `out`.
 *
 * @param out - Target vector to fill.
 * @param theta - Elevation from the equatorial plane.
 * @param phi - Azimuth about the y axis.
 * @returns `out` for chaining.
 */
export function sphericalToVector3Into(out: Vector3, theta: number, phi: number): Vector3 {
  const cosTheta = Math.cos(theta)
  out.x = cosTheta * Math.sin(phi)
  out.y = -Math.sin(theta)
  out.z = cosTheta * Math.cos(phi)
  return out
}

/**
 * Inverse of {@link sphericalToVector3}: recover elevation/azimuth (radians) from a
 * direction. The azimuth tolerates a non-unit vector, but the elevation assumes
 * a unit vector, so normalize first if unsure.
 *
 * @param v - Direction to invert (unit length for a correct elevation).
 * @returns `{ theta, phi }` in radians.
 */
export function vector3ToSpherical(v: Vector3): { theta: number; phi: number } {
  return {
    theta: Math.asin(clamp(-v.y, -1, 1)),
    phi: Math.atan2(v.x, v.z),
  }
}

/**
 * Spherical linear interpolation along the great circle from `a` to `b`. Falls
 * back to a plain lerp when the endpoints are nearly parallel (sin θ → 0).
 *
 * @param a - Start direction (unit).
 * @param b - End direction (unit).
 * @param t - Interpolation factor (0 = `a`, 1 = `b`).
 * @returns A new interpolated {@link Vector3}.
 */
export function slerp(a: Vector3, b: Vector3, t: number): Vector3 {
  return slerpInto(new Vector3(), a, b, t)
}

/**
 * Allocation-free variant of {@link slerp}: writes the result into `out`.
 *
 * @param out - Target vector.
 * @param a - Start direction (unit).
 * @param b - End direction (unit).
 * @param t - Interpolation factor (0 = `a`, 1 = `b`).
 * @returns `out` for chaining.
 */
export function slerpInto(out: Vector3, a: Vector3, b: Vector3, t: number): Vector3 {
  const angle = greatCircleAngle(a, b)
  if (angle < 0.001) {
    out.x = a.x + (b.x - a.x) * t
    out.y = a.y + (b.y - a.y) * t
    out.z = a.z + (b.z - a.z) * t
    return out
  }
  const sinAngle = Math.sin(angle)
  const wa = Math.sin((1 - t) * angle) / sinAngle
  const wb = Math.sin(t * angle) / sinAngle
  out.x = a.x * wa + b.x * wb
  out.y = a.y * wa + b.y * wb
  out.z = a.z * wa + b.z * wb
  return out
}

/**
 * Angle (radians) of the great-circle arc between two directions.
 *
 * @param a - First direction (unit).
 * @param b - Second direction (unit).
 * @returns Angular separation in `[0, π]`.
 */
export function greatCircleAngle(a: Vector3, b: Vector3): number {
  return Math.acos(clamp(a.dot(b), -1, 1))
}

/**
 * Sample the great-circle arc from `a` to `b` at `steps + 1` evenly spaced
 * points (inclusive of both endpoints). Points are unit directions — bowing an
 * arc off the surface is a projection concern (see SphereProjection's altitude
 * parameter), kept separate so depth/culling stay tied to the true surface.
 *
 * @param a - Start direction (unit).
 * @param b - End direction (unit).
 * @param steps - Number of segments; the result has `steps + 1` points.
 * @returns Array of unit directions along the arc.
 */
export function sampleGreatCircleArc(a: Vector3, b: Vector3, steps: number): Vector3[] {
  const points: Vector3[] = []
  for (let i = 0; i <= steps; i++) {
    points.push(slerp(a, b, i / steps))
  }
  return points
}
