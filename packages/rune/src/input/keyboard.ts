/**
 * Keyboard input state with per-phase press/release edge buffers, designed for
 * terminals that may omit key-release events.
 *
 * @module
 */

import { InputPhase } from "./phase"

/**
 * Read-only view of keyboard state used by action mapping and gameplay code.
 */
export interface KeyboardSnapshot {
  /** `true` while `key` is currently held. */
  isDown(key: string): boolean
  /** `true` on the frame `key` transitioned from up to down (phase-scoped). */
  wasPressed(key: string): boolean
  /** `true` on the frame `key` transitioned from down to up (phase-scoped). */
  wasReleased(key: string): boolean
  /** `-1` if `negative` is down, `1` if `positive` is down, `0` otherwise/both. */
  axis(negative: string, positive: string): -1 | 0 | 1
}

/**
 * Most terminals only emit key-press events (not key-release), so a key that
 * the user has let go of would stay "held" forever. The OS auto-repeats a
 * held key (~30/s), which the keyboard layer refreshes on every press. If no
 * refresh has arrived within this window we synthesise a release. Tuned to
 * be slightly longer than a typical auto-repeat interval so a genuinely held
 * key doesn't flicker.
 */
const DEFAULT_HOLD_TIMEOUT_MILLISECONDS = 120

/** Construction options for a {@link KeyboardState}. */
export interface KeyboardStateOptions {
  /** How long (ms) a key may go unrefreshed before it is auto-released. */
  holdTimeoutMilliseconds?: number
  /** Monotonic clock source (default `performance.now`). */
  now?: () => number
}

/**
 * Mutable keyboard state implementing {@link KeyboardSnapshot}. Maintains two
 * edge buffers per phase (fixed-step and per-frame) so a single physical press
 * is observable exactly once in each pass even when a frame runs multiple
 * fixed substeps. Call {@link decayHeld} from the frame loop to auto-release
 * keys whose terminal never sent a release.
 *
 * @example
 * ```ts
 * const keyboard = new KeyboardState()
 * keyboard.press("space")
 * keyboard.setPhase(InputPhase.Fixed)
 * keyboard.wasPressed("space")  // true on the first substep
 * ```
 */
export class KeyboardState implements KeyboardSnapshot {
  private held = new Set<string>()
  // Two edge buffers so a press is observable exactly once per phase: the fixed
  // buffer is cleared after the first substep of a frame (so a press fires on
  // one tick however many substeps run), the frame buffer is cleared at frame
  // end (so once-per-frame code still sees it). See {@link InputPhase}.
  private pressedFixed = new Set<string>()
  private releasedFixed = new Set<string>()
  private pressedFrame = new Set<string>()
  private releasedFrame = new Set<string>()
  private phase: InputPhase = InputPhase.Frame
  private lastSeenAt = new Map<string, number>()
  private readonly holdTimeoutMilliseconds: number
  private readonly now: () => number

  /**
   * @param options - Optional hold-timeout override and clock source.
   */
  constructor(options: KeyboardStateOptions = {}) {
    this.holdTimeoutMilliseconds = options.holdTimeoutMilliseconds ?? DEFAULT_HOLD_TIMEOUT_MILLISECONDS
    this.now = options.now ?? (() => performance.now())
  }

  /**
   * Record a press of `key`. Refreshes the held-key heartbeat so
   * {@link decayHeld} won't auto-release it prematurely.
   *
   * @param key - Logical key name (see {@link Keys}).
   */
  press(key: string): void {
    if (!this.held.has(key)) {
      this.pressedFixed.add(key)
      this.pressedFrame.add(key)
      this.held.add(key)
    }
    this.lastSeenAt.set(key, this.now())
  }

  /**
   * Record a release of `key`.
   *
   * @param key - Logical key name.
   */
  release(key: string): void {
    if (this.held.has(key)) {
      this.releasedFixed.add(key)
      this.releasedFrame.add(key)
      this.held.delete(key)
    }
    this.lastSeenAt.delete(key)
  }

  /**
   * Auto-release any held keys whose last press arrived longer ago than the
   * hold timeout. Called from the application's frame loop so that terminals
   * which omit release events don't leave keys stuck "down".
   */
  decayHeld(): void {
    if (this.held.size === 0) return
    const now = this.now()
    for (const key of [...this.held]) {
      const lastSeen = this.lastSeenAt.get(key) ?? 0
      if (now - lastSeen > this.holdTimeoutMilliseconds) {
        this.releasedFixed.add(key)
        this.releasedFrame.add(key)
        this.held.delete(key)
        this.lastSeenAt.delete(key)
      }
    }
  }

  /**
   * Select which phase's edge buffer wasPressed/wasReleased read from. The
   * application sets this around the fixed-step and frame-update passes.
   *
   * @param phase - Phase to activate ({@link InputPhase.Fixed} or {@link InputPhase.Frame}).
   */
  setPhase(phase: InputPhase): void {
    this.phase = phase
  }

  /**
   * Clear the fixed-step edges. Called after the first substep of a frame so a
   * press reaches exactly one tick regardless of how many substeps run.
   */
  commitFixed(): void {
    this.pressedFixed.clear()
    this.releasedFixed.clear()
  }

  /**
   * Clear the per-frame edges. Called at frame end so once-per-frame code
   * (useUpdate) observes each press once, independent of substep count.
   */
  commitFrame(): void {
    this.pressedFrame.clear()
    this.releasedFrame.clear()
  }

  /**
   * Clear both edge buffers in one call. Convenient for standalone/test use
   * where there is no distinct fixed/frame split.
   */
  commitStep(): void {
    this.commitFixed()
    this.commitFrame()
  }

  /** Clear all held keys and edge buffers. */
  reset(): void {
    this.held.clear()
    this.pressedFixed.clear()
    this.releasedFixed.clear()
    this.pressedFrame.clear()
    this.releasedFrame.clear()
    this.lastSeenAt.clear()
  }

  /**
   * @param key - Logical key name.
   * @returns `true` if `key` is currently held.
   */
  isDown(key: string): boolean {
    return this.held.has(key)
  }

  /**
   * @param key - Logical key name.
   * @returns `true` if `key` transitioned up→down this phase.
   */
  wasPressed(key: string): boolean {
    const pressed = this.phase === InputPhase.Fixed ? this.pressedFixed : this.pressedFrame
    return pressed.has(key)
  }

  /**
   * @param key - Logical key name.
   * @returns `true` if `key` transitioned down→up this phase.
   */
  wasReleased(key: string): boolean {
    const released = this.phase === InputPhase.Fixed ? this.releasedFixed : this.releasedFrame
    return released.has(key)
  }

  /**
   * Treat `negative` and `positive` as a 1D axis.
   *
   * @param negative - Key mapped to the `-1` direction.
   * @param positive - Key mapped to the `+1` direction.
   * @returns `-1`, `0`, or `1` (`0` when both or neither are held).
   */
  axis(negative: string, positive: string): -1 | 0 | 1 {
    const negativeDown = this.held.has(negative)
    const positiveDown = this.held.has(positive)
    if (negativeDown === positiveDown) return 0
    return negativeDown ? -1 : 1
  }
}
