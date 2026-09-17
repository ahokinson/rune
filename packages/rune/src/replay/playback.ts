import type { Recording } from "./record"

/**
 * Replays a {@link Recording} one frame per fixed tick. Seed your `Random` with
 * `playback.seed`, then on each fixed update feed `playback.next()` to the sim in
 * place of live input; with the same seed and the same fixed step the run is
 * reproduced exactly. `done` reports when the recorded frames run out.
 *
 * @module
 */

/**
 * Frame-by-frame player for a recorded input stream.
 *
 * @typeParam TInput - Per-tick input snapshot type.
 */
export class InputPlayback<TInput> {
  /** Seed the recorded session used; feed this to your RNG before replaying. */
  readonly seed: number
  private readonly frames: readonly TInput[]
  private cursor = 0

  /**
   * @param recording - The recording to replay.
   */
  constructor(recording: Recording<TInput>) {
    this.seed = recording.seed
    this.frames = recording.frames
  }

  /** Number of frames in the recording. */
  get length(): number {
    return this.frames.length
  }

  /** Ticks consumed so far. */
  get tick(): number {
    return this.cursor
  }

  /** `true` when every recorded frame has been consumed. */
  get done(): boolean {
    return this.cursor >= this.frames.length
  }

  /**
   * The next frame, advancing the cursor.
   *
   * @returns The next input frame, or `undefined` once exhausted.
   */
  next(): TInput | undefined {
    if (this.cursor >= this.frames.length) return undefined
    return this.frames[this.cursor++]
  }

  /**
   * Peek a specific tick's frame without moving the cursor.
   *
   * @param tick - Tick index to read.
   * @returns The frame at `tick`, or `undefined` if out of range.
   */
  at(tick: number): TInput | undefined {
    return this.frames[tick]
  }

  /** Rewind the cursor to the first frame. */
  reset(): void {
    this.cursor = 0
  }
}
