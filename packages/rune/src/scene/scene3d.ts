/**
 * Top-level 3D scene: a tree of {@link Entity3D} projected/culled/depth-ordered
 * against one {@link Camera3D}. Not drawn directly by the renderer; a host
 * {@link WorldView3D} (a 2D entity) ticks it and draws it at a viewport, so 2D
 * effects can sit in front of or behind it.
 *
 * @module
 */

import type { Canvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { SubpixelTarget } from "@/draw/mesh/subpixelTarget"
import { GridDepthBuffer } from "@/draw/raycast/gridDepthBuffer"
import type { Camera3D, Viewport3D } from "@/geom/camera3d"
import { type Draw3DContext, Entity3D } from "./entity3d"

/** Options for constructing a {@link Scene3D}. */
export interface Scene3DOptions {
  /** Camera used to project this scene. */
  camera: Camera3D
  /**
   * Enable per-cell depth occlusion so geometry hides behind the nearer surface
   * drawn earlier this frame. Off by default (painter's order only).
   */
  occlude?: boolean
  /**
   * Allocate a shared {@link SubpixelTarget} (the renderMesh rasterizer) cleared
   * to {@link clearColor} each frame and handed to entities via `ctx.target`.
   * Enable for {@link MeshEntity3D} scenes; leave off for the braille/projector
   * primitives.
   */
  subpixel?: boolean
  /** Colour to clear the subpixel target to each frame. Default black. */
  clearColor?: Color
}

/**
 * A tree of {@link Entity3D} projected/culled/depth-ordered against one
 * {@link Camera3D} — the 3D counterpart to {@link Scene}.
 *
 * It is not drawn directly by the renderer; a host {@link WorldView3D} (a 2D
 * entity) ticks it and draws it at a viewport, so 2D effects can sit in front of
 * or behind it. Entities draw low -> high `zIndex` so a surface can write depth
 * before points and arcs test against it.
 */
export class Scene3D {
  /** Camera used to project this scene. */
  readonly camera: Camera3D
  /** Whether per-cell depth occlusion is enabled. */
  occlude: boolean
  private roots: Entity3D[] = []
  private sortedDirty = false
  private depth = new GridDepthBuffer()
  private readonly subpixel: boolean
  private readonly clearColor: Color
  private target: SubpixelTarget | null = null

  /**
   * @param options - Construction options.
   */
  constructor(options: Scene3DOptions) {
    this.camera = options.camera
    this.occlude = options.occlude ?? false
    this.subpixel = options.subpixel ?? false
    this.clearColor = options.clearColor ?? Color.BLACK
  }

  /** Root entities in draw order (sorted lazily by `zIndex`). */
  get entities(): readonly Entity3D[] {
    if (this.sortedDirty) {
      this.roots.sort((a, b) => a.zIndex - b.zIndex)
      this.sortedDirty = false
    }
    return this.roots
  }

  /**
   * Attach an entity (and its subtree) to this scene. If the entity is attached
   * elsewhere, it is removed from there first.
   *
   * @param entity - Entity to add.
   * @returns The same `entity`, for chaining.
   */
  add(entity: Entity3D): Entity3D {
    if (entity.scene === this) return entity
    if (entity.scene) entity.scene.remove(entity)
    this.roots.push(entity)
    this.sortedDirty = true
    this.attachSubtree(entity)
    return entity
  }

  /**
   * Add several entities at once, in iteration order.
   *
   * @param entities - Entities to add.
   */
  addAll(entities: Iterable<Entity3D>): void {
    for (const entity of entities) this.add(entity)
  }

  /** Remove every root entity (and its subtree). Handy for scene teardown. */
  clear(): void {
    for (const entity of [...this.roots]) this.remove(entity)
  }

  /**
   * Detach an entity from this scene. A nested child leaves the scene by
   * detaching from its parent.
   *
   * @param entity - Entity to remove. No-op if not in this scene.
   */
  remove(entity: Entity3D): void {
    if (entity.parent) {
      entity.parent.remove(entity)
      return
    }
    const index = this.roots.indexOf(entity)
    if (index === -1) return
    this.roots.splice(index, 1)
    this.detachSubtree(entity)
  }

  /**
   * Bind an entity (and everything beneath it) to this scene, firing
   * `onEnter`. Called by `add` and by `Entity3D` when a child
   * is attached to an entity that is already in the scene.
   *
   * @param entity - Root of the subtree to attach.
   */
  attachSubtree(entity: Entity3D): void {
    entity.scene = this
    entity.onEnter()
    for (const child of entity.children) {
      if (child instanceof Entity3D) this.attachSubtree(child)
    }
  }

  /**
   * Unbind an entity (and its subtree) from this scene, firing `onExit`.
   *
   * @param entity - Root of the subtree to detach.
   */
  detachSubtree(entity: Entity3D): void {
    for (const child of entity.children) {
      if (child instanceof Entity3D) this.detachSubtree(child)
    }
    entity.scene = null
    entity.onExit()
  }

  /** Re-sort entities on the next draw after a `zIndex` change. */
  markSortDirty(): void {
    this.sortedDirty = true
  }

  /**
   * Tick every root entity.
   *
   * @param deltaMilliseconds - Elapsed time since the last update.
   */
  update(deltaMilliseconds: number): void {
    for (const entity of this.entities) entity.tick(deltaMilliseconds)
  }

  /**
   * Draw the scene's root entities, low -> high `zIndex`, into `canvas` at
   * `viewport`. Reallocates the depth (and subpixel) buffer if the canvas size
   * changed.
   *
   * @param canvas - Target canvas.
   * @param viewport - Visible viewport in canvas pixels.
   */
  draw(canvas: Canvas, viewport: Viewport3D): void {
    this.depth.resize(canvas.width, canvas.height)
    this.depth.clear()
    let target: SubpixelTarget | null = null
    if (this.subpixel) {
      if (!this.target || this.target.width !== canvas.width || this.target.cellRows !== canvas.height) {
        this.target = new SubpixelTarget(canvas.width, canvas.height)
      }
      this.target.clear(this.clearColor)
      target = this.target
    }
    const ctx: Draw3DContext = {
      canvas,
      camera: this.camera,
      viewport,
      depth: this.depth,
      occlude: this.occlude,
      target,
    }
    for (const entity of this.entities) entity.drawTree(ctx)
  }
}
