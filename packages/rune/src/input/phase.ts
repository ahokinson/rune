/**
 * Input phase identifiers selecting which edge buffer press/release queries read
 * from during a frame.
 *
 * @module
 */

/**
 * Which pass of the frame is currently reading input. A frame runs the fixed
 * simulation step (often several substeps) and then a once-per-frame update
 * pass, and a single physical key press must be observable exactly once in
 * each. The input state keeps a separate press/release edge buffer per phase
 * and returns the one matching the active phase, so gameplay code in the fixed
 * step never sees a press twice when a frame runs multiple substeps, while
 * frame-level code (pause toggles, title screens) still sees it once per frame.
 */
export enum InputPhase {
  /** The fixed-timestep simulation: scene/entity updates and `useFixedUpdate`. */
  Fixed = "fixed",
  /** The once-per-frame update pass: `useUpdate`. */
  Frame = "frame",
}
