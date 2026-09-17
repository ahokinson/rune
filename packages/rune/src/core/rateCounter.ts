/**
 * Trailing-window event counters for rate telemetry.
 *
 * @module
 */

/**
 * Counts events over a trailing window. Unit-agnostic: callers pass a monotonic
 * clock value to {@link record}/{@link sample} (ticks, frames, or milliseconds)
 * and the counter keeps only the entries within `window` of the latest value.
 * Parallels {@link FramesPerSecondCounter}, but for arbitrary discrete events.
 */
export class RateCounter {
  private times: number[] = []
  private latest = 0

  /**
   * @param window - Trailing window length, in the same unit callers pass to
   *   {@link record} and {@link sample}.
   */
  constructor(private readonly window: number) {}

  /**
   * Record an event at `now` (the same unit used for `window`).
   *
   * @param now - Current monotonic clock value.
   */
  record(now: number): void {
    this.times.push(now)
  }

  /**
   * Prune events older than `window` and return how many remain in the window.
   *
   * @param now - Current monotonic clock value.
   * @returns Count of events within the trailing window.
   */
  sample(now: number): number {
    let kept = 0
    for (let i = 0; i < this.times.length; i++) {
      if (now - this.times[i]! < this.window) {
        this.times[kept++] = this.times[i]!
      }
    }
    this.times.length = kept
    this.latest = kept
    return kept
  }

  /** The count from the last {@link sample}, without pruning again. */
  get current(): number {
    return this.latest
  }

  /** Clear all recorded events. */
  reset(): void {
    this.times.length = 0
    this.latest = 0
  }
}
