import type { Mesh } from "@/draw/mesh/rasterizer"

/**
 * Minimal Wavefront OBJ loader: parses `v`/`vn`/`vt`/`f` geometry into the flat
 * {@link Mesh} shape the renderer consumes, plus a normalize helper to
 * recentre and rescale loaded models.
 *
 * @module
 */

/**
 * A minimal Wavefront OBJ parser → {@link Mesh}. Handles `v`, `vn`, `vt`, and
 * `f` with `a`, `a/b`, `a//c`, or `a/b/c` vertex references (1-based, negative
 * allowed), triangulating polygons as a fan. Face-vertices with distinct
 * position/uv/normal triples become distinct mesh vertices. Normals and uvs are
 * emitted only when every face-vertex supplies them (so a normal-less OBJ falls
 * back to the renderer's flat shading).
 *
 * @param text - Raw OBJ source text.
 * @returns A {@link Mesh} with positions, indices, and (when present) normals/uvs.
 */
export function parseObj(text: string): Mesh {
  const inPositions: number[] = []
  const inNormals: number[] = []
  const inUvs: number[] = []

  const outPositions: number[] = []
  const outNormals: number[] = []
  const outUvs: number[] = []
  const outIndices: number[] = []
  const cache = new Map<string, number>()

  let everyHasNormal = true
  let everyHasUv = true

  function resolve(index: number, count: number): number {
    // OBJ indices are 1-based; negatives count back from the end.
    return index > 0 ? index - 1 : count + index
  }

  function vertexFor(token: string): number {
    const cached = cache.get(token)
    if (cached !== undefined) return cached
    const parts = token.split("/")
    const vi = resolve(Number.parseInt(parts[0]!, 10), inPositions.length / 3)
    outPositions.push(inPositions[vi * 3]!, inPositions[vi * 3 + 1]!, inPositions[vi * 3 + 2]!)

    if (parts[1]) {
      const ti = resolve(Number.parseInt(parts[1], 10), inUvs.length / 2)
      outUvs.push(inUvs[ti * 2]!, inUvs[ti * 2 + 1]!)
    } else {
      everyHasUv = false
      outUvs.push(0, 0)
    }

    if (parts[2]) {
      const ni = resolve(Number.parseInt(parts[2], 10), inNormals.length / 3)
      outNormals.push(inNormals[ni * 3]!, inNormals[ni * 3 + 1]!, inNormals[ni * 3 + 2]!)
    } else {
      everyHasNormal = false
      outNormals.push(0, 0, 0)
    }

    const index = outPositions.length / 3 - 1
    cache.set(token, index)
    return index
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim()
    if (line.length === 0 || line.startsWith("#")) continue
    const fields = line.split(/\s+/)
    const tag = fields[0]
    if (tag === "v") {
      inPositions.push(Number(fields[1]), Number(fields[2]), Number(fields[3]))
    } else if (tag === "vn") {
      inNormals.push(Number(fields[1]), Number(fields[2]), Number(fields[3]))
    } else if (tag === "vt") {
      inUvs.push(Number(fields[1]), Number(fields[2] ?? 0))
    } else if (tag === "f") {
      const tokens = fields.slice(1)
      // Fan-triangulate the polygon.
      for (let i = 1; i < tokens.length - 1; i++) {
        outIndices.push(vertexFor(tokens[0]!), vertexFor(tokens[i]!), vertexFor(tokens[i + 1]!))
      }
    }
  }

  const mesh: Mesh = {
    positions: new Float32Array(outPositions),
    indices: new Uint32Array(outIndices),
  }
  if (everyHasUv && inUvs.length > 0) mesh.uvs = new Float32Array(outUvs)
  if (everyHasNormal && inNormals.length > 0) mesh.normals = new Float32Array(outNormals)
  return mesh
}

/** Options for {@link normalizeMesh}. */
export interface NormalizeOptions {
  /** Largest bounding-box extent after scaling (mesh is recentred on the origin). */
  size?: number
  /** Remap axes per vertex, e.g. to turn a Z-up model Y-up. Returns `[x, y, z]`. */
  axisMap?: (x: number, y: number, z: number) => [number, number, number]
}

/**
 * Recentre a mesh on the origin and uniformly scale it to `size`, optionally
 * remapping axes (positions and normals alike). Mutates and returns the mesh —
 * the axis map is a pure rotation/reflection, so a reflection's winding flip is
 * corrected by reversing each triangle when the map is orientation-reversing.
 *
 * @param mesh - Mesh to normalise (mutated in place).
 * @param options - Size target and optional axis remap.
 * @returns The same `mesh`, recentred and scaled.
 */
export function normalizeMesh(mesh: Mesh, options: NormalizeOptions = {}): Mesh {
  const size = options.size ?? 1
  const map = options.axisMap
  const p = mesh.positions

  if (map) {
    for (let i = 0; i < p.length; i += 3) {
      const [x, y, z] = map(p[i]!, p[i + 1]!, p[i + 2]!)
      p[i] = x
      p[i + 1] = y
      p[i + 2] = z
    }
    if (mesh.normals) {
      const n = mesh.normals
      for (let i = 0; i < n.length; i += 3) {
        const [x, y, z] = map(n[i]!, n[i + 1]!, n[i + 2]!)
        n[i] = x
        n[i + 1] = y
        n[i + 2] = z
      }
    }
    // If the remap flips orientation (negative determinant), reverse winding.
    if (mapDeterminant(map) < 0) {
      const idx = mesh.indices
      for (let i = 0; i < idx.length; i += 3) {
        const previous = idx[i + 1]!
        idx[i + 1] = idx[i + 2]!
        idx[i + 2] = previous
      }
    }
  }

  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  for (let i = 0; i < p.length; i += 3) {
    minX = Math.min(minX, p[i]!)
    maxX = Math.max(maxX, p[i]!)
    minY = Math.min(minY, p[i + 1]!)
    maxY = Math.max(maxY, p[i + 1]!)
    minZ = Math.min(minZ, p[i + 2]!)
    maxZ = Math.max(maxZ, p[i + 2]!)
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const cz = (minZ + maxZ) / 2
  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1
  const scale = size / extent
  for (let i = 0; i < p.length; i += 3) {
    p[i] = (p[i]! - cx) * scale
    p[i + 1] = (p[i + 1]! - cy) * scale
    p[i + 2] = (p[i + 2]! - cz) * scale
  }
  return mesh
}

/**
 * Determinant of the 3×3 implied by an axis map, sampling the mapped basis.
 */
function mapDeterminant(map: (x: number, y: number, z: number) => [number, number, number]): number {
  const [ax, ay, az] = map(1, 0, 0)
  const [bx, by, bz] = map(0, 1, 0)
  const [cx, cy, cz] = map(0, 0, 1)
  return ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)
}
