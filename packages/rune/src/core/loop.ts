/**
 * Fixed-timestep loop accumulator. Decouples render rate from simulation rate
 * by accumulating wall-clock deltas and stepping the sim at a fixed cadence.
 *
 * @module
 */

/**
 * Mutable state carried between frames by the fixed-step loop.
 */
export interface LoopState {
  /** Leftover time (ms) not yet consumed by a fixed step. */
  accumulator: number
  /** Monotonically increasing simulation tick counter. */
  tick: number
}

/**
 * Create a fresh {@link LoopState} with a zeroed accumulator and tick.
 *
 * @returns A new loop state ready for {@link advanceLoop}.
 */
export function createLoopState(): LoopState {
  return { accumulator: 0, tick: 0 }
}

/**
 * Drain `deltaMilliseconds` of wall-clock time into fixed `stepMilliseconds`
 * ticks, invoking `onTick` for each substep. Caps the accumulator to prevent
 * the "spiral of death" when the sim can't keep up with real time.
 *
 * @param state - Loop state to advance (mutated in place).
 * @param deltaMilliseconds - Wall-clock time elapsed this frame.
 * @param stepMilliseconds - Fixed simulation step length.
 * @param maxSubSteps - Hard cap on substeps per frame.
 * @param onTick - Called once per substep with the step delta and tick index.
 */
export function advanceLoop(
  state: LoopState,
  deltaMilliseconds: number,
  stepMilliseconds: number,
  maxSubSteps: number,
  onTick: (deltaMilliseconds: number, tick: number) => void,
): void {
  if (stepMilliseconds <= 0) return
  state.accumulator += deltaMilliseconds
  let stepsExecuted = 0
  while (state.accumulator >= stepMilliseconds && stepsExecuted < maxSubSteps) {
    state.accumulator -= stepMilliseconds
    state.tick += 1
    onTick(stepMilliseconds, state.tick)
    stepsExecuted += 1
  }
  if (state.accumulator > stepMilliseconds * maxSubSteps) {
    state.accumulator = stepMilliseconds * maxSubSteps
  }
}
