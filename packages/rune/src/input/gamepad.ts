/**
 * Gamepad input state with per-phase press/release edge buffers and analog axes,
 * mirroring {@link module:input/keyboard}.
 *
 * Reading a physical controller is host-specific: there is no built-in terminal
 * gamepad reader. The engine owns the *state model* and feeds it through a
 * pluggable source — push button/axis updates with {@link GamepadState.setButton}
 * / {@link GamepadState.setAxis}. {@link pollWebGamepads} is a ready-made source
 * for environments exposing the browser Gamepad API (`navigator.getGamepads`).
 *
 * @module
 */

import { InputPhase } from "./phase"

/**
 * Standard-mapping gamepad buttons (Xbox/PlayStation layout, named by position
 * so they read the same across brands). Values match the strings used in
 * `"gamepad:<button>"` action bindings.
 */
export enum GamepadButton {
  /** Bottom face button (Xbox A / PlayStation Cross). */
  South = "south",
  /** Right face button (Xbox B / PlayStation Circle). */
  East = "east",
  /** Left face button (Xbox X / PlayStation Square). */
  West = "west",
  /** Top face button (Xbox Y / PlayStation Triangle). */
  North = "north",
  LeftBumper = "leftBumper",
  RightBumper = "rightBumper",
  LeftTrigger = "leftTrigger",
  RightTrigger = "rightTrigger",
  /** Back / View / Share. */
  Select = "select",
  /** Start / Menu / Options. */
  Start = "start",
  /** Left stick pressed in (L3). */
  LeftStick = "leftStick",
  /** Right stick pressed in (R3). */
  RightStick = "rightStick",
  DpadUp = "dpadUp",
  DpadDown = "dpadDown",
  DpadLeft = "dpadLeft",
  DpadRight = "dpadRight",
  /** Guide / Home / PS button. */
  Guide = "guide",
}

/** Analog axes (sticks in `-1..1`, triggers in `0..1`). */
export enum GamepadAxis {
  LeftX = "leftX",
  LeftY = "leftY",
  RightX = "rightX",
  RightY = "rightY",
  LeftTrigger = "leftTriggerAxis",
  RightTrigger = "rightTriggerAxis",
}

/**
 * Standard-mapping button index → {@link GamepadButton}, matching the W3C
 * Gamepad "standard" layout. Indexes triggers (6/7) as buttons; their analog
 * value is also surfaced via {@link GamepadAxis.LeftTrigger}/`RightTrigger`.
 */
const STANDARD_BUTTONS: readonly GamepadButton[] = [
  GamepadButton.South,
  GamepadButton.East,
  GamepadButton.West,
  GamepadButton.North,
  GamepadButton.LeftBumper,
  GamepadButton.RightBumper,
  GamepadButton.LeftTrigger,
  GamepadButton.RightTrigger,
  GamepadButton.Select,
  GamepadButton.Start,
  GamepadButton.LeftStick,
  GamepadButton.RightStick,
  GamepadButton.DpadUp,
  GamepadButton.DpadDown,
  GamepadButton.DpadLeft,
  GamepadButton.DpadRight,
  GamepadButton.Guide,
]

/** Read-only view of gamepad state used by action mapping and gameplay code. */
export interface GamepadSnapshot {
  /** `true` while a controller is connected and pushing updates. */
  readonly connected: boolean
  /** `true` while `button` is currently held. */
  isDown(button: GamepadButton): boolean
  /** `true` on the frame `button` transitioned from up to down (phase-scoped). */
  wasPressed(button: GamepadButton): boolean
  /** `true` on the frame `button` transitioned from down to up (phase-scoped). */
  wasReleased(button: GamepadButton): boolean
  /** Current value of `axis` (deadzone-filtered for sticks). */
  axis(axis: GamepadAxis): number
}

/** Default radial deadzone applied to stick axes so a resting stick reads 0. */
const DEFAULT_DEADZONE = 0.1

/** Construction options for a {@link GamepadState}. */
export interface GamepadStateOptions {
  /** Stick deadzone in `0..1` (default `0.1`). Triggers are not deadzoned. */
  deadzone?: number
}

const STICK_AXES = new Set<GamepadAxis>([GamepadAxis.LeftX, GamepadAxis.LeftY, GamepadAxis.RightX, GamepadAxis.RightY])

/**
 * Mutable gamepad state implementing {@link GamepadSnapshot}. Maintains two edge
 * buffers per phase (fixed-step and per-frame) so a single press is observable
 * exactly once in each pass even when a frame runs multiple fixed substeps —
 * identical to {@link KeyboardState}. A source (e.g. {@link pollWebGamepads})
 * pushes the live controller state each frame via {@link setButton}/{@link setAxis}.
 *
 * @example
 * ```ts
 * const gamepad = new GamepadState()
 * gamepad.setButton(GamepadButton.South, true)
 * gamepad.setPhase(InputPhase.Fixed)
 * gamepad.wasPressed(GamepadButton.South)  // true on the first substep
 * ```
 */
export class GamepadState implements GamepadSnapshot {
  private held = new Set<GamepadButton>()
  private pressedFixed = new Set<GamepadButton>()
  private releasedFixed = new Set<GamepadButton>()
  private pressedFrame = new Set<GamepadButton>()
  private releasedFrame = new Set<GamepadButton>()
  private axes = new Map<GamepadAxis, number>()
  private phase: InputPhase = InputPhase.Frame
  private connectedFlag = false
  private readonly deadzone: number

  /**
   * @param options - Optional deadzone override.
   */
  constructor(options: GamepadStateOptions = {}) {
    this.deadzone = options.deadzone ?? DEFAULT_DEADZONE
  }

  /** `true` while a controller is connected and pushing updates. */
  get connected(): boolean {
    return this.connectedFlag
  }

  /**
   * Mark whether a controller is currently connected. Sources call this so
   * {@link connected} reflects live state.
   *
   * @param connected - Connection flag.
   */
  setConnected(connected: boolean): void {
    this.connectedFlag = connected
  }

  /**
   * Push the current pressed-state of `button`, computing press/release edges.
   * Idempotent per state: calling with the same value across frames fires the
   * edge only on the transition.
   *
   * @param button - Button to update.
   * @param down - Whether it is currently pressed.
   */
  setButton(button: GamepadButton, down: boolean): void {
    if (down) {
      if (!this.held.has(button)) {
        this.pressedFixed.add(button)
        this.pressedFrame.add(button)
        this.held.add(button)
      }
    } else if (this.held.has(button)) {
      this.releasedFixed.add(button)
      this.releasedFrame.add(button)
      this.held.delete(button)
    }
  }

  /**
   * Push the current value of an analog `axis`. Stick axes are stored raw and
   * deadzoned on read; triggers are stored as-is.
   *
   * @param axis - Axis to update.
   * @param value - Raw value (`-1..1` for sticks, `0..1` for triggers).
   */
  setAxis(axis: GamepadAxis, value: number): void {
    this.axes.set(axis, value)
  }

  /**
   * Select which phase's edge buffer wasPressed/wasReleased read from. The
   * application sets this around the fixed-step and frame-update passes.
   *
   * @param phase - Phase to activate.
   */
  setPhase(phase: InputPhase): void {
    this.phase = phase
  }

  /** Clear the fixed-step edges (after the first substep of a frame). */
  commitFixed(): void {
    this.pressedFixed.clear()
    this.releasedFixed.clear()
  }

  /** Clear the per-frame edges (at frame end). */
  commitFrame(): void {
    this.pressedFrame.clear()
    this.releasedFrame.clear()
  }

  /** Clear both edge buffers in one call (standalone/test use). */
  commitStep(): void {
    this.commitFixed()
    this.commitFrame()
  }

  /** Clear all held buttons, edge buffers, and axes. */
  reset(): void {
    this.held.clear()
    this.pressedFixed.clear()
    this.releasedFixed.clear()
    this.pressedFrame.clear()
    this.releasedFrame.clear()
    this.axes.clear()
    this.connectedFlag = false
  }

  /**
   * @param button - Button to query.
   * @returns `true` if `button` is currently held.
   */
  isDown(button: GamepadButton): boolean {
    return this.held.has(button)
  }

  /**
   * @param button - Button to query.
   * @returns `true` if `button` transitioned up→down this phase.
   */
  wasPressed(button: GamepadButton): boolean {
    const pressed = this.phase === InputPhase.Fixed ? this.pressedFixed : this.pressedFrame
    return pressed.has(button)
  }

  /**
   * @param button - Button to query.
   * @returns `true` if `button` transitioned down→up this phase.
   */
  wasReleased(button: GamepadButton): boolean {
    const released = this.phase === InputPhase.Fixed ? this.releasedFixed : this.releasedFrame
    return released.has(button)
  }

  /**
   * @param axis - Axis to read.
   * @returns The axis value; stick axes below the deadzone read `0` and the
   *   remaining range is rescaled so motion starts smoothly at the deadzone edge.
   */
  axis(axis: GamepadAxis): number {
    const raw = this.axes.get(axis) ?? 0
    if (!STICK_AXES.has(axis)) return raw
    const magnitude = Math.abs(raw)
    if (magnitude < this.deadzone) return 0
    const scaled = (magnitude - this.deadzone) / (1 - this.deadzone)
    return Math.sign(raw) * Math.min(1, scaled)
  }
}

/** Minimal structural shape of a browser Gamepad reading (W3C standard mapping). */
interface WebGamepadLike {
  connected: boolean
  buttons: readonly { pressed: boolean; value: number }[]
  axes: readonly number[]
}

/** Options for {@link pollWebGamepads}. */
export interface PollWebGamepadsOptions {
  /** Which connected controller slot to read (default `0`). */
  index?: number
}

/**
 * Read the browser Gamepad API once and push the first (or `index`-th) connected
 * controller's state into `state`. A no-op returning `false` where
 * `navigator.getGamepads` is unavailable (e.g. a Bun terminal), so it is safe to
 * call unconditionally every frame.
 *
 * @param state - Target {@link GamepadState}.
 * @param options - Optional controller slot selection.
 * @returns `true` if a connected controller was read.
 */
export function pollWebGamepads(state: GamepadState, options: PollWebGamepadsOptions = {}): boolean {
  const nav = (globalThis as { navigator?: { getGamepads?: () => (WebGamepadLike | null)[] } }).navigator
  if (!nav?.getGamepads) {
    state.setConnected(false)
    return false
  }
  const pads = nav.getGamepads()
  const pad = pads[options.index ?? 0]
  if (!pad?.connected) {
    state.setConnected(false)
    return false
  }

  state.setConnected(true)
  for (let i = 0; i < STANDARD_BUTTONS.length; i++) {
    const button = STANDARD_BUTTONS[i]!
    const reading = pad.buttons[i]
    state.setButton(button, reading?.pressed ?? false)
  }
  state.setAxis(GamepadAxis.LeftX, pad.axes[0] ?? 0)
  state.setAxis(GamepadAxis.LeftY, pad.axes[1] ?? 0)
  state.setAxis(GamepadAxis.RightX, pad.axes[2] ?? 0)
  state.setAxis(GamepadAxis.RightY, pad.axes[3] ?? 0)
  state.setAxis(GamepadAxis.LeftTrigger, pad.buttons[6]?.value ?? 0)
  state.setAxis(GamepadAxis.RightTrigger, pad.buttons[7]?.value ?? 0)
  return true
}
