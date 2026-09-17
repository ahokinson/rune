/**
 * Top-level 2D scene: a tree of {@link Entity2D} drawn through one {@link Camera}.
 *
 * The scene holds the root entities; nested children live on their parent and are
 * updated/drawn/pruned alongside it, so the whole hierarchy ticks from here.
 *
 * @module
 */

import { EventEmitter } from "@/core/events"
import { Camera } from "@/draw/camera"
import type { Canvas } from "@/draw/canvas"
import { Entity2D } from "./entity2d"

/** Event map emitted by a {@link Scene} via its {@link EventEmitter}. */
export type SceneEventMap = {
  enter: { scene: Scene }
  exit: { scene: Scene }
  "entity:added": { entity: Entity2D }
  "entity:removed": { entity: Entity2D }
} & Record<string, unknown>

/** Options for constructing a {@link Scene}. */
export interface SceneOptions {
  /** Camera used to draw this scene. Default a fresh {@link Camera}. */
  camera?: Camera
  /** Whether {@link Scene.update} prunes marked-for-removal entities. Default `false`. */
  autoPrune?: boolean
}

/**
 * The top-level 2D container: a tree of {@link Entity2D} drawn through one
 * {@link Camera}.
 *
 * The scene holds the root entities; nested children live on their parent and are
 * updated/drawn/pruned alongside it, so the whole hierarchy ticks from here.
 */
export class Scene {
  /** Scene identifier (used for logging/debugging). */
  readonly name: string
  /** Camera used to draw this scene. */
  readonly camera: Camera
  /** Event emitter for scene lifecycle and entity add/remove events. */
  readonly events: EventEmitter<SceneEventMap>
  /** Whether {@link update} prunes marked-for-removal entities each tick. */
  autoPrune: boolean
  private roots: Entity2D[] = []
  private sortedDirty = false

  /**
   * @param name - Scene identifier.
   * @param options - Construction options. All fields optional.
   */
  constructor(name: string, options: SceneOptions = {}) {
    this.name = name
    this.camera = options.camera ?? new Camera()
    this.autoPrune = options.autoPrune ?? false
    this.events = new EventEmitter<SceneEventMap>()
  }

  /** Root entities in draw order (sorted lazily by `zIndex`). */
  get entities(): readonly Entity2D[] {
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
  add(entity: Entity2D): Entity2D {
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
  addAll(entities: Iterable<Entity2D>): void {
    for (const entity of entities) this.add(entity)
  }

  /** Remove every root entity (and its subtree). Handy for scene teardown. */
  clear(): void {
    for (const entity of [...this.roots]) this.remove(entity)
  }

  /**
   * Detach an entity from this scene. A nested child leaves the scene by
   * detaching from its parent, which routes back here through {@link Entity2D}'s
   * `onChildRemoved` -> {@link detachSubtree}.
   *
   * @param entity - Entity to remove. No-op if not in this scene.
   */
  remove(entity: Entity2D): void {
    // A nested child leaves the scene by detaching from its parent, which routes
    // back here through Entity2D.onChildRemoved -> detachSubtree.
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
   * {@link onEnter}. Called by {@link add} and by {@link Entity2D} when a child
   * is attached to an entity that is already in the scene.
   *
   * @param entity - Root of the subtree to attach.
   */
  attachSubtree(entity: Entity2D): void {
    entity.scene = this
    entity.onEnter()
    this.events.emit("entity:added", { entity })
    for (const child of entity.children) {
      if (child instanceof Entity2D) this.attachSubtree(child)
    }
  }

  /**
   * Unbind an entity (and its subtree) from this scene, firing {@link onExit}.
   *
   * @param entity - Root of the subtree to detach.
   */
  detachSubtree(entity: Entity2D): void {
    for (const child of entity.children) {
      if (child instanceof Entity2D) this.detachSubtree(child)
    }
    entity.scene = null
    entity.onExit()
    this.events.emit("entity:removed", { entity })
  }

  /** Re-sort roots on the next pass; call after mutating a root's `zIndex`. */
  markSortDirty(): void {
    this.sortedDirty = true
  }

  /** Emit the `enter` event. Called by the scene manager. */
  onEnter(): void {
    this.events.emit("enter", { scene: this })
  }

  /** Emit the `exit` event. Called by the scene manager. */
  onExit(): void {
    this.events.emit("exit", { scene: this })
  }

  /**
   * Tick every root entity and optionally prune removed ones.
   *
   * @param deltaMilliseconds - Elapsed time since the last update.
   */
  update(deltaMilliseconds: number): void {
    for (const entity of this.entities) entity.tick(deltaMilliseconds)
    if (this.autoPrune) this.pruneRemoved()
  }

  /**
   * Remove every root (or child) flagged with {@link Entity.markForRemoval},
   * detaching each from the scene.
   *
   * @returns Number of entities removed.
   */
  pruneRemoved(): number {
    let removed = 0
    for (let index = this.roots.length - 1; index >= 0; index--) {
      const entity = this.roots[index]
      if (!entity) continue
      if (entity.markedForRemoval) {
        this.roots.splice(index, 1)
        this.detachSubtree(entity)
        removed++
      } else {
        removed += this.pruneChildren(entity)
      }
    }
    return removed
  }

  private pruneChildren(entity: Entity2D): number {
    let removed = 0
    for (const child of [...entity.children]) {
      if (!(child instanceof Entity2D)) continue
      if (child.markedForRemoval) {
        entity.remove(child)
        removed++
      } else {
        removed += this.pruneChildren(child)
      }
    }
    return removed
  }

  /**
   * Draw the scene's root entities, optionally interpolating between ticks.
   *
   * @param canvas - Target canvas.
   * @param renderAlpha - Interpolation factor (0 = last tick, 1 = current).
   *   Default `0` (no interpolation).
   */
  draw(canvas: Canvas, renderAlpha: number = 0): void {
    const roots = this.entities
    if (renderAlpha > 0) {
      this.camera.applyInterpolation(renderAlpha)
      for (const entity of roots) entity.applyInterpolationTree(renderAlpha)
      try {
        for (const entity of roots) entity.drawTree(canvas, this.camera)
      } finally {
        for (let index = roots.length - 1; index >= 0; index--) {
          roots[index]?.restoreInterpolationTree()
        }
        this.camera.restoreInterpolation()
      }
    } else {
      for (const entity of roots) entity.drawTree(canvas, this.camera)
    }
  }
}
