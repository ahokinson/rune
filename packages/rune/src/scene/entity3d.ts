/**
 * 3D entity primitives: a renderable node in a {@link Scene3D} with a full 3D
 * transform (position + quaternion rotation + scale) that mesh-style subclasses
 * fold into their model matrix. World-space primitives (point clouds, arcs,
 * implicit surfaces) leave it at identity and project their own world points
 * directly. The {@link Scene3D} projects/culls/depth-orders and calls `draw()`
 * each frame in `zIndex` order.
 *
 * @module
 */

import type { Canvas } from "@/draw/canvas"
import type { SubpixelTarget } from "@/draw/mesh/subpixelTarget"
import type { GridDepthBuffer } from "@/draw/raycast/gridDepthBuffer"
import type { Camera3D, Viewport3D } from "@/geom/camera3d"
import { Matrix4 } from "@/math/matrix4"
import { Quaternion } from "@/math/quaternion"
import { Vector3 } from "@/math/vector3"
import { Entity, type EntityOptions } from "./entity"
import type { Scene3D } from "./scene3d"

/**
 * Everything a {@link Scene3D} hands an {@link Entity3D} to draw one frame.
 *
 * Two rasterizers share this context: the braille/projector primitives test/write
 * `depth` (a per-cell buffer; `occlude` toggles it), while renderMesh-based
 * entities draw into the shared `target` (a subpixel colour+depth buffer the scene
 * clears each frame). `target` is `null` unless the scene runs in subpixel mode.
 */
export interface Draw3DContext {
  /** Target canvas. */
  canvas: Canvas
  /** Active 3D camera. */
  camera: Camera3D
  /** Visible viewport in canvas pixels. */
  viewport: Viewport3D
  /** Per-cell depth buffer (LARGER = NEARER). */
  depth: GridDepthBuffer
  /** Whether to test/write against `depth` this frame. */
  occlude: boolean
  /** Shared subpixel target, or `null` when subpixel mode is off. */
  target: SubpixelTarget | null
}

/** Options for constructing an {@link Entity3D}. */
export interface Entity3DOptions extends EntityOptions {
  /** World-space position. Default `(0, 0, 0)`. */
  position?: Vector3
  /** Quaternion rotation. Default identity. */
  rotation?: Quaternion
  /** Per-axis scale. Default `(1, 1, 1)`. */
  scale?: Vector3
}

/**
 * A renderable node in a {@link Scene3D}.
 *
 * Carries a full 3D transform (position + quaternion rotation + scale) that a
 * mesh-style subclass folds into its model matrix; world-space primitives (point
 * clouds, arcs, implicit surfaces) leave it at identity and project their own
 * world points directly. The {@link Scene3D} projects/culls/depth-orders and calls
 * `draw()` each frame in `zIndex` order.
 */
export abstract class Entity3D extends Entity {
  /** World-space position. */
  position: Vector3
  /** Quaternion rotation. */
  rotation: Quaternion
  /** Per-axis scale. */
  scale: Vector3
  /** Containing scene, set when this entity is attached. */
  scene: Scene3D | null = null

  private readonly localModelCache = new Matrix4()

  /**
   * @param options - Construction options. All fields optional.
   */
  constructor(options: Entity3DOptions = {}) {
    super(options)
    this.position = options.position ?? new Vector3(0, 0, 0)
    this.rotation = options.rotation ?? new Quaternion()
    this.scale = options.scale ?? new Vector3(1, 1, 1)
  }

  /**
   * This entity's own transform as a matrix, recomposed each call into a shared
   * buffer (transforms are mutated in place, so there's nothing safe to cache).
   */
  get model(): Matrix4 {
    return this.localModelCache.composeQuaternionInto(this.position, this.rotation, this.scale)
  }

  /**
   * The transform composed up the parent chain (parent world * local), written
   * into `out`. Use this when a parented mesh should follow its parent.
   *
   * @param out - Target matrix.
   * @returns `out` for chaining.
   */
  worldModelInto(out: Matrix4): Matrix4 {
    out.composeQuaternionInto(this.position, this.rotation, this.scale)
    const parent = this.parent
    if (parent instanceof Entity3D) {
      const parentWorld = parent.worldModelInto(new Matrix4())
      const local = new Matrix4().copyFrom(out)
      out.multiplyInto(parentWorld, local)
    }
    return out
  }

  /**
   * Draw this entity into the 3D context.
   *
   * @param ctx - Shared draw context for this frame.
   */
  abstract draw(ctx: Draw3DContext): void

  /**
   * Draw this entity and recurse into visible 3D children in `zIndex` order.
   *
   * @param ctx - Shared draw context for this frame.
   */
  drawTree(ctx: Draw3DContext): void {
    if (!this.visible) return
    this.draw(ctx)
    for (const child of this.children) {
      if (child instanceof Entity3D) child.drawTree(ctx)
    }
  }

  /**
   * @param child - The newly attached child.
   */
  protected override onChildAdded(child: Entity): void {
    if (this.scene && child instanceof Entity3D) this.scene.attachSubtree(child)
  }

  /**
   * @param child - The removed child.
   */
  protected override onChildRemoved(child: Entity): void {
    if (this.scene && child instanceof Entity3D) this.scene.detachSubtree(child)
  }
}
