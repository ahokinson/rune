/**
 * Collider construction for the 3D rigid-body solver: derives sphere, box, and
 * mesh collision geometry (contact points + inverse inertia) from a mesh's
 * vertex buffer.
 *
 * @module
 */

import type { Mesh } from "@/draw/mesh/rasterizer"
import { Vector3 } from "@/math/vector3"

/** The eight signed corners of a unit box, scaled by the half-extents per body. */
const CORNER_SIGNS: ReadonlyArray<readonly [number, number, number]> = [
  [-1, -1, -1],
  [1, -1, -1],
  [-1, 1, -1],
  [1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [-1, 1, 1],
  [1, 1, 1],
]

/** Shape approximation used by the 3D rigid-body solver. */
export enum ColliderKind {
  /** Single rolling contact; isotropic sphere inertia. */
  Sphere = "sphere",
  /** Eight corner contacts; oriented box inertia tensor. */
  Box = "box",
  /** Sampled surface vertices as contacts; box-inertia approximation. */
  Mesh = "mesh",
}

/**
 * Precomputed collision geometry for a body. `points` are local contact offsets
 * (box corners or sampled mesh vertices); a sphere carries none and contacts the
 * floor at its single lowest point, `radius` below the centre. `inverseInertia`
 * is the diagonal of I⁻¹ in the body frame (unit mass).
 */
export interface Collider {
  /** Collider shape. */
  readonly kind: ColliderKind
  /** Sphere radius (zero for non-sphere colliders). */
  readonly radius: number
  /** Local-space contact points (empty for a sphere). */
  readonly points: readonly Vector3[]
  /** Diagonal of the body-frame inverse inertia tensor, for unit mass. */
  readonly inverseInertia: Vector3
}

/**
 * Build the collider of the requested shape for `mesh`.
 *
 * @param mesh - Source mesh whose bounds and vertices drive the collider.
 * @param kind - Desired collider shape.
 * @returns A new {@link Collider}.
 */
export function colliderFor(mesh: Mesh, kind: ColliderKind): Collider {
  if (kind === ColliderKind.Sphere) return sphereCollider(mesh)
  if (kind === ColliderKind.Box) return boxCollider(mesh)
  return meshCollider(mesh)
}

/**
 * A sphere sized to the mesh's bounding radius, with the isotropic inertia of a
 * solid sphere: I = (2/5)·m·r², so I⁻¹ = 2.5/r² on every axis.
 *
 * @param mesh - Source mesh.
 * @returns A sphere {@link Collider}.
 */
export function sphereCollider(mesh: Mesh): Collider {
  const half = new Vector3()
  const radius = meshBounds(mesh.positions, half)
  const inverse = 2.5 / (radius * radius)
  return { kind: ColliderKind.Sphere, radius, points: [], inverseInertia: new Vector3(inverse, inverse, inverse) }
}

/**
 * An oriented box sized to the mesh's bounding half-extents: contacts at the
 * eight corners, box inertia tensor.
 *
 * @param mesh - Source mesh.
 * @returns A box {@link Collider}.
 */
export function boxCollider(mesh: Mesh): Collider {
  const half = new Vector3()
  meshBounds(mesh.positions, half)
  const points = CORNER_SIGNS.map(([sx, sy, sz]) => new Vector3(sx * half.x, sy * half.y, sz * half.z))
  return { kind: ColliderKind.Box, radius: 0, points, inverseInertia: boxInverseInertia(half) }
}

/**
 * The mesh's own vertices (sampled to at most `maxPoints` for performance) as
 * contact points, so the body rests on its real silhouette. Inertia is the box
 * approximation from the bounding extents.
 *
 * @param mesh - Source mesh.
 * @param maxPoints - Cap on the number of sampled vertices (default 96).
 * @returns A mesh {@link Collider}.
 */
export function meshCollider(mesh: Mesh, maxPoints = 96): Collider {
  const half = new Vector3()
  meshBounds(mesh.positions, half)
  const positions = mesh.positions
  const vertexCount = Math.floor(positions.length / 3)
  const stride = Math.max(1, Math.ceil(vertexCount / maxPoints))
  const points: Vector3[] = []
  for (let v = 0; v < vertexCount; v += stride) {
    const i = v * 3
    points.push(new Vector3(positions[i]!, positions[i + 1]!, positions[i + 2]!))
  }
  return { kind: ColliderKind.Mesh, radius: 0, points, inverseInertia: boxInverseInertia(half) }
}

/**
 * Half-extents (into `outHalf`) and bounding radius of a vertex array, assuming
 * the mesh is centred on the origin (the loaders normalize it so).
 *
 * @param positions - Flat `[x, y, z, ...]` vertex buffer.
 * @param outHalf - Filled with the per-axis half-extents (floored at 0.5).
 * @returns The bounding radius (floored at 0.5).
 */
export function meshBounds(positions: Float32Array, outHalf: Vector3): number {
  let hx = 0
  let hy = 0
  let hz = 0
  let radiusSquared = 0
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]!
    const y = positions[i + 1]!
    const z = positions[i + 2]!
    hx = Math.max(hx, Math.abs(x))
    hy = Math.max(hy, Math.abs(y))
    hz = Math.max(hz, Math.abs(z))
    radiusSquared = Math.max(radiusSquared, x * x + y * y + z * z)
  }
  outHalf.set(hx || 0.5, hy || 0.5, hz || 0.5)
  return Math.sqrt(radiusSquared) || 0.5
}

/**
 * Inverse diagonal inertia of a solid box with half-extents `half` and unit
 * mass: I = (1/3)·diag(hy²+hz², hx²+hz², hx²+hy²).
 *
 * @param half - Box half-extents.
 * @returns The diagonal of I⁻¹ as a {@link Vector3}.
 */
export function boxInverseInertia(half: Vector3): Vector3 {
  return new Vector3(
    3 / (half.y * half.y + half.z * half.z),
    3 / (half.x * half.x + half.z * half.z),
    3 / (half.x * half.x + half.y * half.y),
  )
}
