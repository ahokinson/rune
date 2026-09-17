/**
 * Generic object pool for reusing short-lived allocations, keeping per-frame
 * garbage out of the GC.
 *
 * @module
 */

/**
 * Construction options for an {@link ObjectPool}.
 *
 * @typeParam T - Pooled object type.
 */
export interface ObjectPoolOptions<T> {
  /** Factory invoked to create a fresh instance when the pool is empty. */
  create: () => T
  /** Optional hook to reset an item's state before it is recycled. */
  reset?: (item: T) => void
  /** Items to pre-allocate at construction (default 0). */
  initialSize?: number
  /** Hard cap on live instances; `acquire` throws once reached (default Infinity). */
  maximumSize?: number
}

/**
 * Reusable object pool. {@link acquire} returns a recycled instance or creates
 * one; {@link release} returns it to the free list after running the optional
 * `reset` hook. Use this to keep churn-heavy allocations (particles,
 * projectiles, scratch buffers) out of the hot path's GC pressure.
 *
 * @typeParam T - Pooled object type.
 *
 * @example
 * ```ts
 * const pool = new ObjectPool({ create: () => new Vector2(), reset: (v) => v.set(0, 0) })
 * const v = pool.acquire()
 * // …use v…
 * pool.release(v)
 * ```
 */
export class ObjectPool<T> {
  private readonly create: () => T
  private readonly reset: ((item: T) => void) | null
  private readonly maximumSize: number
  private readonly available: T[] = []
  private allocated = 0

  /**
   * @param options - Pool configuration; see {@link ObjectPoolOptions}.
   */
  constructor(options: ObjectPoolOptions<T>) {
    this.create = options.create
    this.reset = options.reset ?? null
    this.maximumSize = options.maximumSize ?? Infinity
    const initialSize = options.initialSize ?? 0
    for (let index = 0; index < initialSize; index++) {
      this.available.push(this.create())
      this.allocated++
    }
  }

  /**
   * Take an instance from the free list, or create one. Throws if the live
   * count has reached {@link ObjectPoolOptions.maximumSize}.
   *
   * @returns A pooled instance ready for use.
   */
  acquire(): T {
    const recycled = this.available.pop()
    if (recycled !== undefined) return recycled
    if (this.allocated >= this.maximumSize) {
      throw new Error(`ObjectPool: maximum size ${this.maximumSize} reached`)
    }
    this.allocated++
    return this.create()
  }

  /**
   * Return `item` to the free list, running the configured `reset` hook first.
   *
   * @param item - Instance to recycle.
   */
  release(item: T): void {
    if (this.reset) this.reset(item)
    this.available.push(item)
  }

  /** Number of instances currently sitting in the free list. */
  get freeCount(): number {
    return this.available.length
  }

  /** Number of instances currently checked out via {@link acquire}. */
  get inUseCount(): number {
    return this.allocated - this.available.length
  }
}
