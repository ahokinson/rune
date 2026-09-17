/**
 * Frame-based sprite animation: a set of named clips played back by elapsed
 * time, used by tile sets and billboards.
 *
 * @module
 */

import type { Sprite } from "./sprite"

/** A single playable animation: an ordered list of frames with a fixed duration and loop mode. */
export interface AnimationClip<TFrame = Sprite> {
  /** Frames played in sequence. */
  readonly frames: readonly TFrame[]
  /** Milliseconds each frame is held before advancing. */
  readonly frameDuration: number
  /** Whether playback wraps back to frame 0 after the last frame. */
  readonly loop: boolean
}

/** Options for constructing an {@link AnimatedSprite}. */
export interface AnimatedSpriteOptions<TFrame = Sprite> {
  /** Named clips keyed by their lookup name. */
  clips: Record<string, AnimationClip<TFrame>>
  /** Name of the clip to play initially. */
  initial: string
}

/**
 * Time-driven sprite animation player that switches between named clips and
 * tracks the current frame.
 *
 * @example
 * ```ts
 * const sprite = new AnimatedSprite({
 *   clips: { idle: { frames: [a, b], frameDuration: 200, loop: true } },
 *   initial: "idle",
 * })
 * sprite.update(16)
 * sprite.currentFrame()  // advances based on elapsed time
 * ```
 */
export class AnimatedSprite<TFrame = Sprite> {
  private readonly clips: Map<string, AnimationClip<TFrame>>
  private currentName: string
  private currentClip: AnimationClip<TFrame>
  private elapsedMilliseconds: number

  /**
   * @param options - Clips and the initial clip name.
   */
  constructor(options: AnimatedSpriteOptions<TFrame>) {
    this.clips = new Map(Object.entries(options.clips))
    const initial = this.clips.get(options.initial)
    if (!initial) {
      throw new Error(`AnimatedSprite: initial clip "${options.initial}" not found`)
    }
    this.currentName = options.initial
    this.currentClip = initial
    this.elapsedMilliseconds = 0
  }

  /** Name of the clip currently playing. */
  get currentClipName(): string {
    return this.currentName
  }

  /**
   * Switch to clip `name`, resetting elapsed time. No-op if `name` is the
   * current clip or unknown.
   *
   * @param name - Clip to play.
   */
  play(name: string): void {
    if (name === this.currentName) return
    const clip = this.clips.get(name)
    if (!clip) return
    this.currentName = name
    this.currentClip = clip
    this.elapsedMilliseconds = 0
  }

  /** Reset the current clip to its first frame. */
  restart(): void {
    this.elapsedMilliseconds = 0
  }

  /**
   * Advance the animation clock.
   *
   * @param deltaMilliseconds - Time to advance in milliseconds.
   */
  update(deltaMilliseconds: number): void {
    this.elapsedMilliseconds += deltaMilliseconds
  }

  /**
   * Resolve the frame the clip is currently showing.
   *
   * @returns The current frame.
   */
  currentFrame(): TFrame {
    const frameCount = this.currentClip.frames.length
    if (frameCount === 0) {
      throw new Error(`AnimatedSprite: clip "${this.currentName}" has no frames`)
    }
    const frameIndex = Math.floor(this.elapsedMilliseconds / this.currentClip.frameDuration)
    const index = this.currentClip.loop ? frameIndex % frameCount : Math.min(frameIndex, frameCount - 1)
    return this.currentClip.frames[index] as TFrame
  }

  /**
   * Whether the current (non-looping) clip has played its last frame.
   *
   * @returns `true` if a non-looping clip has finished.
   */
  isFinished(): boolean {
    if (this.currentClip.loop) return false
    const totalDuration = this.currentClip.frameDuration * this.currentClip.frames.length
    return this.elapsedMilliseconds >= totalDuration
  }

  /**
   * Make an independent copy sharing the same clip definitions.
   *
   * @returns A new {@link AnimatedSprite}.
   */
  clone(): AnimatedSprite<TFrame> {
    return new AnimatedSprite<TFrame>({
      clips: Object.fromEntries(this.clips),
      initial: this.currentName,
    })
  }
}
