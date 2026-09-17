/**
 * AnimatedSprite clip selection driven by a state machine: each call plays the
 * clip mapped to the machine's current state, keeping "what the entity is doing"
 * and "what it's showing" in lockstep.
 *
 * @module
 */

import type { StateMachine } from "@/ai/stateMachine"
import type { AnimatedSprite } from "@/draw/animatedSprite"

/**
 * Drive an {@link AnimatedSprite}'s current clip from a {@link StateMachine}: each
 * call plays the clip mapped to the machine's current state.
 *
 * `play()` is a no-op when the clip is already current, so this is cheap to call
 * every update — the one canonical way to keep "what the entity is doing" and
 * "what it's showing" in lockstep, instead of hand-picking clip names in
 * `update()`. States with no entry in `stateToClip` leave the current clip
 * untouched.
 *
 * @param machine - Source state machine.
 * @param sprite - Sprite whose clip to set.
 * @param stateToClip - Map from state name to clip name.
 */
export function playClipForState<TState extends string, TFrame>(
  machine: StateMachine<TState>,
  sprite: AnimatedSprite<TFrame>,
  stateToClip: Partial<Record<TState, string>>,
): void {
  const state = machine.current
  if (state === null) return
  const clip = stateToClip[state]
  if (clip !== undefined) sprite.play(clip)
}
