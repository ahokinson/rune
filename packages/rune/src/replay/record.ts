/**
 * Deterministic replay rests on one idea: a fixed-step simulation is a pure
 * function of its seed and the per-tick input stream, so capturing that stream is
 * enough to reproduce a session exactly. InputRecorder collects one input frame
 * per fixed tick (push it from your fixed-update); pair the resulting Recording
 * with the run's random seed and InputPlayback re-runs it bit-for-bit. `TInput`
 * is whatever snapshot of the controls a tick consumes (a button bitmask, an
 * action set, an axis pair) — keep it plain-data so it serialises cleanly.
 *
 * @module
 */

/**
 * Serialized input stream plus the seed needed to replay it.
 *
 * @typeParam TInput - Per-tick input snapshot type.
 */
export interface Recording<TInput> {
  /** The Random seed the recorded session used; replaying with the same seed is what makes playback deterministic. */
  seed: number
  /** Captured input frames in tick order. */
  frames: TInput[]
}

/**
 * Collects one input frame per fixed tick into a {@link Recording}.
 *
 * @typeParam TInput - Per-tick input snapshot type.
 */
export class InputRecorder<TInput> {
  /** Captured frames in tick order. */
  readonly frames: TInput[] = []

  /**
   * @param seed - Random seed the session will use. Defaults to 0.
   */
  constructor(readonly seed: number = 0) {}

  /**
   * Capture the input consumed by one fixed tick. Call once per fixed update.
   *
   * @param frame - The input snapshot for this tick.
   */
  record(frame: TInput): void {
    this.frames.push(frame)
  }

  /** Number of frames captured so far. */
  get length(): number {
    return this.frames.length
  }

  /**
   * Snapshot the recording so far (frames are copied, so further recording does
   * not mutate the returned Recording).
   *
   * @returns An immutable copy of the recording.
   */
  build(): Recording<TInput> {
    return { seed: this.seed, frames: [...this.frames] }
  }
}
