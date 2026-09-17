/**
 * Pool-backed collection of live items with a fast spawn/expire lifecycle.
 *
 * @module
 */

import { ObjectPool } from "./objectPool"

/**
 * Construction options for a {@link PooledSet}.
 *
 * @typeParam T - Item type.
 */
export interface PooledSetOptions<T> {
  /** Factory invoked to create a fresh instance when the pool is empty. */
  create: () => T
  /** Optional hook to reset an item's state before it is recycled. */
  reset?: (item: T) => void
  /** Maximum number of items live at once; spawning past this returns null. */
  capacity: number
}

/**
 * A pool-backed set of live items with a fast spawn/expire lifecycle. Items are
 * recycled through an {@link ObjectPool} so a steady churn of short-lived objects
 * (particles, projectiles, transient events) allocates once and never GCs. The
 * active list is mutated in place; {@link PooledSet.expire} uses swap-pop so
 * removals stay O(1).
 *
 * @typeParam T - Item type.
 */
export class PooledSet<T> {
  /** Live items currently in play (mutated in place by {@link spawn}/{@link expire}). */
  readonly active: T[] = []
  private readonly pool: ObjectPool<T>
  private readonly capacity: number

  /**
   * @param options - Set configuration; see {@link PooledSetOptions}.
   */
  constructor(options: PooledSetOptions<T>) {
    this.capacity = options.capacity
    this.pool = new ObjectPool<T>({
      create: options.create,
      reset: options.reset,
      maximumSize: options.capacity,
    })
  }

  /** Number of items currently live. */
  get size(): number {
    return this.active.length
  }

  /** `true` when the live count has reached the configured capacity. */
  get isFull(): boolean {
    return this.active.length >= this.capacity
  }

  /**
   * Acquire an item from the pool and add it to the active set, or return null
   * when the set is full (no throw, unlike a bare {@link ObjectPool} at its
   * maximum).
   *
   * @returns A fresh or recycled item, or `null` if at capacity.
   */
  spawn(): T | null {
    if (this.isFull) return null
    const item = this.pool.acquire()
    this.active.push(item)
    return item
  }

  /**
   * Release every item for which `shouldExpire` is true back to the pool. Walks
   * backwards and swap-pops so the active list is mutated in place.
   *
   * @param shouldExpire - Predicate returning `true` for items to retire.
   */
  expire(shouldExpire: (item: T) => boolean): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const item = this.active[i]!
      if (!shouldExpire(item)) continue
      this.pool.release(item)
      const last = this.active.length - 1
      if (i !== last) this.active[i] = this.active[last]!
      this.active.pop()
    }
  }

  /** Release all active items back to the pool. */
  clear(): void {
    for (let i = 0; i < this.active.length; i++) {
      this.pool.release(this.active[i]!)
    }
    this.active.length = 0
  }
}
