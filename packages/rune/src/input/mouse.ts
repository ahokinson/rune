/**
 * Mouse input state with per-phase button edge buffers and per-frame cursor
 * delta tracking.
 *
 * @module
 */

import { InputPhase } from "./phase"

/**
 * Logical mouse buttons. Values match the binding strings used by the action
 * layer (e.g. `"mouse:left"`).
 */
export enum MouseButton {
  /** Primary button (usually left-click). */
  Left = "left",
  /** Auxiliary / wheel button (usually middle-click). */
  Middle = "middle",
  /** Secondary button (usually right-click). */
  Right = "right",
}

/**
 * Read-only view of mouse state used by action mapping and gameplay code.
 */
export interface MouseSnapshot {
  /** Current cursor X in screen pixels. */
  readonly x: number
  /** Current cursor Y in screen pixels. */
  readonly y: number
  /** Cursor X delta accumulated since the last {@link MouseState.commitFrame}. */
  readonly deltaX: number
  /** Cursor Y delta accumulated since the last {@link MouseState.commitFrame}. */
  readonly deltaY: number
  /** `true` while `button` is currently held. */
  isDown(button: MouseButton): boolean
  /** `true` on the frame `button` transitioned from up to down (phase-scoped). */
  wasPressed(button: MouseButton): boolean
  /** `true` on the frame `button` transitioned from down to up (phase-scoped). */
  wasReleased(button: MouseButton): boolean
}

/**
 * Mutable mouse state implementing {@link MouseSnapshot}. Tracks cursor
 * position and per-frame movement delta plus two phase-scoped button edge
 * buffers mirroring {@link KeyboardState}, so a click is observable exactly
 * once per fixed substep and once per frame.
 */
export class MouseState implements MouseSnapshot {
  /** Current cursor X in screen pixels. */
  x = 0
  /** Current cursor Y in screen pixels. */
  y = 0
  /** Cursor X delta accumulated since the last {@link commitFrame}. */
  deltaX = 0
  /** Cursor Y delta accumulated since the last {@link commitFrame}. */
  deltaY = 0
  private lastCommittedX = 0
  private lastCommittedY = 0
  private hasPosition = false
  private held = new Set<MouseButton>()
  // Two edge buffers, mirroring KeyboardState: the fixed buffer is cleared
  // after the first substep, the frame buffer at frame end. See {@link InputPhase}.
  private pressedFixed = new Set<MouseButton>()
  private releasedFixed = new Set<MouseButton>()
  private pressedFrame = new Set<MouseButton>()
  private releasedFrame = new Set<MouseButton>()
  private phase: InputPhase = InputPhase.Frame

  /**
   * Update the cursor position and refresh the per-frame delta. The first call
   * also seeds the delta anchor so the initial delta isn't a jump from (0, 0).
   *
   * @param x - New cursor X.
   * @param y - New cursor Y.
   */
  setPosition(x: number, y: number): void {
    if (!this.hasPosition) {
      this.lastCommittedX = x
      this.lastCommittedY = y
      this.hasPosition = true
    }
    this.x = x
    this.y = y
    this.deltaX = this.x - this.lastCommittedX
    this.deltaY = this.y - this.lastCommittedY
  }

  /**
   * Record a press of `button`.
   *
   * @param button - Button that was pressed.
   */
  press(button: MouseButton): void {
    if (!this.held.has(button)) {
      this.pressedFixed.add(button)
      this.pressedFrame.add(button)
      this.held.add(button)
    }
  }

  /**
   * Record a release of `button`.
   *
   * @param button - Button that was released.
   */
  release(button: MouseButton): void {
    if (this.held.has(button)) {
      this.releasedFixed.add(button)
      this.releasedFrame.add(button)
      this.held.delete(button)
    }
  }

  /**
   * Select which phase's edge buffer the button-edge queries read from.
   *
   * @param phase - Phase to activate ({@link InputPhase.Fixed} or {@link InputPhase.Frame}).
   */
  setPhase(phase: InputPhase): void {
    this.phase = phase
  }

  /**
   * Clear the fixed-step button edges (after the first substep of a frame).
   * Cursor delta is a per-frame quantity, so it is left untouched here.
   */
  commitFixed(): void {
    this.pressedFixed.clear()
    this.releasedFixed.clear()
  }

  /**
   * Clear the per-frame button edges and re-anchor the cursor delta. Called at
   * frame end.
   */
  commitFrame(): void {
    this.pressedFrame.clear()
    this.releasedFrame.clear()
    this.lastCommittedX = this.x
    this.lastCommittedY = this.y
    this.deltaX = 0
    this.deltaY = 0
  }

  /**
   * Clear both edge buffers and re-anchor the delta in one call. Convenient for
   * standalone/test use where there is no distinct fixed/frame split.
   */
  commitStep(): void {
    this.commitFixed()
    this.commitFrame()
  }

  /** Clear all held buttons, edge buffers, and cursor delta. */
  reset(): void {
    this.held.clear()
    this.pressedFixed.clear()
    this.releasedFixed.clear()
    this.pressedFrame.clear()
    this.releasedFrame.clear()
    this.deltaX = 0
    this.deltaY = 0
  }

  /**
   * @param button - Button to test.
   * @returns `true` if `button` is currently held.
   */
  isDown(button: MouseButton): boolean {
    return this.held.has(button)
  }

  /**
   * @param button - Button to test.
   * @returns `true` if `button` transitioned up→down this phase.
   */
  wasPressed(button: MouseButton): boolean {
    const pressed = this.phase === InputPhase.Fixed ? this.pressedFixed : this.pressedFrame
    return pressed.has(button)
  }

  /**
   * @param button - Button to test.
   * @returns `true` if `button` transitioned down→up this phase.
   */
  wasReleased(button: MouseButton): boolean {
    const released = this.phase === InputPhase.Fixed ? this.releasedFixed : this.releasedFrame
    return released.has(button)
  }
}
