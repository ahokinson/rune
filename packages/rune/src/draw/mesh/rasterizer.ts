/**
 * Software triangle rasterizer for the 3D mesh pass. Transforms by the model
 * matrix, near-clips in view space, perspective-projects, culls back faces, and
 * fills each triangle perspective-correct with a per-subpixel depth test into a
 * {@link SubpixelTarget}; colour comes from a caller-supplied {@link MeshShader}.
 *
 * @module
 */

import { type Camera3D, PerspectiveProjector3D, type Viewport3D } from "@/geom/camera3d"
import type { Matrix4 } from "@/math/matrix4"
import { Vector3 } from "@/math/vector3"
import type { Canvas } from "../canvas"
import { Color, type SurfaceColor } from "../color"
import type { SubpixelTarget } from "./subpixelTarget"

/**
 * An indexed triangle mesh in flat typed arrays. `positions` and `normals` hold
 * 3 numbers per vertex, `uvs` 2, and `indices` 3 per triangle. `normals`/`uvs`
 * are optional: with no normals each face is flat-shaded from its geometric
 * normal; with no uvs texture coordinates read as (0, 0).
 */
export interface Mesh {
  positions: Float32Array
  indices: Uint32Array
  uvs?: Float32Array
  normals?: Float32Array
}

/**
 * One covered subpixel handed to a {@link MeshShader}. World position and normal
 * are perspective-correct and in world space (the normal is interpolated, not
 * renormalised — shaders that need a unit normal should normalise it). `depth`
 * is view-space distance along the camera forward axis (for fog/debug).
 */
export interface Fragment {
  u: number
  v: number
  worldX: number
  worldY: number
  worldZ: number
  normalX: number
  normalY: number
  normalZ: number
  depth: number
  screenX: number
  screenY: number
}

/**
 * Per-fragment colour seam, mirroring {@link SurfaceShader}. Fills `out` (RGB,
 * 0–255) for the given fragment. The renderer adds no lighting or fog of its own.
 */
export interface MeshShader {
  shade(fragment: Fragment, out: SurfaceColor): void
}

/** Options for {@link renderMesh}. */
export interface RenderMeshContext {
  /**
   * Resolved to here after the mesh is drawn into `target`. Omit to render depth
   * and colour into `target` only (e.g. a shadow-map depth pass) without blitting
   * to a canvas.
   */
  canvas?: Canvas
  camera: Camera3D
  /**
   * Placement + scale in subpixel coordinates (centerX/centerY/radius in
   * `target` subpixels; aspectY ~1 since subpixels are ~square).
   */
  viewport: Viewport3D
  /** Persistent colour + depth buffer, cleared by the caller each frame. */
  target: SubpixelTarget
  mesh: Mesh
  model: Matrix4
  shader: MeshShader
  /** View-space near plane; triangles are clipped against it. Default 0.05. */
  near?: number
  /** Cull triangles facing away from the camera. Default true. */
  cullBackface?: boolean
  /** Draw triangle edges instead of filled faces. Default false. */
  wireframe?: boolean
}

/**
 * Packed per-vertex attributes carried through clipping. One vertex = STRIDE
 * contiguous lanes: view right/up/z, world xyz, normal xyz, uv.
 */
const STRIDE = 11
const VRIGHT = 0
const VUP = 1
const VZ = 2
const WX = 3
const WY = 4
const WZ = 5
const NX = 6
const NY = 7
const NZ = 8
const U = 9
const V = 10

/**
 * Packed per-vertex projected attributes: screen x/y, 1/zv, then each
 * interpolatable attribute pre-multiplied by 1/zv for perspective-correct
 * interpolation (recovered by dividing the interpolated value by interpolated
 * 1/zv). Same lane order as STRIDE for the attribute block.
 */
const PSTRIDE = 11
const PSX = 0
const PSY = 1
const PINVZ = 2
const PWX = 3
// PWY..PV follow at PWX + (lane - WX).

/**
 * Source triangle (3 vertices) and the near-clip output polygon (≤4 vertices,
 * padded). Module-level so a frame never allocates.
 */
const source = new Float64Array(3 * STRIDE)
const clipped = new Float64Array(8 * STRIDE)
const projected = new Float64Array(8 * PSTRIDE)

const eye = new Vector3()
const scratchPoint = new Vector3()
const scratchNormal = new Vector3()
const fragment: Fragment = {
  u: 0,
  v: 0,
  worldX: 0,
  worldY: 0,
  worldZ: 0,
  normalX: 0,
  normalY: 0,
  normalZ: 0,
  depth: 0,
  screenX: 0,
  screenY: 0,
}
const fragmentColor: SurfaceColor = { r: 0, g: 0, b: 0 }

/**
 * Camera basis (forward/right/up), recomputed each call. Matches camera3d's
 * computeBasis: right = up × forward, up = forward × right, both normalised.
 */
let fX = 0
let fY = 0
let fZ = 0
let rX = 0
let rY = 0
let rZ = 0
let uX = 0
let uY = 0
let uZ = 0

function computeBasis(camera: Camera3D): void {
  let cx = camera.forward.x
  let cy = camera.forward.y
  let cz = camera.forward.z
  const fl = Math.hypot(cx, cy, cz) || 1
  fX = cx / fl
  fY = cy / fl
  fZ = cz / fl

  const ux = camera.up.x
  const uy = camera.up.y
  const uz = camera.up.z
  cx = uy * fZ - uz * fY
  cy = uz * fX - ux * fZ
  cz = ux * fY - uy * fX
  const rl = Math.hypot(cx, cy, cz) || 1
  rX = cx / rl
  rY = cy / rl
  rZ = cz / rl

  uX = fY * rZ - fZ * rY
  uY = fZ * rX - fX * rZ
  uZ = fX * rY - fY * rX
}

/**
 * Render an indexed triangle mesh into `target` (a SubpixelTarget the caller
 * cleared this frame) and resolve it onto `canvas`. The pipeline transforms by
 * `model`, clips against the near plane in view space, projects with
 * perspective, culls back faces, and fills each triangle perspective-correct
 * with a per-subpixel depth test — colour comes from `shader`.
 *
 * @param context - Draw parameters (camera, viewport, target, mesh, shader, …).
 */
export function renderMesh(context: RenderMeshContext): void {
  const { camera, viewport, target, mesh, model, shader } = context
  const near = context.near ?? 0.05
  const cullBackface = context.cullBackface ?? true
  const wireframe = context.wireframe ?? false

  computeBasis(camera)
  eye.copyFrom(camera.position)

  const projector = camera.projector
  const fov = projector instanceof PerspectiveProjector3D ? projector.fieldOfView : Math.PI / 3
  const tan = Math.tan(fov / 2)
  const halfWidth = viewport.radius
  const centerX = viewport.centerX
  const centerY = viewport.centerY
  const aspectY = viewport.aspectY
  const width = target.width
  const height = target.height

  const positions = mesh.positions
  const indices = mesh.indices
  const normals = mesh.normals
  const uvs = mesh.uvs
  const hasNormals = normals !== undefined

  for (let t = 0; t < indices.length; t += 3) {
    const i0 = indices[t]!
    const i1 = indices[t + 1]!
    const i2 = indices[t + 2]!

    loadVertex(positions, normals, uvs, model, i0, 0)
    loadVertex(positions, normals, uvs, model, i1, 1)
    loadVertex(positions, normals, uvs, model, i2, 2)

    if (!hasNormals) applyFaceNormal()

    const clippedCount = clipNearPlane(near)
    if (clippedCount < 3) continue

    // Project every clipped vertex once, then fan-triangulate.
    for (let k = 0; k < clippedCount; k++) {
      const c = k * STRIDE
      const p = k * PSTRIDE
      const vz = clipped[c + VZ]!
      const invZ = 1 / vz
      const ndcX = (clipped[c + VRIGHT]! / (vz * tan)) * halfWidth
      const ndcY = (clipped[c + VUP]! / (vz * tan)) * halfWidth * aspectY
      projected[p + PSX] = centerX + ndcX
      projected[p + PSY] = centerY - ndcY
      projected[p + PINVZ] = invZ
      for (let lane = WX; lane <= V; lane++) {
        projected[p + PWX + (lane - WX)] = clipped[c + lane]! * invZ
      }
    }

    for (let k = 1; k < clippedCount - 1; k++) {
      if (wireframe) drawWireframeTriangle(shader, 0, k, k + 1, width, height, cullBackface, target)
      else rasterizeTriangle(shader, 0, k, k + 1, width, height, cullBackface, target)
    }
  }

  if (context.canvas) target.resolveTo(context.canvas)
}

/**
 * Transform vertex `index` by the model matrix into source slot `slot` (0–2):
 * world position, world normal (if present), uv, and view-space coordinates.
 */
function loadVertex(
  positions: Float32Array,
  normals: Float32Array | undefined,
  uvs: Float32Array | undefined,
  model: Matrix4,
  index: number,
  slot: number,
): void {
  const o = slot * STRIDE
  const pi = index * 3
  model.transformPointInto(scratchPoint, positions[pi]!, positions[pi + 1]!, positions[pi + 2]!)
  const wx = scratchPoint.x
  const wy = scratchPoint.y
  const wz = scratchPoint.z
  source[o + WX] = wx
  source[o + WY] = wy
  source[o + WZ] = wz

  if (normals) {
    model.transformDirectionInto(scratchNormal, normals[pi]!, normals[pi + 1]!, normals[pi + 2]!)
    const nl = Math.hypot(scratchNormal.x, scratchNormal.y, scratchNormal.z) || 1
    source[o + NX] = scratchNormal.x / nl
    source[o + NY] = scratchNormal.y / nl
    source[o + NZ] = scratchNormal.z / nl
  }

  if (uvs) {
    const ui = index * 2
    source[o + U] = uvs[ui]!
    source[o + V] = uvs[ui + 1]!
  } else {
    source[o + U] = 0
    source[o + V] = 0
  }

  // View space relative to the eye, projected onto the camera basis.
  const dx = wx - eye.x
  const dy = wy - eye.y
  const dz = wz - eye.z
  source[o + VRIGHT] = dx * rX + dy * rY + dz * rZ
  source[o + VUP] = dx * uX + dy * uY + dz * uZ
  source[o + VZ] = dx * fX + dy * fY + dz * fZ
}

/**
 * Flat-shade: derive one geometric normal from the source triangle's world
 * positions and write it to all three vertices.
 */
function applyFaceNormal(): void {
  const ax = source[WX]!
  const ay = source[WY]!
  const az = source[WZ]!
  const ex1 = source[STRIDE + WX]! - ax
  const ey1 = source[STRIDE + WY]! - ay
  const ez1 = source[STRIDE + WZ]! - az
  const ex2 = source[2 * STRIDE + WX]! - ax
  const ey2 = source[2 * STRIDE + WY]! - ay
  const ez2 = source[2 * STRIDE + WZ]! - az
  let nx = ey1 * ez2 - ez1 * ey2
  let ny = ez1 * ex2 - ex1 * ez2
  let nz = ex1 * ey2 - ey1 * ex2
  const nl = Math.hypot(nx, ny, nz) || 1
  nx /= nl
  ny /= nl
  nz /= nl
  for (let s = 0; s < 3; s++) {
    const o = s * STRIDE
    source[o + NX] = nx
    source[o + NY] = ny
    source[o + NZ] = nz
  }
}

/**
 * Clip the source triangle against the view-space near plane (zv ≥ near) with
 * Sutherland–Hodgman, writing the resulting polygon into `clipped` and returning
 * its vertex count (0, or 3–4). Attributes are linearly interpolated at crossings.
 */
function clipNearPlane(near: number): number {
  let count = 0
  for (let i = 0; i < 3; i++) {
    const curr = i * STRIDE
    const next = ((i + 1) % 3) * STRIDE
    const currZ = source[curr + VZ]!
    const nextZ = source[next + VZ]!
    const currInside = currZ >= near
    const nextInside = nextZ >= near

    if (currInside) {
      const out = count * STRIDE
      for (let lane = 0; lane < STRIDE; lane++) clipped[out + lane] = source[curr + lane]!
      count++
    }
    if (currInside !== nextInside) {
      const denom = nextZ - currZ
      const tt = denom === 0 ? 0 : (near - currZ) / denom
      const out = count * STRIDE
      for (let lane = 0; lane < STRIDE; lane++) {
        const a = source[curr + lane]!
        clipped[out + lane] = a + (source[next + lane]! - a) * tt
      }
      count++
    }
  }
  return count
}

/**
 * Rasterize one projected triangle (vertices at projected slots ia/ib/ic) with a
 * perspective-correct fill and per-subpixel depth test. Vertices are reordered to
 * positive screen area so the inside test and barycentrics share one convention.
 */
function rasterizeTriangle(
  shader: MeshShader,
  ia: number,
  ib: number,
  ic: number,
  width: number,
  height: number,
  cullBackface: boolean,
  target: SubpixelTarget,
): void {
  const pa = ia * PSTRIDE
  let pb = ib * PSTRIDE
  let pc = ic * PSTRIDE
  const x0 = projected[pa + PSX]!
  const y0 = projected[pa + PSY]!
  let x1 = projected[pb + PSX]!
  let y1 = projected[pb + PSY]!
  let x2 = projected[pc + PSX]!
  let y2 = projected[pc + PSY]!

  let area2 = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)
  // Screen Y points down, so a front face (CCW seen by the camera) has area2 < 0.
  const frontFacing = area2 < 0
  if (cullBackface && !frontFacing) return
  if (area2 > -1e-9 && area2 < 1e-9) return
  if (area2 < 0) {
    // Reorder to positive area for a single rasterization convention.
    const tp = pb
    pb = pc
    pc = tp
    let previous = x1
    x1 = x2
    x2 = previous
    previous = y1
    y1 = y2
    y2 = previous
    area2 = -area2
  }
  const invArea = 1 / area2

  let minX = Math.floor(Math.min(x0, x1, x2))
  let maxX = Math.ceil(Math.max(x0, x1, x2))
  let minY = Math.floor(Math.min(y0, y1, y2))
  let maxY = Math.ceil(Math.max(y0, y1, y2))
  if (minX < 0) minX = 0
  if (minY < 0) minY = 0
  if (maxX > width - 1) maxX = width - 1
  if (maxY > height - 1) maxY = height - 1

  const invZ0 = projected[pa + PINVZ]!
  const invZ1 = projected[pb + PINVZ]!
  const invZ2 = projected[pc + PINVZ]!
  const depth = target.depth

  for (let py = minY; py <= maxY; py++) {
    const sy = py + 0.5
    const rowOffset = py * width
    for (let px = minX; px <= maxX; px++) {
      const sx = px + 0.5
      const e0 = (x2 - x1) * (sy - y1) - (y2 - y1) * (sx - x1)
      if (e0 < 0) continue
      const e1 = (x0 - x2) * (sy - y2) - (y0 - y2) * (sx - x2)
      if (e1 < 0) continue
      const e2 = (x1 - x0) * (sy - y0) - (y1 - y0) * (sx - x0)
      if (e2 < 0) continue

      const w0 = e0 * invArea
      const w1 = e1 * invArea
      const w2 = e2 * invArea
      const invZ = w0 * invZ0 + w1 * invZ1 + w2 * invZ2

      const idx = rowOffset + px
      if (invZ <= depth[idx]!) continue

      const recip = 1 / invZ
      fillFragment(pa, pb, pc, w0, w1, w2, recip, px, py)
      shader.shade(fragment, fragmentColor)
      target.setUnsafe(px, py, fragmentColor.r, fragmentColor.g, fragmentColor.b)
      depth[idx] = invZ
    }
  }
}

/**
 * Recover perspective-correct attributes for a covered subpixel and fill the
 * shared fragment. `recip` is 1 / interpolated(1/zv).
 */
function fillFragment(
  pa: number,
  pb: number,
  pc: number,
  w0: number,
  w1: number,
  w2: number,
  recip: number,
  px: number,
  py: number,
): void {
  fragment.worldX = (w0 * projected[pa + PWX]! + w1 * projected[pb + PWX]! + w2 * projected[pc + PWX]!) * recip
  fragment.worldY =
    (w0 * projected[pa + PWX + 1]! + w1 * projected[pb + PWX + 1]! + w2 * projected[pc + PWX + 1]!) * recip
  fragment.worldZ =
    (w0 * projected[pa + PWX + 2]! + w1 * projected[pb + PWX + 2]! + w2 * projected[pc + PWX + 2]!) * recip
  fragment.normalX =
    (w0 * projected[pa + PWX + 3]! + w1 * projected[pb + PWX + 3]! + w2 * projected[pc + PWX + 3]!) * recip
  fragment.normalY =
    (w0 * projected[pa + PWX + 4]! + w1 * projected[pb + PWX + 4]! + w2 * projected[pc + PWX + 4]!) * recip
  fragment.normalZ =
    (w0 * projected[pa + PWX + 5]! + w1 * projected[pb + PWX + 5]! + w2 * projected[pc + PWX + 5]!) * recip
  fragment.u = (w0 * projected[pa + PWX + 6]! + w1 * projected[pb + PWX + 6]! + w2 * projected[pc + PWX + 6]!) * recip
  fragment.v = (w0 * projected[pa + PWX + 7]! + w1 * projected[pb + PWX + 7]! + w2 * projected[pc + PWX + 7]!) * recip
  fragment.depth = recip
  fragment.screenX = px
  fragment.screenY = py
}

/**
 * Draw the three edges of a projected triangle as depth-tested lines. Attributes
 * are lerped linearly in screen space from the (raw, unprojected) clipped
 * vertices — fine for thin wireframe strokes.
 */
function drawWireframeTriangle(
  shader: MeshShader,
  ia: number,
  ib: number,
  ic: number,
  width: number,
  height: number,
  cullBackface: boolean,
  target: SubpixelTarget,
): void {
  if (cullBackface) {
    const pa = ia * PSTRIDE
    const pb = ib * PSTRIDE
    const pc = ic * PSTRIDE
    const area2 =
      (projected[pb + PSX]! - projected[pa + PSX]!) * (projected[pc + PSY]! - projected[pa + PSY]!) -
      (projected[pc + PSX]! - projected[pa + PSX]!) * (projected[pb + PSY]! - projected[pa + PSY]!)
    if (area2 >= 0) return
  }
  drawEdge(shader, ia, ib, width, height, target)
  drawEdge(shader, ib, ic, width, height, target)
  drawEdge(shader, ic, ia, width, height, target)
}

function drawEdge(
  shader: MeshShader,
  a: number,
  b: number,
  width: number,
  height: number,
  target: SubpixelTarget,
): void {
  const pa = a * PSTRIDE
  const pb = b * PSTRIDE
  const ax = projected[pa + PSX]!
  const ay = projected[pa + PSY]!
  const bx = projected[pb + PSX]!
  const by = projected[pb + PSY]!
  const dx = bx - ax
  const dy = by - ay
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))))
  const ca = a * STRIDE
  const cb = b * STRIDE
  const invZa = projected[pa + PINVZ]!
  const invZb = projected[pb + PINVZ]!
  const depth = target.depth

  for (let i = 0; i <= steps; i++) {
    const tt = i / steps
    const px = Math.round(ax + dx * tt)
    const py = Math.round(ay + dy * tt)
    if (px < 0 || py < 0 || px >= width || py >= height) continue
    const invZ = invZa + (invZb - invZa) * tt
    const idx = py * width + px
    if (invZ <= depth[idx]!) continue

    fragment.worldX = lerpLane(ca, cb, WX, tt)
    fragment.worldY = lerpLane(ca, cb, WY, tt)
    fragment.worldZ = lerpLane(ca, cb, WZ, tt)
    fragment.normalX = lerpLane(ca, cb, NX, tt)
    fragment.normalY = lerpLane(ca, cb, NY, tt)
    fragment.normalZ = lerpLane(ca, cb, NZ, tt)
    fragment.u = lerpLane(ca, cb, U, tt)
    fragment.v = lerpLane(ca, cb, V, tt)
    fragment.depth = invZ === 0 ? 0 : 1 / invZ
    fragment.screenX = px
    fragment.screenY = py
    shader.shade(fragment, fragmentColor)
    target.setUnsafe(px, py, fragmentColor.r, fragmentColor.g, fragmentColor.b)
    depth[idx] = invZ
  }
}

function lerpLane(ca: number, cb: number, lane: number, tt: number): number {
  const a = clipped[ca + lane]!
  return a + (clipped[cb + lane]! - a) * tt
}

/** Re-export so callers can build a default clear colour without a separate import. */
export const MESH_DEFAULT_CLEAR = Color.fromBytes(8, 10, 14)
