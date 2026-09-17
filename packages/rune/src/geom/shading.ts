import { Vector2 } from "@/math/vector2"
import type { Vector3 } from "@/math/vector3"

/**
 * Lighting helpers: Lambertian diffuse shading and screen-plane projection of
 * light directions for tying surface and rim effects to the same source.
 *
 * @module
 */

/**
 * Lambertian diffuse term for a surface normal lit by a directional light. Both
 * vectors are assumed unit length. `ambient` keeps the unlit side visible; the
 * diffuse term adds a directional highlight that falls off toward the terminator.
 *
 * @param normal - Unit surface normal.
 * @param light - Unit direction toward the light source.
 * @param ambient - Ambient floor keeping the unlit side visible (default 0.34).
 * @param diffuse - Diffuse contribution scaled by N·L (default 0.66).
 * @returns Illuminance in `[ambient, ambient + diffuse]`.
 */
export function lambert(normal: Vector3, light: Vector3, ambient = 0.34, diffuse = 0.66): number {
  return ambient + Math.max(0, normal.dot(light)) * diffuse
}

/**
 * Project a 3D direction onto the screen XY plane and renormalize to a 2D unit
 * vector. Useful for tying screen-space effects (e.g. an atmospheric rim) to a
 * light direction so they brighten on the same limb the surface highlight sits on.
 *
 * @param dir - Direction to project.
 * @param out - Optional target vector to write into (default new).
 * @returns `out` set to the unit screen-plane projection, or `(0, 0)` if `dir` has no XY component.
 */
export function directionToScreenPlane(dir: Vector3, out: Vector2 = new Vector2()): Vector2 {
  const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
  if (length === 0) return out.set(0, 0)
  return out.set(dir.x / length, dir.y / length)
}
