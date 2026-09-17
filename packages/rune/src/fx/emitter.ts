import { PooledSet } from "@/core/pooledSet"
import { RateCounter } from "@/core/rateCounter"

/** Options for constructing an {@link Emitter}. */
export interface EmitterOptions<T> {
  /** Factory for a fresh pooled item. */
  create: () => T
  /** Reset an item before reuse (e.g. clear its state). */
  reset?: (item: T) => void
  /** Maximum number of items live at once. */
  capacity: number
  /** Probability in [0,1] of spawning one item per `update` call. Default 1. */
  spawnChance?: number
  /**
   * Window (in the same unit as the `tick` passed to `update`) over which
   * `ratePerWindow` counts spawns. Omit to disable rate tracking.
   */
  rateWindow?: number
  /** Injectable Random for deterministic tests. Default Math.random. */
  random?: () => number
}

/** Per-tick callbacks driving an {@link Emitter.update} step. */
export interface EmitterUpdate<T> {
  /** True when a live item has finished and should be recycled. */
  expired: (item: T, tick: number) => boolean
  /** Fill a freshly spawned item (and run any per-spawn side effects). */
  initialize: (item: T, tick: number) => void
}

/**
 * A self-managing population of pooled items that appear over time, live, then
 * expire. Each `update` expires finished items and, with probability
 * `spawnChance`, spawns one more (up to `capacity`). Particles is one concrete
 * emitter; AttackFeed-style event streams are another. Distinct from
 * EventEmitter (pub/sub) in core/events.
 */
export class Emitter<T> {
  private readonly set: PooledSet<T>
  private readonly rate: RateCounter | null
  private readonly spawnChance: number
  private readonly random: () => number
  /** Total items ever spawned. */
  total = 0

  /**
   * @param options - Emitter configuration.
   */
  constructor(options: EmitterOptions<T>) {
    this.set = new PooledSet<T>({
      create: options.create,
      reset: options.reset,
      capacity: options.capacity,
    })
    this.spawnChance = options.spawnChance ?? 1
    this.random = options.random ?? Math.random
    this.rate = options.rateWindow != null ? new RateCounter(options.rateWindow) : null
  }

  /** Currently live items. */
  get active(): T[] {
    return this.set.active
  }

  /** Number of live items. */
  get size(): number {
    return this.set.size
  }

  /**
   * Expire finished items, then maybe spawn a new one.
   *
   * @param tick - Current time (any consistent unit).
   * @param hooks - Expire/initialize callbacks for this step.
   * @returns The spawned item, or `null` if nothing spawned this tick.
   */
  update(tick: number, hooks: EmitterUpdate<T>): T | null {
    this.set.expire((item) => hooks.expired(item, tick))
    if (this.rate) this.rate.sample(tick)

    if (this.set.isFull || this.random() >= this.spawnChance) return null
    const item = this.set.spawn()
    if (!item) return null

    hooks.initialize(item, tick)
    this.total++
    this.rate?.record(tick)
    return item
  }

  /**
   * Items spawned within the last `rateWindow`; 0 when rate tracking is off.
   *
   * @param tick - Current time.
   * @returns Spawn count over the configured window.
   */
  ratePerWindow(tick: number): number {
    return this.rate ? this.rate.sample(tick) : 0
  }

  /** Drop every live item and reset rate tracking. */
  clear(): void {
    this.set.clear()
    this.rate?.reset()
  }
}
