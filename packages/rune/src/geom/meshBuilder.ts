import type { Mesh } from "../draw/mesh/rasterizer"
import { sampleSpline } from "./spline"

/**
 * Procedural mesh construction: revolve a profile ({@link lathe}) or sweep a
 * circle along a path ({@link sweepTube}) into surface parts, then concatenate
 * them into a single indexed {@link Mesh} with {@link mergeParts}. Complements
 * the OBJ loader (parseObj) for geometry that is cheaper to generate than to
 * ship. Output matches the flat-typed-array shape renderMesh consumes.
 *
 * @module
 */

/**
 * A growing mesh part in plain arrays, ready to be concatenated by
 * {@link mergeParts}. positions/normals hold 3 numbers per vertex, uvs 2, and
 * indices 3 per triangle.
 */
export interface MeshPart {
  positions: number[]
  normals: number[]
  uvs: number[]
  indices: number[]
}

function emptyPart(): MeshPart {
  return { positions: [], normals: [], uvs: [], indices: [] }
}

/**
 * Total triangle count of a mesh (indices / 3).
 *
 * @param mesh - Mesh to measure.
 * @returns Number of triangles.
 */
export function triangleCount(mesh: Mesh): number {
  return mesh.indices.length / 3
}

/**
 * Lathe a 2D profile of `[radius, height]` knots around the Y axis into a surface
 * of revolution. `radialSegments` divides the sweep, `profileSamples` densifies
 * each profile span (via Catmull–Rom). Meridian normals come from the
 * finite-difference profile tangent rotated 90°, then swept. `vOffset` shifts
 * the uv v-range so stacked parts tile cleanly.
 *
 * @param profileKnots - `[radius, height]` knots defining the profile curve.
 * @param radialSegments - Divisions of the full revolution.
 * @param profileSamples - Points sampled per profile span (Catmull–Rom densification).
 * @param vOffset - UV v-range shift so stacked parts tile cleanly.
 * @returns A {@link MeshPart} for the revolved surface.
 */
export function lathe(
  profileKnots: number[][],
  radialSegments: number,
  profileSamples: number,
  vOffset: number,
): MeshPart {
  const part = emptyPart()
  const profile = sampleSpline(profileKnots, profileSamples)
  const rows = profile.length
  const cols = radialSegments

  for (let r = 0; r < rows; r++) {
    const [pr, py] = profile[r]!
    // Finite-difference profile tangent → outward meridian normal (dy, -dr).
    const prev = profile[Math.max(0, r - 1)]!
    const next = profile[Math.min(rows - 1, r + 1)]!
    const dr = next[0]! - prev[0]!
    const dy = next[1]! - prev[1]!
    const ml = Math.hypot(dr, dy) || 1
    const nr = dy / ml
    const ny = -dr / ml

    for (let c = 0; c <= cols; c++) {
      const theta = (c / cols) * Math.PI * 2
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)
      part.positions.push(pr! * cos, py!, pr! * sin)
      part.normals.push(nr * cos, ny, nr * sin)
      part.uvs.push(c / cols, vOffset + r / rows)
    }
  }

  const stride = cols + 1
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * stride + c
      const b = a + stride
      part.indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }
  return part
}

/**
 * Sweep a circular cross-section of `radiusAt(t)` along a 3D Catmull–Rom path
 * (`pathKnots` are `[x, y, z]` knots). `pathSamples` densifies the path,
 * `tubeSegments` divides the tube. A parallel-transport-ish frame is rebuilt per
 * sample from the path tangent and a reference up so the tube does not pinch.
 *
 * @param pathKnots - `[x, y, z]` knots defining the centreline.
 * @param radiusAt - Function returning the tube radius at param `t` (0..1).
 * @param pathSamples - Points sampled along the path (Catmull–Rom densification).
 * @param tubeSegments - Divisions of the circular cross-section.
 * @returns A {@link MeshPart} for the swept tube.
 */
export function sweepTube(
  pathKnots: number[][],
  radiusAt: (t: number) => number,
  pathSamples: number,
  tubeSegments: number,
): MeshPart {
  const part = emptyPart()
  const path = sampleSpline(pathKnots, pathSamples)
  const rows = path.length

  for (let r = 0; r < rows; r++) {
    const center = path[r]!
    const prev = path[Math.max(0, r - 1)]!
    const next = path[Math.min(rows - 1, r + 1)]!
    let tx = next[0]! - prev[0]!
    let ty = next[1]! - prev[1]!
    let tz = next[2]! - prev[2]!
    const tl = Math.hypot(tx, ty, tz) || 1
    tx /= tl
    ty /= tl
    tz /= tl

    // right = tangent × up, up' = right × tangent (re-orthogonalised).
    const upX = Math.abs(ty) > 0.9 ? 1 : 0
    const upY = Math.abs(ty) > 0.9 ? 0 : 1
    let rx = ty * 0 - tz * upY
    let ry = tz * upX - tx * 0
    let rz = tx * upY - ty * upX
    const rl = Math.hypot(rx, ry, rz) || 1
    rx /= rl
    ry /= rl
    rz /= rl
    const ux = ty * rz - tz * ry
    const uy = tz * rx - tx * rz
    const uz = tx * ry - ty * rx

    const radius = radiusAt(r / (rows - 1))
    for (let c = 0; c <= tubeSegments; c++) {
      const phi = (c / tubeSegments) * Math.PI * 2
      const cos = Math.cos(phi)
      const sin = Math.sin(phi)
      const nx = rx * cos + ux * sin
      const ny = ry * cos + uy * sin
      const nz = rz * cos + uz * sin
      part.positions.push(center[0]! + nx * radius, center[1]! + ny * radius, center[2]! + nz * radius)
      part.normals.push(nx, ny, nz)
      part.uvs.push(r / rows, c / tubeSegments)
    }
  }

  const stride = tubeSegments + 1
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < tubeSegments; c++) {
      const a = r * stride + c
      const b = a + stride
      part.indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }
  return part
}

/**
 * Concatenate parts into one indexed mesh, offsetting each part's indices by the
 * running vertex count.
 *
 * @param parts - Mesh parts to merge.
 * @returns A single indexed {@link Mesh}.
 */
export function mergeParts(parts: MeshPart[]): Mesh {
  let vertexCount = 0
  let indexCount = 0
  for (const p of parts) {
    vertexCount += p.positions.length / 3
    indexCount += p.indices.length
  }
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)
  const indices = new Uint32Array(indexCount)

  let baseVertex = 0
  let posOffset = 0
  let uvOffset = 0
  let idxOffset = 0
  for (const p of parts) {
    positions.set(p.positions, posOffset)
    normals.set(p.normals, posOffset)
    uvs.set(p.uvs, uvOffset)
    for (let i = 0; i < p.indices.length; i++) indices[idxOffset + i] = p.indices[i]! + baseVertex
    baseVertex += p.positions.length / 3
    posOffset += p.positions.length
    uvOffset += p.uvs.length
    idxOffset += p.indices.length
  }
  return { positions, indices, normals, uvs }
}

/**
 * Reverse each triangle's winding in place (swap the 2nd and 3rd index),
 * flipping which side faces the camera. Normals are untouched, so lighting is
 * unaffected. Returns the same mesh for chaining.
 *
 * @param mesh - Mesh to rewind (mutated in place).
 * @returns The same `mesh`.
 */
export function reverseWinding(mesh: Mesh): Mesh {
  const idx = mesh.indices
  for (let i = 0; i < idx.length; i += 3) {
    const t = idx[i + 1]!
    idx[i + 1] = idx[i + 2]!
    idx[i + 2] = t
  }
  return mesh
}
