import { BRAILLE_BITS, brailleGlyph } from "@/draw/braille"
import type { Canvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { Vector3 } from "@/math/vector3"
import { type Draw3DContext, Entity3D } from "@/scene/entity3d"
import type { ProjectedPoint } from "./camera3d"
import type { SphereProjector, SurfaceSample } from "./sphereProjector"

/**
 * World-space 3D entity primitives: points, polylines, and implicit-surface
 * meshes. Each is an {@link Entity3D} the Scene3D auto-projects/culls/depth-orders
 * and draws each frame (low -> high zIndex so a surface can write depth before
 * points/arcs test it). They work in world space and leave the inherited
 * transform at identity, projecting their own world points directly.
 *
 * @module
 */

// ---------------------------------------------------------------------------
// Points
// ---------------------------------------------------------------------------

/**
 * Per-point draw callback — the game keeps full control of glyph/colour. Only
 * called for points that pass projection, the near cull, and (when occluding)
 * the depth test.
 */
export interface PointStyle {
  draw(canvas: Canvas, x: number, y: number, depth: number, index: number): void
}

/** Options for {@link PointCloud3D}. */
export interface PointCloud3DOptions {
  /** Draw order (lower draws first so it writes depth before later entities test). */
  zIndex?: number
  /**
   * Points nearer-facing than this depth are kept; the rest (grazing/far side)
   * are culled. Defaults to 0.1 to match the globe's city markers.
   */
  minDepth?: number
}

/**
 * A set of world-space points (e.g. map markers) projected to single glyphs.
 *
 * @example
 * ```ts
 * const cloud = new PointCloud3D([new Vector3(1, 0, 0)], style)
 * scene.add(cloud)
 * ```
 */
export class PointCloud3D extends Entity3D {
  /** World-space points to project. */
  points: Vector3[]
  /** Per-point draw callback. */
  style: PointStyle
  /** Minimum camera-facing depth; points below this are culled. */
  minDepth: number
  private _p: ProjectedPoint = { x: 0, y: 0, depth: 0 }

  /**
   * @param points - World-space points to project.
   * @param style - Per-point draw callback.
   * @param options - zIndex and depth cull.
   */
  constructor(points: Vector3[], style: PointStyle, options: PointCloud3DOptions = {}) {
    super({ zIndex: options.zIndex })
    this.points = points
    this.style = style
    this.minDepth = options.minDepth ?? 0.1
  }

  /**
   * Project each point, cull by depth, and draw the survivors via {@link PointCloud3D.style}.
   *
   * @param ctx - 3D draw context (camera, viewport, depth buffer, canvas).
   */
  override draw(ctx: Draw3DContext): void {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]
      if (!point) continue
      const r = ctx.camera.projectInto(this._p, point, 1, ctx.viewport)
      if (!r) continue
      if (r.depth < this.minDepth) continue
      if (ctx.occlude && !ctx.depth.testNearer(r.x, r.y, r.depth)) continue
      this.style.draw(ctx.canvas, r.x, r.y, r.depth, i)
    }
  }
}

// ---------------------------------------------------------------------------
// Polyline / great-circle arc
// ---------------------------------------------------------------------------

/**
 * One vertex of a polyline: a world point, an optional radial `altitude` lift
 * (>= 1, bows the line off a surface), and a param `t` (0..1 along the line) the
 * style can map to colour/animation (e.g. a travelling comet head).
 */
export interface PolylineVertex {
  point: Vector3
  altitude: number
  t: number
}

/**
 * Per-cell draw callback for the connected, depth-interpolated path. `t` is the
 * interpolated param at this cell; `lineIndex` distinguishes pooled polylines.
 */
export interface PolylineStyle {
  drawSegment(canvas: Canvas, x: number, y: number, depth: number, t: number, lineIndex: number): void
}

/** Options for {@link Polyline3D}. */
export interface Polyline3DOptions {
  /** Draw order (lower draws first). */
  zIndex?: number
}

/**
 * A world-space polyline. Each vertex is projected (culled vertices break the
 * line), consecutive screen points are connected with integer interpolation
 * (depth and `t` interpolated along the way), and each cell is depth-tested when
 * occluding. Vertices are a caller-owned buffer; set `count` to use only a
 * prefix (so the buffer can be reused across frames without reallocating).
 */
export class Polyline3D extends Entity3D {
  /** Caller-owned vertex buffer. */
  vertices: PolylineVertex[] = []
  /** Number of leading vertices to use; -1 means the whole array. */
  count = -1
  /** Per-cell draw callback. */
  style: PolylineStyle
  /** Index passed to {@link PolylineStyle.drawSegment} so pooled polylines differ. */
  lineIndex = 0
  // Two ping-pong screen-point buffers so a segment can reference the previous
  // vertex without per-vertex allocation.
  private _a: ProjectedPoint = { x: 0, y: 0, depth: 0 }
  private _b: ProjectedPoint = { x: 0, y: 0, depth: 0 }

  /**
   * @param style - Per-cell draw callback.
   * @param options - zIndex.
   */
  constructor(style: PolylineStyle, options: Polyline3DOptions = {}) {
    super({ zIndex: options.zIndex })
    this.style = style
  }

  /**
   * Project vertices, connect consecutive screen points with integer
   * interpolation, and depth-test each cell when occluding.
   *
   * @param ctx - 3D draw context.
   */
  override draw(ctx: Draw3DContext): void {
    const n = this.count >= 0 ? this.count : this.vertices.length
    let prev: ProjectedPoint | null = null
    let prevT = 0
    let useA = true

    for (let i = 0; i < n; i++) {
      const v = this.vertices[i]
      if (!v) {
        prev = null
        continue
      }
      const cur = useA ? this._a : this._b
      const r = ctx.camera.projectInto(cur, v.point, v.altitude, ctx.viewport)
      if (!r) {
        prev = null
        continue
      }

      if (prev) {
        const dx = r.x - prev.x
        const dy = r.y - prev.y
        const steps = Math.max(Math.abs(dx), Math.abs(dy), 1)
        for (let j = 1; j <= steps; j++) {
          const f = j / steps
          const ix = Math.round(prev.x + dx * f)
          const iy = Math.round(prev.y + dy * f)
          const dep = prev.depth + (r.depth - prev.depth) * f
          const tt = prevT + (v.t - prevT) * f
          if (ctx.occlude && !ctx.depth.testNearer(ix, iy, dep)) continue
          this.style.drawSegment(ctx.canvas, ix, iy, dep, tt, this.lineIndex)
        }
      } else if (!ctx.occlude || ctx.depth.testNearer(r.x, r.y, r.depth)) {
        // First visible vertex of a run: draw the lone point.
        this.style.drawSegment(ctx.canvas, r.x, r.y, r.depth, v.t, this.lineIndex)
      }

      prev = cur
      prevT = v.t
      useA = !useA
    }
  }
}

// ---------------------------------------------------------------------------
// Implicit-surface mesh (e.g. a sphere)
// ---------------------------------------------------------------------------

/**
 * The result of packing one screen cell of an implicit surface: a braille dot
 * mask plus the cell's foreground/background colours.
 */
export interface SurfaceCellResult {
  bits: number
  fg: Color
  bg: Color
}

/**
 * Game-supplied callback that turns sampled surface points into a drawn cell.
 * The engine walks the disc, runs the 2x4 braille sub-pixel grid per cell, and
 * for each on-surface sub-pixel calls `subpixel`; the game accumulates coverage
 * + shading, then `finishCell` packs it (return false to skip an empty cell).
 */
export interface SurfaceSampler {
  /** Start accumulating a new cell at `(cx, cy)`. */
  beginCell(cx: number, cy: number): void
  /** Accumulate one on-surface sub-pixel sample. */
  subpixel(sample: SurfaceSample, row: number, col: number, bit: number): void
  /** Pack the accumulated cell; return `false` to skip an empty cell. */
  finishCell(out: SurfaceCellResult): boolean
}

/** Options for {@link SurfaceMesh3D}. */
export interface SurfaceMesh3DOptions {
  /** Draw order (low so the surface writes depth before points/arcs test it). */
  zIndex?: number
}

/**
 * Renders an implicit surface by inverse-projecting each braille sub-pixel
 * against the sphere (per-cell raycast), driving a game sampler, and writing the
 * cell's far-most surface depth into the buffer so points/arcs occlude correctly.
 * Coupled to SphereProjector because implicit-surface raycasting needs its
 * surface-specialised inverse (`surfaceInto`).
 */
export class SurfaceMesh3D extends Entity3D {
  /** Sphere projector used for inverse sub-pixel raycasting. */
  projector: SphereProjector
  /** Game-supplied sampler that packs each cell. */
  sampler: SurfaceSampler
  private _sample: SurfaceSample = { theta: 0, phi: 0, normal: new Vector3(), depth: 0 }
  private _result: SurfaceCellResult = { bits: 0, fg: Color.BLACK, bg: Color.BLACK }

  /**
   * @param projector - Sphere projector for inverse raycasting.
   * @param sampler - Game-supplied cell sampler.
   * @param options - zIndex.
   */
  constructor(projector: SphereProjector, sampler: SurfaceSampler, options: SurfaceMesh3DOptions = {}) {
    super({ zIndex: options.zIndex })
    this.projector = projector
    this.sampler = sampler
  }

  /**
   * Walk the disc, run the 2x4 braille sub-pixel grid per cell, drive the
   * sampler, and write the cell's far-most surface depth into the buffer.
   *
   * @param ctx - 3D draw context.
   */
  override draw(ctx: Draw3DContext): void {
    const { canvas, viewport: vp } = ctx
    const radius = vp.radius
    const rY = Math.ceil(radius * vp.aspectY)
    const x0 = Math.max(1, Math.floor(vp.centerX - radius) - 1)
    const x1 = Math.min(canvas.width - 2, Math.ceil(vp.centerX + radius) + 1)
    const y0 = Math.max(1, Math.floor(vp.centerY - rY) - 1)
    const y1 = Math.min(canvas.height - 2, Math.ceil(vp.centerY + rY) + 1)

    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        this.sampler.beginCell(cx, cy)
        // Track the farthest (smallest depth) on-disc sub-pixel: a conservative
        // cell depth that won't self-occlude markers sitting on the surface.
        let minDepth = Number.POSITIVE_INFINITY
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 2; col++) {
            const fx = cx + (col + 0.5) / 2
            const fy = cy + (row + 0.5) / 4
            const s = this.projector.surfaceInto(this._sample, fx, fy, vp)
            if (!s) continue
            if (s.depth < minDepth) minDepth = s.depth
            this.sampler.subpixel(s, row, col, BRAILLE_BITS[row]![col]!)
          }
        }
        const res = this._result
        if (!this.sampler.finishCell(res)) continue
        canvas.setCell(cx, cy, brailleGlyph(res.bits), res.fg, res.bg)
        if (res.bits !== 0 && minDepth !== Number.POSITIVE_INFINITY) {
          ctx.depth.writeIfNearer(cx, cy, minDepth)
        }
      }
    }
  }
}
