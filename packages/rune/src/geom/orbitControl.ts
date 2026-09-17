import { MouseButton, type MouseSnapshot } from "../input/mouse"
import { clamp } from "../math/scalar"

/**
 * Click-and-drag turntable orbit control for 3D viewers: owns the drag, spin,
 * and resume state machine and exposes absolute yaw/pitch angles for callers to
 * apply each frame.
 *
 * @module
 */

/**
 * Configuration for an {@link OrbitControl}. All angles are in radians; drag
 * sensitivities are signed so a caller can flip which way a drag turns the view.
 */
export interface OrbitOptions {
  /** Radians of yaw added per cell of horizontal cursor travel while dragging. */
  yawSensitivity: number
  /** Radians of pitch subtracted per cell of vertical cursor travel while dragging. */
  pitchSensitivity: number
  /** Resting pitch the tilt eases back to once the auto-spin resumes. */
  restPitch: number
  /**
   * Absolute pitch clamp while dragging, given outright (independent of
   * `restPitch`) so a viewer can rest at a non-zero tilt while clamping about
   * any centre.
   */
  minPitch: number
  /** Upper pitch clamp while dragging (see {@link OrbitOptions.minPitch}). */
  maxPitch: number
  /** Auto-spin rate about the yaw axis, radians per second. */
  spinPerSecond: number
  /** Ticks to hold still after a drag is released before the auto-spin resumes. */
  resumeDelayTicks: number
  /** Per-tick ease factor gliding the pitch back to `restPitch` once spinning. */
  tiltResumeEase: number
  /**
   * Optional gate: a drag may only begin where this returns true (e.g. on a
   * globe disc). Omitted means a drag can start anywhere.
   */
  canStartDrag?: (x: number, y: number) => boolean
}

/**
 * Click-and-drag "turntable" orbit for 3D viewers. It owns the drag/spin/resume
 * state machine and exposes the resulting absolute `yaw` and `pitch`; callers
 * read those each frame and apply them to whatever transform or projection they
 * drive (a model matrix, a camera position, a sphere view). While dragging, the
 * auto-spin is suspended and the angles track the cursor relative to the anchor
 * captured on press; after release it pauses briefly, then resumes spinning and
 * glides the tilt back to rest.
 *
 * @example
 * ```ts
 * const ctrl = new OrbitControl(opts)
 * ctrl.update(mouse, deltaMs)
 * modelMatrix.rotateY(ctrl.yaw).rotateX(ctrl.pitch)
 * ```
 */
export class OrbitControl {
  /** Current yaw angle in radians. */
  yaw = 0
  /** Current pitch angle in radians. */
  pitch: number
  /** Whether a drag is currently in progress. */
  dragging = false

  private anchorX = 0
  private anchorY = 0
  private startYaw = 0
  private startPitch = 0
  private resumeCountdown = 0

  /**
   * @param options - Orbit configuration.
   */
  constructor(private readonly options: OrbitOptions) {
    this.pitch = options.restPitch
  }

  /**
   * Advance one fixed tick. Call once per tick with the same delta the sim uses.
   * `paused` freezes the auto-spin and tilt ease but still allows dragging, so a
   * viewer's pause toggle can hold the pose while the user keeps orbiting by hand.
   *
   * @param mouse - Current mouse snapshot.
   * @param deltaMilliseconds - Tick delta in milliseconds (matches the sim tick).
   * @param paused - Freeze auto-spin and tilt ease but keep drag (default false).
   */
  update(mouse: MouseSnapshot, deltaMilliseconds: number, paused = false): void {
    const o = this.options

    if (mouse.wasPressed(MouseButton.Left) && (!o.canStartDrag || o.canStartDrag(mouse.x, mouse.y))) {
      this.dragging = true
      this.anchorX = mouse.x
      this.anchorY = mouse.y
      this.startYaw = this.yaw
      this.startPitch = this.pitch
    }

    if (this.dragging) {
      // Anchor-based so it stays stable across the fixed-tick loop: drag right
      // turns the view to follow the cursor, drag up/down tilts it.
      this.yaw = this.startYaw + (mouse.x - this.anchorX) * o.yawSensitivity
      this.pitch = clamp(this.startPitch - (mouse.y - this.anchorY) * o.pitchSensitivity, o.minPitch, o.maxPitch)
      if (mouse.wasReleased(MouseButton.Left)) {
        this.dragging = false
        this.resumeCountdown = o.resumeDelayTicks
      }
      return
    }

    if (this.resumeCountdown > 0) {
      this.resumeCountdown--
      return
    }

    if (!paused) {
      this.yaw += (deltaMilliseconds / 1000) * o.spinPerSecond
      // Glide the tilt back to its resting angle after a manual orbit.
      if (this.pitch !== o.restPitch) {
        this.pitch += (o.restPitch - this.pitch) * o.tiltResumeEase
        if (Math.abs(this.pitch - o.restPitch) < 1e-3) this.pitch = o.restPitch
      }
    }
  }
}
