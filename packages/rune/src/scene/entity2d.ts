/**
 * 2D renderable entity: a node in a {@link Scene} with a full 2D transform
 * (position, rotation, scale) plus a `size` used for AABB collision. Smooths its
 * position between fixed ticks for high-framerate rendering. Game objects extend
 * this (or a primitive subclass like {@link SpriteEntity}) and override
 * `update()`/`draw()`.
 *
 * @module
 */

import type { Camera } from "@/draw/camera"
import type { Canvas } from "@/draw/canvas"
import { Rectangle } from "@/math/rectangle"
import { lerp } from "@/math/scalar"
import { Vector2 } from "@/math/vector2"
import type { CollisionLayer, LayerMask } from "@/physics/layers"
import { Entity, type EntityOptions } from "./entity"
import type { Scene } from "./scene"

/** Options for constructing an {@link Entity2D}. */
export interface Entity2DOptions extends EntityOptions {
  /** World-space position. Default `(0, 0)`. */
  position?: Vector2
  /** Rotation in radians. Default `0`. */
  rotation?: number
  /** Per-axis scale. Default `(1, 1)`. */
  scale?: Vector2
  /** AABB size used for collision. Default `(1, 1)`. */
  size?: Vector2
  /** Layer this entity lives on (for collision filtering). */
  collisionLayer?: CollisionLayer
  /** Mask of layers this entity collides with. */
  collisionMask?: LayerMask
}

/**
 * A renderable node in a 2D {@link Scene}.
 *
 * Holds a full 2D transform (position, rotation, scale) plus a `size` used for
 * AABB collision, and smooths its position between fixed ticks for high-framerate
 * rendering. Game objects extend this (or a primitive subclass like
 * {@link SpriteEntity}) and override `update()`/`draw()`.
 */
export class Entity2D extends Entity {
  /** World-space position. */
  position: Vector2
  /** Rotation in radians. */
  rotation: number
  /** Per-axis scale. */
  scale: Vector2
  /** AABB size used for collision. */
  size: Vector2
  /** Containing scene, set when this entity is attached. */
  scene: Scene | null = null
  /** Layer this entity lives on (for collision filtering). */
  collisionLayer?: CollisionLayer
  /** Mask of layers this entity collides with. */
  collisionMask?: LayerMask

  private previousPosition: Vector2 | null = null
  private renderPosition: Vector2 | null = null
  private savedPosition: Vector2 | null = null
  private boundsCache: Rectangle | null = null
  private boundsDirty = true

  /**
   * @param options - Construction options. All fields optional.
   */
  constructor(options: Entity2DOptions = {}) {
    super(options)
    this.position = options.position ?? new Vector2(0, 0)
    this.rotation = options.rotation ?? 0
    this.scale = options.scale ?? new Vector2(1, 1)
    this.size = options.size ?? new Vector2(1, 1)
    this.collisionLayer = options.collisionLayer
    this.collisionMask = options.collisionMask
  }

  /**
   * Local-space AABB at this entity's own position. (World-space hierarchy uses
   * {@link worldPosition}; `bounds` stays local so unparented collision is
   * allocation-free and unchanged from before the transform grew.)
   */
  get bounds(): Rectangle {
    if (this.boundsDirty || !this.boundsCache) {
      this.boundsCache = new Rectangle(this.position.x, this.position.y, this.size.x, this.size.y)
      this.boundsDirty = false
    } else {
      this.boundsCache.x = this.position.x
      this.boundsCache.y = this.position.y
      this.boundsCache.width = this.size.x
      this.boundsCache.height = this.size.y
    }
    return this.boundsCache
  }

  // --- World transform (composed up the parent chain) -------------------------

  /** World-space rotation, composed up the parent chain. */
  get worldRotation(): number {
    const parent = this.parent
    return parent instanceof Entity2D ? parent.worldRotation + this.rotation : this.rotation
  }

  /** World-space scale, composed up the parent chain. */
  get worldScale(): Vector2 {
    const parent = this.parent
    if (!(parent instanceof Entity2D)) return this.scale.clone()
    const parentScale = parent.worldScale
    return new Vector2(parentScale.x * this.scale.x, parentScale.y * this.scale.y)
  }

  /** World-space position, composed up the parent chain. */
  get worldPosition(): Vector2 {
    const parent = this.parent
    if (!(parent instanceof Entity2D)) return this.position.clone()
    const parentScale = parent.worldScale
    const local = new Vector2(this.position.x * parentScale.x, this.position.y * parentScale.y)
    const rotated = local.rotate(parent.worldRotation)
    return parent.worldPosition.addInPlace(rotated)
  }

  // --- Render-frame interpolation ---------------------------------------------

  /** Capture the current position for render-frame interpolation. */
  override snapshot(): void {
    if (!this.previousPosition) this.previousPosition = this.position.clone()
    else this.previousPosition.copyFrom(this.position)
    this.boundsDirty = true
  }

  /**
   * Lerp between the previous and current position by `alpha`, swapping in the
   * interpolated position for the duration of the draw.
   *
   * @param alpha - Interpolation factor (0 = previous tick, 1 = current).
   * @returns `true` if interpolation was applied.
   */
  override applyInterpolation(alpha: number): boolean {
    if (this.previousPosition === null || alpha <= 0) return false
    const clamped = alpha >= 1 ? 1 : alpha
    if (!this.renderPosition) this.renderPosition = new Vector2(0, 0)
    if (!this.savedPosition) this.savedPosition = new Vector2(0, 0)
    this.savedPosition.copyFrom(this.position)
    this.renderPosition.x = lerp(this.previousPosition.x, this.savedPosition.x, clamped)
    this.renderPosition.y = lerp(this.previousPosition.y, this.savedPosition.y, clamped)
    this.position = this.renderPosition
    this.boundsDirty = true
    return true
  }

  /** Restore the post-tick position after a draw that applied interpolation. */
  override restoreInterpolation(): void {
    if (this.savedPosition) {
      this.position = this.savedPosition
      this.boundsDirty = true
    }
  }

  // --- Collision --------------------------------------------------------------

  /**
   * Override to react when this entity overlaps another. Fired by
   * `detectCollisions()` for each root entity whose `collisionLayer` matches this
   * entity's `collisionMask`. Left undefined by default so non-colliding entities
   * are skipped entirely.
   *
   * @param other - The overlapping entity.
   */
  onCollide?(other: Entity2D): void

  // --- Drawing ----------------------------------------------------------------

  /**
   * Override to render this entity. Children are drawn afterwards, on top.
   *
   * @param _canvas - Target canvas.
   * @param _camera - Active camera.
   */
  draw(_canvas: Canvas, _camera: Camera): void {}

  /**
   * Draw this entity and recurse into visible 2D children in `zIndex` order.
   *
   * @param canvas - Target canvas.
   * @param camera - Active camera.
   */
  drawTree(canvas: Canvas, camera: Camera): void {
    if (!this.visible) return
    this.draw(canvas, camera)
    for (const child of this.children) {
      if (child instanceof Entity2D) child.drawTree(canvas, camera)
    }
  }

  // --- Scene attachment propagation -------------------------------------------

  /**
   * @param child - The newly attached child.
   */
  protected override onChildAdded(child: Entity): void {
    if (this.scene && child instanceof Entity2D) this.scene.attachSubtree(child)
  }

  /**
   * @param child - The removed child.
   */
  protected override onChildRemoved(child: Entity): void {
    if (this.scene && child instanceof Entity2D) this.scene.detachSubtree(child)
  }
}
