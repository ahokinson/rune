/**
 * Time-based cooldown timer for rate-limiting recurring actions.
 *
 * @module
 */

/**
 * Cooldown timer that gates an action to at most once per `duration`. Call
 * {@link Cooldown.tick} each frame with the frame delta, then probe
 * {@link Cooldown.isReady} and {@link Cooldown.fire} when the gated action
 * occurs.
 *
 * @example
 * ```ts
 * const cooldown = new Cooldown(500)
 * cooldown.fire()            // true — arms the 500 ms window
 * cooldown.isReady           // false
 * cooldown.tick(16)          // call each frame
 * // …after ~500 ms of ticks…
 * cooldown.isReady           // true
 * ```
 */
export class Cooldown {
  /** Total cooldown duration in milliseconds. */
  readonly durationMilliseconds: number
  private remainingMilliseconds = 0

  /**
   * @param durationMilliseconds - Cooldown length in milliseconds.
   */
  constructor(durationMilliseconds: number) {
    this.durationMilliseconds = durationMilliseconds
  }

  /** `true` when the cooldown has elapsed and the action may fire again. */
  get isReady(): boolean {
    return this.remainingMilliseconds <= 0
  }

  /** Milliseconds left before the cooldown becomes ready (clamped at 0). */
  get remaining(): number {
    return Math.max(0, this.remainingMilliseconds)
  }

  /**
   * Advance the cooldown by one frame's worth of time.
   *
   * @param deltaMilliseconds - Elapsed time since the last tick.
   */
  tick(deltaMilliseconds: number): void {
    if (this.remainingMilliseconds > 0) {
      this.remainingMilliseconds -= deltaMilliseconds
    }
  }

  /**
   * Attempt to fire the gated action. Succeeds only when ready.
   *
   * @returns `true` if the action fired and the cooldown was re-armed;
   *   `false` if still cooling down.
   */
  fire(): boolean {
    if (!this.isReady) return false
    this.remainingMilliseconds = this.durationMilliseconds
    return true
  }

  /** Clear the cooldown immediately, making the action ready now. */
  reset(): void {
    this.remainingMilliseconds = 0
  }
}
