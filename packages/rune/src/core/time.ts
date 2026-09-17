/**
 * Frame-rate telemetry counters.
 *
 * @module
 */

/**
 * Rolling FPS counter. Call {@link record} each frame with the frame delta; the
 * counter accumulates frames until at least 250 ms of time has passed, then
 * publishes a fresh frames-per-second value to {@link value}. Smoothing window
 * is bounded by `sampleCapacity` delta samples.
 *
 * @example
 * ```ts
 * const fps = new FramesPerSecondCounter()
 * // each frame:
 * fps.record(deltaMs)
 * if (fps.value > 0) drawHud(fps.value)
 * ```
 */
export class FramesPerSecondCounter {
  private samples: number[] = []
  private sampleCapacity: number
  private accumulatedMilliseconds = 0
  private accumulatedFrames = 0
  private latestValue = 0

  /**
   * @param sampleCapacity - Maximum delta samples retained (default 60).
   */
  constructor(sampleCapacity = 60) {
    this.sampleCapacity = sampleCapacity
  }

  /**
   * Submit one frame's delta for averaging.
   *
   * @param deltaMilliseconds - Wall-clock time the frame took.
   */
  record(deltaMilliseconds: number): void {
    this.samples.push(deltaMilliseconds)
    if (this.samples.length > this.sampleCapacity) {
      this.samples.shift()
    }
    this.accumulatedMilliseconds += deltaMilliseconds
    this.accumulatedFrames += 1
    if (this.accumulatedMilliseconds >= 250) {
      this.latestValue = (this.accumulatedFrames * 1000) / this.accumulatedMilliseconds
      this.accumulatedMilliseconds = 0
      this.accumulatedFrames = 0
    }
  }

  /** Latest computed frames-per-second, or 0 until enough samples accumulate. */
  get value(): number {
    return this.latestValue
  }

  /** Clear all samples and the published value. */
  reset(): void {
    this.samples = []
    this.accumulatedMilliseconds = 0
    this.accumulatedFrames = 0
    this.latestValue = 0
  }
}
