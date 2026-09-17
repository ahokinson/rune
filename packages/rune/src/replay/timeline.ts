/**
 * A generic timeline player: a clock scrubs across timestamped events and fires
 * each as its moment arrives, so a recorded history "plays back" at a controllable
 * speed. Events can be appended as they stream in (the clock anchors on the first
 * one), making it suitable for live-loading histories — e.g. replaying a repo's
 * commits, a recorded match's score events, or a cutscene's beats. Forward-only:
 * `restart` rewinds the clock and re-applies from the beginning via the optional
 * `onReset` hook (un-applying in reverse is the caller's concern).
 *
 * @module
 */

/**
 * A timestamped event on a timeline.
 *
 * @typeParam T - Event payload type.
 */
export interface TimelineEvent<T> {
  /** Position on the timeline, in the same units as `speed` (e.g. seconds, days). */
  time: number
  /** Payload fired to the apply callback when the clock reaches `time`. */
  value: T
}

/**
 * Configuration for a {@link Timeline}.
 *
 * @typeParam T - Event payload type.
 */
export interface TimelineOptions<T> {
  /** Timeline units advanced per real second. Defaults to 1. */
  speed?: number
  /** Called for each event as the clock reaches its time. */
  apply: (value: T, event: TimelineEvent<T>) => void
  /** Called by `restart()` so the caller can clear applied state. */
  onReset?: () => void
}

/**
 * Clock-driven player over a list of {@link TimelineEvent}s.
 *
 * @typeParam T - Event payload type.
 */
export class Timeline<T> {
  /** Pause flag; when `true`, {@link Timeline.update} does nothing. */
  paused = false
  private readonly events: TimelineEvent<T>[] = []
  private readonly apply: (value: T, event: TimelineEvent<T>) => void
  private readonly onReset?: () => void
  private clock = 0
  private cursor = 0
  private anchored = false
  private speed: number

  /**
   * @param options - Playback configuration.
   */
  constructor(options: TimelineOptions<T>) {
    this.apply = options.apply
    this.onReset = options.onReset
    this.speed = options.speed ?? 1
  }

  /**
   * Append an event to the tail (must arrive in non-decreasing time order). The
   * first appended event anchors the clock so playback starts at its moment.
   *
   * @param event - Event to append.
   */
  append(event: TimelineEvent<T>): void {
    if (!this.anchored) {
      this.clock = event.time
      this.anchored = true
    }
    this.events.push(event)
  }

  /**
   * Set the playback speed.
   *
   * @param unitsPerSecond - Timeline units advanced per real second.
   */
  setSpeed(unitsPerSecond: number): void {
    this.speed = unitsPerSecond
  }

  /**
   * Jump the clock to `time`, applying every event up to it (without re-applying
   * ones already passed). To replay from scratch at a point, call `restart` first.
   *
   * @param time - Timeline position to jump to.
   */
  seek(time: number): void {
    this.clock = time
    this.anchored = true
    this.drain()
  }

  /** Rewind the cursor and clock to the first event and invoke `onReset`. */
  restart(): void {
    this.cursor = 0
    this.clock = this.events[0]?.time ?? 0
    this.onReset?.()
  }

  /** `true` when every event has been applied. */
  get done(): boolean {
    return this.cursor >= this.events.length
  }

  /** Playback progress: applied index, total events, and current clock value. */
  get progress(): { index: number; total: number; clock: number } {
    return { index: this.cursor, total: this.events.length, clock: this.clock }
  }

  /**
   * Advance the clock by `deltaSeconds · speed` and apply any events it reaches.
   *
   * @param deltaSeconds - Real time elapsed since the previous update.
   */
  update(deltaSeconds: number): void {
    if (this.paused || this.cursor >= this.events.length) return
    this.clock += this.speed * deltaSeconds
    this.drain()
  }

  // Apply every pending event whose time the clock has reached.
  private drain(): void {
    while (this.cursor < this.events.length) {
      const event = this.events[this.cursor]!
      if (event.time > this.clock) break
      this.apply(event.value, event)
      this.cursor++
    }
  }
}
