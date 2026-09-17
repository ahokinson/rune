/**
 * Mesh-backed 3D entity: an {@link Entity3D} that draws an indexed triangle mesh
 * through the renderMesh rasterizer. Add it to a {@link Scene3D} created with
 * `subpixel: true` so it shares the scene's depth-tested target.
 *
 * @module
 */

import { type Mesh, type MeshShader, renderMesh } from "@/draw/mesh/rasterizer"
import type { Viewport3D } from "@/geom/camera3d"
import { Matrix4 } from "@/math/matrix4"
import { type Draw3DContext, Entity3D, type Entity3DOptions } from "./entity3d"

/** Options for constructing a {@link MeshEntity3D}. */
export interface MeshEntity3DOptions extends Entity3DOptions {
  /** Indexed triangle mesh to draw. */
  mesh: Mesh
  /** Shader used to colour each fragment. */
  shader: MeshShader
  /** Draw triangle edges instead of filled faces. Default `false`. */
  wireframe?: boolean
  /** Cull triangles facing away from the camera. Default `true`. */
  cullBackface?: boolean
  /** View-space near plane. Default renderMesh's `0.05`. */
  near?: number
  /**
   * Projection radius as a fraction of the smaller target dimension. Default
   * `0.5` (the mesh fills the view, matching the standalone teapot framing).
   */
  frameRadius?: number
}

/**
 * An {@link Entity3D} that draws an indexed triangle mesh through the renderMesh
 * rasterizer.
 *
 * It honours the inherited transform (folded into the model matrix, composed up
 * the parent chain) and draws into the scene's shared `SubpixelTarget` — so add
 * it to a {@link Scene3D} created with `subpixel: true`. The mesh, floor, and any
 * siblings share one depth-tested target, blitting correctly together.
 */
export class MeshEntity3D extends Entity3D {
  /** Indexed triangle mesh to draw. */
  mesh: Mesh
  /** Shader used to colour each fragment. */
  shader: MeshShader
  /** Whether to draw triangle edges instead of filled faces. */
  wireframe: boolean
  /** Whether to cull triangles facing away from the camera. */
  cullBackface: boolean
  /** View-space near plane override. */
  near?: number
  /** Projection radius as a fraction of the smaller target dimension. */
  frameRadius: number

  private readonly worldModel = new Matrix4()
  private readonly viewport: Viewport3D = { centerX: 0, centerY: 0, radius: 1, aspectY: 1 }

  /**
   * @param options - Construction options.
   */
  constructor(options: MeshEntity3DOptions) {
    super(options)
    this.mesh = options.mesh
    this.shader = options.shader
    this.wireframe = options.wireframe ?? false
    this.cullBackface = options.cullBackface ?? true
    this.near = options.near
    this.frameRadius = options.frameRadius ?? 0.5
  }

  /**
   * Draw the mesh into the shared subpixel target. No-op when `ctx.target` is
   * `null`.
   *
   * @param ctx - Shared draw context for this frame.
   */
  override draw(ctx: Draw3DContext): void {
    const target = ctx.target
    if (!target) return
    const viewport = this.viewport
    viewport.centerX = target.width / 2
    viewport.centerY = target.height / 2
    viewport.radius = Math.min(target.width, target.height) * this.frameRadius
    renderMesh({
      canvas: ctx.canvas,
      camera: ctx.camera,
      viewport,
      target,
      mesh: this.mesh,
      model: this.worldModelInto(this.worldModel),
      shader: this.shader,
      wireframe: this.wireframe,
      cullBackface: this.cullBackface,
      near: this.near,
    })
  }
}
