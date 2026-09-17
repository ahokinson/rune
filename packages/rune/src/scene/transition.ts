/**
 * Scene-change transitions: a full-canvas overlay that grows to hide the scene
 * and shrinks to reveal the next one. {@link drawTransition} paints the overlay
 * for a given coverage (ordered-dither fade or directional wipe, all via plain
 * cell writes so it works on any {@link Canvas}); {@link SceneTransition} sequences
 * the two halves — cover, swap, reveal — over wall-clock time, the pattern a
 * title→game→over flow needs instead of a hard cut.
 *
 * @module
 */

import type { Canvas } from "../draw/canvas"
import { Color } from "../draw/color"
import { Easing, type EasingFunction } from "../math/easing"
import { clamp } from "../math/scalar"

/** How a {@link drawTransition} overlay fills the canvas as coverage rises. */
export enum TransitionKind {
  /** Ordered-dither dissolve: pixels flip to the overlay colour in a Bayer pattern. */
  Fade = "fade",
  /** Solid bar sweeping in from the left. */
  WipeLeft = "wipe-left",
  /** Solid bar sweeping in from the right. */
  WipeRight = "wipe-right",
  /** Solid bar sweeping down from the top. */
  WipeUp = "wipe-up",
  /** Solid bar sweeping up from the bottom. */
  WipeDown = "wipe-down",
}

// 4×4 Bayer threshold matrix (values 0..15) for the ordered-dither fade: a cell
// flips to the overlay once coverage passes its normalized threshold, so the
// dissolve reads as an even stipple rather than a sweep.
const BAYER_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

/** Options for {@link drawTransition}. */
export interface TransitionDrawOptions {
  /** Overlay pattern (default {@link TransitionKind.Fade}). */
  kind?: TransitionKind
  /** How covered the scene is, 0 (clear) to 1 (fully hidden). */
  coverage: number
  /** Overlay colour (default black). */
  color?: Color
}

/**
 * Paint the transition overlay over the whole canvas for the given `coverage`.
 * `coverage` 0 draws nothing; 1 fills every cell with `color`; in between, a
 * dither fade stipples cells in and a wipe advances a solid edge. Cell-only, so it
 * composites over whatever the scene already drew.
 *
 * @param canvas - Target canvas.
 * @param options - Pattern, coverage, and colour.
 */
export function drawTransition(canvas: Canvas, options: TransitionDrawOptions): void {
  const coverage = clamp(options.coverage, 0, 1)
  if (coverage <= 0) return
  const color = options.color ?? Color.BLACK
  const kind = options.kind ?? TransitionKind.Fade
  const { width, height } = canvas

  if (kind === TransitionKind.Fade) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // +1 so the threshold sits in (0, 1]; coverage 1 then covers everything.
        const threshold = (BAYER_4X4[(y % 4) * 4 + (x % 4)]! + 1) / 16
        if (coverage >= threshold) canvas.setCell(x, y, " ", color, color)
      }
    }
    return
  }

  if (kind === TransitionKind.WipeLeft || kind === TransitionKind.WipeRight) {
    const filled = Math.round(coverage * width)
    const startX = kind === TransitionKind.WipeLeft ? 0 : width - filled
    canvas.fillRectangle(startX, 0, filled, height, color)
    return
  }

  const filled = Math.round(coverage * height)
  const startY = kind === TransitionKind.WipeUp ? 0 : height - filled
  canvas.fillRectangle(0, startY, width, filled, color)
}

/** Lifecycle phase of a {@link SceneTransition}. */
export enum TransitionPhase {
  /** Not running. */
  Idle = "idle",
  /** Coverage rising 0→1, hiding the outgoing scene. */
  Covering = "covering",
  /** Coverage falling 1→0, revealing the incoming scene. */
  Revealing = "revealing",
}

/** Options for constructing a {@link SceneTransition}. */
export interface SceneTransitionOptions {
  /** Duration of each half (cover and reveal), in milliseconds. */
  durationMilliseconds: number
  /** Overlay pattern (default {@link TransitionKind.Fade}). */
  kind?: TransitionKind
  /** Overlay colour (default black). */
  color?: Color
  /** Easing applied to each half's progress (default {@link Easing.quadraticInOut}). */
  easing?: EasingFunction
}

/**
 * Sequences a two-phase scene change: cover the screen, run a swap callback at the
 * fully-covered midpoint, then reveal. Advance it with the frame delta and call
 * {@link draw} after the scene each frame; it owns the timing and coverage so
 * games don't hand-roll the cover→swap→reveal handshake.
 */
export class SceneTransition {
  /** Current phase. */
  phase: TransitionPhase = TransitionPhase.Idle
  private readonly durationMilliseconds: number
  private readonly kind: TransitionKind
  private readonly color: Color
  private readonly easing: EasingFunction
  private elapsed = 0
  private onCovered?: () => void
  private swapped = false

  /**
   * @param options - Duration, pattern, colour, and easing.
   */
  constructor(options: SceneTransitionOptions) {
    this.durationMilliseconds = Math.max(1, options.durationMilliseconds)
    this.kind = options.kind ?? TransitionKind.Fade
    this.color = options.color ?? Color.BLACK
    this.easing = options.easing ?? Easing.quadraticInOut
  }

  /** `true` while a transition is covering or revealing. */
  get isActive(): boolean {
    return this.phase !== TransitionPhase.Idle
  }

  /** Current overlay coverage, 0 (clear) to 1 (fully hidden). */
  get coverage(): number {
    if (this.phase === TransitionPhase.Idle) return 0
    const t = this.easing(clamp(this.elapsed / this.durationMilliseconds, 0, 1))
    return this.phase === TransitionPhase.Covering ? t : 1 - t
  }

  /**
   * Begin a transition. `onCovered` fires once when the screen is fully hidden —
   * the moment to swap scenes — before the reveal starts. Ignored if a transition
   * is already running.
   *
   * @param onCovered - Callback invoked at the covered midpoint.
   */
  start(onCovered?: () => void): void {
    if (this.isActive) return
    this.phase = TransitionPhase.Covering
    this.elapsed = 0
    this.swapped = false
    this.onCovered = onCovered
  }

  /**
   * Advance the transition by `deltaMilliseconds`, firing the swap callback at the
   * midpoint and ending after the reveal completes.
   *
   * @param deltaMilliseconds - Frame delta in milliseconds.
   */
  advance(deltaMilliseconds: number): void {
    if (this.phase === TransitionPhase.Idle) return
    this.elapsed += deltaMilliseconds
    if (this.elapsed < this.durationMilliseconds) return
    if (this.phase === TransitionPhase.Covering) {
      if (!this.swapped) {
        this.swapped = true
        this.onCovered?.()
      }
      this.phase = TransitionPhase.Revealing
      this.elapsed = 0
      return
    }
    this.phase = TransitionPhase.Idle
    this.elapsed = 0
  }

  /**
   * Draw the overlay for the current coverage. A no-op while idle.
   *
   * @param canvas - Target canvas.
   */
  draw(canvas: Canvas): void {
    if (this.phase === TransitionPhase.Idle) return
    drawTransition(canvas, { kind: this.kind, coverage: this.coverage, color: this.color })
  }
}
