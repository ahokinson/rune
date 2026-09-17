/**
 * Time-based value tweening with easing, looping, yoyo, and delay support.
 *
 * @module
 */

import { Easing, type EasingFunction } from "@/math/easing"
import { clamp, lerp } from "@/math/scalar"

/** Construction options for a {@link Tween}. */
export interface TweenOptions {
  /** Starting value. */
  from: number
  /** Ending value. */
  to: number
  /** Transition length in milliseconds. */
  durationMilliseconds: number
  /** Easing curve applied to the normalized progress (default {@link Easing.linear}). */
  easing?: EasingFunction
  /** Restart from `from` on completion, repeating forever. */
  loop?: boolean
  /** Reverse direction on each completion, ping-ponging between `from` and `to`. */
  yoyo?: boolean
  /** Milliseconds to wait before the tween begins advancing. */
  delayMilliseconds?: number
}

/** Lifecycle state of a {@link Tween}. */
export enum TweenState {
  /** Created but not yet started via {@link Tween.start}. */
  Pending = "pending",
  /** Currently advancing toward its target. */
  Running = "running",
  /** Reached its target and fired completion callbacks. */
  Completed = "completed",
  /** Cancelled via {@link Tween.cancel} before completing. */
  Cancelled = "cancelled",
}

/**
 * Time-driven scalar tween between two values with optional easing, loop,
 * yoyo, and delay. Advance it each frame with {@link Tween.advance}; read the
 * interpolated value via {@link Tween.value} and the lifecycle via
 * {@link Tween.status}. Chain `onUpdate`/`onComplete` callbacks for effects.
 *
 * @example
 * ```ts
 * const hp = tween({ from: 100, to: 0, durationMilliseconds: 500, easing: Easing.quadraticOut })
 *   .onUpdate((v) => drawBar(v))
 *   .onComplete(() => onDeath())
 * hp.start()
 * // each frame:
 * hp.advance(deltaMs)
 * ```
 */
export class Tween {
  /** Starting value. */
  readonly from: number
  /** Ending value. */
  readonly to: number
  /** Transition length in milliseconds. */
  readonly durationMilliseconds: number
  /** Easing curve applied to normalized progress. */
  readonly easing: EasingFunction
  /** Whether the tween restarts on completion. */
  readonly loop: boolean
  /** Whether the tween reverses direction on each completion. */
  readonly yoyo: boolean

  private elapsedMilliseconds = 0
  private delayRemaining: number
  private currentValue: number
  private state: TweenState = TweenState.Pending
  private direction: 1 | -1 = 1
  private updateCallbacks: Array<(value: number) => void> = []
  private completeCallbacks: Array<() => void> = []

  /**
   * @param options - Tween configuration; see {@link TweenOptions}.
   */
  constructor(options: TweenOptions) {
    this.from = options.from
    this.to = options.to
    this.durationMilliseconds = Math.max(0, options.durationMilliseconds)
    this.easing = options.easing ?? Easing.linear
    this.loop = options.loop ?? false
    this.yoyo = options.yoyo ?? false
    this.delayRemaining = options.delayMilliseconds ?? 0
    this.currentValue = options.from
  }

  /**
   * Register a callback fired every frame with the latest interpolated value.
   *
   * @param callback - Receives the current {@link value}.
   * @returns `this` for chaining.
   */
  onUpdate(callback: (value: number) => void): this {
    this.updateCallbacks.push(callback)
    return this
  }

  /**
   * Register a callback fired once when the tween reaches completion.
   *
   * @param callback - Invoked with no arguments on completion.
   * @returns `this` for chaining.
   */
  onComplete(callback: () => void): this {
    this.completeCallbacks.push(callback)
    return this
  }

  /**
   * Transition a {@link TweenState.Pending} tween to {@link TweenState.Running}.
   * No-op if already running, completed, or cancelled.
   *
   * @returns `this` for chaining.
   */
  start(): this {
    if (this.state === TweenState.Pending) this.state = TweenState.Running
    return this
  }

  /** Immediately mark the tween {@link TweenState.Cancelled}; no callbacks fire. */
  cancel(): void {
    this.state = TweenState.Cancelled
  }

  /** Current {@link TweenState}. */
  get status(): TweenState {
    return this.state
  }

  /** Current interpolated value (clamped between `from` and `to`). */
  get value(): number {
    return this.currentValue
  }

  /**
   * Advance the tween by `deltaMilliseconds`, firing update callbacks for the
   * new value and completing/looping/yoyo-ing as configured.
   *
   * @param deltaMilliseconds - Time to add (consumed by the delay first).
   */
  advance(deltaMilliseconds: number): void {
    if (this.state !== TweenState.Running) return
    if (this.delayRemaining > 0) {
      this.delayRemaining -= deltaMilliseconds
      if (this.delayRemaining > 0) return
      deltaMilliseconds = -this.delayRemaining
      this.delayRemaining = 0
    }
    if (this.durationMilliseconds === 0) {
      this.currentValue = this.to
      this.emitUpdate()
      this.complete()
      return
    }
    this.elapsedMilliseconds += deltaMilliseconds
    const progress = clamp(this.elapsedMilliseconds / this.durationMilliseconds, 0, 1)
    const eased = this.easing(progress)
    let start = this.from
    let end = this.to
    if (this.direction === -1) {
      start = this.to
      end = this.from
    }
    this.currentValue = lerp(start, end, eased)
    this.emitUpdate()
    if (progress >= 1) {
      if (this.yoyo) {
        this.direction = this.direction === 1 ? -1 : 1
        this.elapsedMilliseconds = 0
        if (!this.loop && this.direction === 1) {
          this.complete()
        }
      } else if (this.loop) {
        this.elapsedMilliseconds = 0
      } else {
        this.complete()
      }
    }
  }

  private emitUpdate(): void {
    for (const callback of this.updateCallbacks) callback(this.currentValue)
  }

  private complete(): void {
    this.state = TweenState.Completed
    for (const callback of this.completeCallbacks) callback()
  }
}

/**
 * Convenience factory for `new Tween`.
 *
 * @param options - Tween configuration.
 * @returns A new {@link Tween} in the {@link TweenState.Pending} state.
 */
export function tween(options: TweenOptions): Tween {
  return new Tween(options)
}

/**
 * Registry that advances a collection of {@link Tween}s together and reaps
 * completed/cancelled ones automatically. Drive it from the frame loop with
 * {@link TweenManager.advance}.
 */
export class TweenManager {
  private active: Tween[] = []

  /**
   * Add `tween` to the active set.
   *
   * @param tween - Tween to track.
   * @returns The same tween, for chaining.
   */
  add(tween: Tween): Tween {
    this.active.push(tween)
    return tween
  }

  /**
   * Remove `tween` from the active set (e.g. to cancel it without reaping).
   *
   * @param tween - Tween to detach.
   */
  remove(tween: Tween): void {
    const index = this.active.indexOf(tween)
    if (index !== -1) this.active.splice(index, 1)
  }

  /**
   * Advance every active tween by `deltaMilliseconds` and drop any that are
   * now completed or cancelled.
   *
   * @param deltaMilliseconds - Time to add to each tween.
   */
  advance(deltaMilliseconds: number): void {
    for (const tween of [...this.active]) {
      tween.advance(deltaMilliseconds)
      if (tween.status === TweenState.Completed || tween.status === TweenState.Cancelled) {
        this.remove(tween)
      }
    }
  }

  /** Cancel every active tween and empty the set. */
  clear(): void {
    for (const tween of this.active) tween.cancel()
    this.active = []
  }

  /** Number of tweens currently active. */
  get count(): number {
    return this.active.length
  }
}
