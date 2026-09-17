/**
 * Deterministic timer scheduler driven by an external clock. Avoids real-time
 * `setTimeout` so game pauses and slow-motion stay consistent.
 *
 * @module
 */

/** Opaque handle identifying a scheduled timer; returned by {@link Scheduler.after}/{@link Scheduler.every}. */
export type TimerId = number

type ScheduledEntry = {
  id: TimerId
  remainingMilliseconds: number
  intervalMilliseconds: number | null
  callback: () => void
}

/**
 * Timer registry advanced by an external time source. Schedule one-shot timers
 * with {@link Scheduler.after} or repeating timers with {@link Scheduler.every},
 * then call {@link Scheduler.advance} each frame with the frame delta to fire
 * due callbacks. Pause-safe: no timer fires while {@link advance} isn't called.
 */
export class Scheduler {
  private entries = new Map<TimerId, ScheduledEntry>()
  private nextId: TimerId = 1

  /**
   * Schedule `callback` to fire once after `milliseconds` have elapsed.
   *
   * @param milliseconds - Delay before firing.
   * @param callback - Function to invoke.
   * @returns A {@link TimerId} for cancellation via {@link clear}.
   */
  after(milliseconds: number, callback: () => void): TimerId {
    return this.schedule(milliseconds, null, callback)
  }

  /**
   * Schedule `callback` to fire every `milliseconds`, repeating until
   * cancelled.
   *
   * @param milliseconds - Interval between firings.
   * @param callback - Function to invoke on each firing.
   * @returns A {@link TimerId} for cancellation via {@link clear}.
   */
  every(milliseconds: number, callback: () => void): TimerId {
    return this.schedule(milliseconds, milliseconds, callback)
  }

  /**
   * Cancel a single scheduled timer.
   *
   * @param id - Handle returned by {@link after} or {@link every}.
   */
  clear(id: TimerId): void {
    this.entries.delete(id)
  }

  /** Cancel every scheduled timer. */
  clearAll(): void {
    this.entries.clear()
  }

  /**
   * Advance the scheduler by `deltaMilliseconds`, firing any callbacks whose
   * deadline has been reached. Repeating timers re-arm from their interval.
   *
   * @param deltaMilliseconds - Time to add to every pending timer.
   */
  advance(deltaMilliseconds: number): void {
    if (this.entries.size === 0) return
    for (const entry of this.entries.values()) {
      entry.remainingMilliseconds -= deltaMilliseconds
      while (entry.remainingMilliseconds <= 0) {
        if (!this.entries.has(entry.id)) break
        entry.callback()
        if (entry.intervalMilliseconds === null) {
          this.entries.delete(entry.id)
          break
        }
        entry.remainingMilliseconds += entry.intervalMilliseconds
      }
    }
  }

  private schedule(delay: number, interval: number | null, callback: () => void): TimerId {
    const id = this.nextId++
    this.entries.set(id, {
      id,
      remainingMilliseconds: delay,
      intervalMilliseconds: interval,
      callback,
    })
    return id
  }
}
