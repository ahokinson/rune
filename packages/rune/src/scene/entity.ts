/**
 * The dimension-agnostic base every game object shares. It owns identity,
 * visibility, the parent/child tree, and the lifecycle/traversal contract. The
 * transform and the `draw` signature live in the 2D/3D subclasses (a single
 * class can't hold both a Vector2 and a Vector3 transform cleanly), so this base
 * stays free of any rendering or coordinate-space assumptions.
 *
 * Construction is always through one options object — the convention shared by
 * every entity in the engine — so subclasses extend `EntityOptions` rather than
 * inventing positional constructors.
 *
 * @module
 */

/** Construction options shared by every entity in the engine. */
export interface EntityOptions {
  /**
   * Draw/update order among siblings (low first). Mutating this after attaching
   * requires {@link Entity.markSortDirty} on the parent (or scene) so the next
   * pass re-sorts. Default `0`.
   */
  zIndex?: number
  /** Whether the entity (and its subtree) is updated each tick. Default `true`. */
  enabled?: boolean
  /** Whether the entity (and its subtree) is drawn. Default `true`. */
  visible?: boolean
}

/**
 * Base class for every game object. Subclass as {@link Entity2D} or
 * {@link Entity3D} to add a transform and a `draw` implementation.
 */
export abstract class Entity {
  /**
   * Draw/update order among siblings (low first). Mutating this after attaching
   * requires calling {@link markSortDirty} on the parent (or scene) so the next
   * pass re-sorts.
   */
  zIndex: number
  /** Skipped by update traversal when `false` (the whole subtree is skipped). */
  enabled: boolean
  /** Skipped by draw traversal when `false` (the whole subtree is skipped). */
  visible: boolean
  /** Set by {@link markForRemoval}; consumed by the scene's prune pass. */
  markedForRemoval = false
  /** Parent entity, or `null` when this entity is a scene root. */
  parent: Entity | null = null

  protected readonly childList: Entity[] = []
  private sortedDirty = false

  /**
   * @param options - Construction options. All fields optional.
   */
  constructor(options: EntityOptions = {}) {
    this.zIndex = options.zIndex ?? 0
    this.enabled = options.enabled ?? true
    this.visible = options.visible ?? true
  }

  /** Children in draw/update order (sorted lazily by `zIndex`). */
  get children(): readonly Entity[] {
    if (this.sortedDirty) {
      this.childList.sort((a, b) => a.zIndex - b.zIndex)
      this.sortedDirty = false
    }
    return this.childList
  }

  /**
   * Attach a child whose transform composes onto this one and whose lifecycle
   * follows it (added/removed from the scene alongside this entity).
   *
   * @param child - Entity to attach.
   * @returns The same `child`, for chaining.
   */
  add<T extends Entity>(child: T): T {
    if (child.parent === this) return child
    child.parent?.remove(child)
    child.parent = this
    this.childList.push(child)
    this.sortedDirty = true
    this.onChildAdded(child)
    return child
  }

  /**
   * Attach several children at once, in iteration order.
   *
   * @param children - Entities to attach.
   */
  addAll(children: Iterable<Entity>): void {
    for (const child of children) this.add(child)
  }

  /**
   * Detach a child from this entity.
   *
   * @param child - Entity to remove. No-op if not a child.
   */
  remove(child: Entity): void {
    const index = this.childList.indexOf(child)
    if (index === -1) return
    this.childList.splice(index, 1)
    child.parent = null
    this.onChildRemoved(child)
  }

  /** Re-sort children on the next pass; call after mutating a child's `zIndex`. */
  markSortDirty(): void {
    this.sortedDirty = true
  }

  /**
   * Mark this entity (and its subtree) for removal. Disables and hides it
   * immediately; the scene prunes it on its next prune pass.
   */
  markForRemoval(): void {
    if (this.markedForRemoval) return
    this.markedForRemoval = true
    this.enabled = false
    this.visible = false
    for (const child of this.childList) child.markForRemoval()
  }

  // --- Lifecycle hooks (override in game code) ---------------------------------

  /** Called once when this entity enters a scene. Override in game code. */
  onEnter(): void {}
  /** Called once when this entity exits a scene. Override in game code. */
  onExit(): void {}
  /**
   * Per-fixed-tick update. Override in game code.
   *
   * @param _deltaMilliseconds - Elapsed time since the last update.
   */
  update(_deltaMilliseconds: number): void {}

  // --- Traversal driven by the containing scene -------------------------------

  /**
   * Snapshot + update this subtree in `zIndex` order, skipping disabled branches.
   *
   * @param deltaMilliseconds - Elapsed time since the last update.
   */
  tick(deltaMilliseconds: number): void {
    if (!this.enabled) return
    this.snapshot()
    this.update(deltaMilliseconds)
    for (const child of this.children) child.tick(deltaMilliseconds)
  }

  /**
   * Apply render-frame interpolation across this subtree.
   *
   * @param alpha - Interpolation factor (0 = previous tick, 1 = current).
   */
  applyInterpolationTree(alpha: number): void {
    if (!this.visible) return
    this.applyInterpolation(alpha)
    for (const child of this.children) child.applyInterpolationTree(alpha)
  }

  /** Restore pre-interpolation state across this subtree. */
  restoreInterpolationTree(): void {
    if (!this.visible) return
    for (const child of this.children) child.restoreInterpolationTree()
    this.restoreInterpolation()
  }

  // --- Per-node hooks specialised by the 2D/3D subclasses ----------------------

  /**
   * Capture the pre-tick state used for render-frame interpolation.
   * A no-op by default; {@link Entity2D} snapshots its position.
   */
  snapshot(): void {}
  /**
   * Apply render-frame interpolation to this node.
   *
   * @param _alpha - Interpolation factor (0 = previous tick, 1 = current).
   * @returns Whether anything was interpolated.
   */
  applyInterpolation(_alpha: number): boolean {
    return false
  }
  /** Restore pre-interpolation state captured by {@link snapshot}. */
  restoreInterpolation(): void {}

  /**
   * Notified when a child is attached so subclasses can propagate scene
   * attachment to descendants added after this entity is already in a scene.
   *
   * @param _child - The newly attached child.
   */
  protected onChildAdded(_child: Entity): void {}
  /**
   * Notified when a child is detached so subclasses can propagate scene
   * detachment to descendants.
   *
   * @param _child - The removed child.
   */
  protected onChildRemoved(_child: Entity): void {}
}
