import type { Mesh } from "../draw/mesh/rasterizer"

/**
 * Parametric solid primitives returning the flat-typed-array {@link Mesh} shape
 * renderMesh consumes. Each is centred on the origin (the plane excepted) with
 * smooth analytic normals and 0–1 uvs. Winding is CCW seen from outside, so
 * back-face culling keeps the outer shell under a camera looking down −z with an
 * up hint of −y (the engine's screen-y-down convention).
 *
 * @module
 */

/**
 * A cube of edge length `size`, spanning `[-size/2, size/2]³`. Built as six
 * independent quads so each face gets a flat outward normal and its own uv
 * square (shared-vertex cubes average normals across edges and look
 * unhelpfully smooth).
 *
 * @param size - Edge length (default 1).
 * @returns A cube {@link Mesh}.
 */
export function cubeMesh(size = 1): Mesh {
  // Per face: origin corner, two edge vectors, outward normal (unit-cube basis,
  // scaled by `size` into positions below).
  const faces = [
    { o: [-0.5, -0.5, 0.5], u: [1, 0, 0], v: [0, 1, 0], n: [0, 0, 1] }, // +z
    { o: [0.5, -0.5, -0.5], u: [-1, 0, 0], v: [0, 1, 0], n: [0, 0, -1] }, // -z
    { o: [0.5, -0.5, 0.5], u: [0, 0, -1], v: [0, 1, 0], n: [1, 0, 0] }, // +x
    { o: [-0.5, -0.5, -0.5], u: [0, 0, 1], v: [0, 1, 0], n: [-1, 0, 0] }, // -x
    { o: [-0.5, 0.5, 0.5], u: [1, 0, 0], v: [0, 0, -1], n: [0, 1, 0] }, // +y
    { o: [-0.5, -0.5, -0.5], u: [1, 0, 0], v: [0, 0, 1], n: [0, -1, 0] }, // -y
  ]

  const positions = new Float32Array(faces.length * 4 * 3)
  const normals = new Float32Array(faces.length * 4 * 3)
  const uvs = new Float32Array(faces.length * 4 * 2)
  const indices = new Uint32Array(faces.length * 6)
  const corners = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]

  for (let f = 0; f < faces.length; f++) {
    const face = faces[f]!
    for (let c = 0; c < 4; c++) {
      const [cu, cv] = corners[c]!
      const pi = (f * 4 + c) * 3
      for (let axis = 0; axis < 3; axis++) {
        positions[pi + axis] = (face.o[axis]! + face.u[axis]! * cu! + face.v[axis]! * cv!) * size
        normals[pi + axis] = face.n[axis]!
      }
      const ui = (f * 4 + c) * 2
      uvs[ui] = cu!
      uvs[ui + 1] = cv!
    }
    const base = f * 4
    const ii = f * 6
    indices[ii] = base
    indices[ii + 1] = base + 2
    indices[ii + 2] = base + 1
    indices[ii + 3] = base
    indices[ii + 4] = base + 3
    indices[ii + 5] = base + 2
  }

  return { positions, indices, normals, uvs }
}

/** Options for {@link sphereMesh}. */
export interface SphereMeshOptions {
  /** Sphere radius (default 0.5). */
  radius?: number
  /** Longitudinal divisions; latitudinal rings are half this. */
  segments?: number
}

/**
 * A UV sphere. Normals are the unit position; uvs are `(longitude, latitude)`.
 *
 * @param options - Radius and segment count.
 * @returns A sphere {@link Mesh}.
 */
export function sphereMesh(options: SphereMeshOptions = {}): Mesh {
  const radius = options.radius ?? 0.5
  const segments = options.segments ?? 24
  const cols = Math.max(3, segments)
  const rows = Math.max(2, Math.floor(segments / 2))
  const vertexCount = (rows + 1) * (cols + 1)

  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)

  let v = 0
  for (let row = 0; row <= rows; row++) {
    const theta = (row / rows) * Math.PI // 0..π, pole to pole
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)
    for (let col = 0; col <= cols; col++) {
      const phi = (col / cols) * Math.PI * 2
      const nx = sinTheta * Math.cos(phi)
      const ny = cosTheta
      const nz = sinTheta * Math.sin(phi)
      const p = v * 3
      positions[p] = nx * radius
      positions[p + 1] = ny * radius
      positions[p + 2] = nz * radius
      normals[p] = nx
      normals[p + 1] = ny
      normals[p + 2] = nz
      uvs[v * 2] = col / cols
      uvs[v * 2 + 1] = row / rows
      v++
    }
  }

  const indices = new Uint32Array(rows * cols * 6)
  let i = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col
      const b = a + cols + 1
      indices[i++] = a
      indices[i++] = b
      indices[i++] = a + 1
      indices[i++] = a + 1
      indices[i++] = b
      indices[i++] = b + 1
    }
  }

  return { positions, indices, normals, uvs }
}

/** Options for {@link torusMesh}. */
export interface TorusMeshOptions {
  /** Centre to tube centre. */
  ringRadius?: number
  /** Tube thickness. */
  tubeRadius?: number
  /** Divisions around the ring (default 36). */
  ringSegments?: number
  /** Divisions around the tube (default 18). */
  tubeSegments?: number
}

/**
 * A torus in the xz-plane. Normals point radially out of the tube; uvs wrap
 * `(around-ring, around-tube)`.
 *
 * @param options - Radii and segment counts.
 * @returns A torus {@link Mesh}.
 */
export function torusMesh(options: TorusMeshOptions = {}): Mesh {
  const ringRadius = options.ringRadius ?? 0.45
  const tubeRadius = options.tubeRadius ?? 0.2
  const ringSegments = options.ringSegments ?? 36
  const tubeSegments = options.tubeSegments ?? 18
  const vertexCount = (ringSegments + 1) * (tubeSegments + 1)
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)

  let v = 0
  for (let r = 0; r <= ringSegments; r++) {
    const u = (r / ringSegments) * Math.PI * 2
    const cosU = Math.cos(u)
    const sinU = Math.sin(u)
    for (let t = 0; t <= tubeSegments; t++) {
      const w = (t / tubeSegments) * Math.PI * 2
      const cosW = Math.cos(w)
      const sinW = Math.sin(w)
      const nx = cosW * cosU
      const ny = sinW
      const nz = cosW * sinU
      const p = v * 3
      positions[p] = (ringRadius + tubeRadius * cosW) * cosU
      positions[p + 1] = tubeRadius * sinW
      positions[p + 2] = (ringRadius + tubeRadius * cosW) * sinU
      normals[p] = nx
      normals[p + 1] = ny
      normals[p + 2] = nz
      uvs[v * 2] = r / ringSegments
      uvs[v * 2 + 1] = t / tubeSegments
      v++
    }
  }

  const indices = new Uint32Array(ringSegments * tubeSegments * 6)
  let i = 0
  for (let r = 0; r < ringSegments; r++) {
    for (let t = 0; t < tubeSegments; t++) {
      const a = r * (tubeSegments + 1) + t
      const b = a + tubeSegments + 1
      indices[i++] = a
      indices[i++] = b
      indices[i++] = a + 1
      indices[i++] = a + 1
      indices[i++] = b
      indices[i++] = b + 1
    }
  }

  return { positions, indices, normals, uvs }
}

/** Options for {@link planeMesh}. */
export interface PlaneMeshOptions {
  /** Half-extent: the plane spans `[-half, half]` in x and z. */
  half?: number
  /** Height (world y) the flat quad sits at. */
  y?: number
  /** How many times the uvs tile across the quad, for a repeating texture. */
  tiles?: number
}

/**
 * A flat quad in the xz-plane at height `y`. The normal points to screen-up (−y,
 * the engine's up hint) so the lit side faces the viewer; uvs tile `tiles` times.
 * Handy as a floor/ground a mesh's shadow falls on.
 *
 * @param options - Extent, height, and uv tiling.
 * @returns A plane {@link Mesh}.
 */
export function planeMesh(options: PlaneMeshOptions = {}): Mesh {
  const half = options.half ?? 4
  const y = options.y ?? 0.95
  const tiles = options.tiles ?? 8
  const positions = new Float32Array([-half, y, -half, half, y, -half, half, y, half, -half, y, half])
  const normals = new Float32Array([0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0])
  const uvs = new Float32Array([0, 0, tiles, 0, tiles, tiles, 0, tiles])
  const indices = new Uint32Array([0, 2, 1, 0, 3, 2])
  return { positions, indices, normals, uvs }
}
