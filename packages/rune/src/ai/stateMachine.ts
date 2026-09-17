/**
 * Minimal hierarchical state machine: register named states with optional
 * `onEnter`/`onUpdate`/`onExit` callbacks, transition between them, and tick the
 * active state every update. Transitions run `onExit` of the current state then
 * `onEnter` of the next; `update` calls only the current state's `onUpdate`.
 *
 * @module
 */

/** Callbacks for a single state in a {@link StateMachine}. */
export interface StateDefinition<TState extends string> {
  /** Called once when this state is entered. */
  onEnter?: (previous: TState | null) => void
  /** Called each {@link StateMachine.update} while this state is active. */
  onUpdate?: (deltaMilliseconds: number) => void
  /** Called once when this state is exited by a transition. */
  onExit?: (next: TState) => void
}

/**
 * State machine keyed by string state names.
 *
 * @typeParam TState - String union of valid state names.
 */
export class StateMachine<TState extends string> {
  private readonly states: Map<TState, StateDefinition<TState>> = new Map()
  private currentState: TState | null = null

  /**
   * Register a state and its callbacks.
   *
   * @param name - State name.
   * @param definition - Optional enter/update/exit callbacks.
   * @returns `this` for chaining.
   */
  addState(name: TState, definition: StateDefinition<TState> = {}): this {
    this.states.set(name, definition)
    return this
  }

  /** The active state name, or `null` before the first transition. */
  get current(): TState | null {
    return this.currentState
  }

  /**
   * Transition to `next`, running the previous state's `onExit` and the new
   * state's `onEnter`. No-ops if `next` is already current.
   *
   * @param next - State to transition to. Must have been registered.
   */
  transitionTo(next: TState): void {
    const nextDefinition = this.states.get(next)
    if (!nextDefinition) {
      throw new Error(`StateMachine: unknown state "${next}"`)
    }
    if (this.currentState === next) return
    const previousState = this.currentState
    if (previousState !== null) {
      const previousDefinition = this.states.get(previousState)
      previousDefinition?.onExit?.(next)
    }
    this.currentState = next
    nextDefinition.onEnter?.(previousState)
  }

  /**
   * Tick the current state.
   *
   * @param deltaMilliseconds - Time elapsed since the previous update.
   */
  update(deltaMilliseconds: number): void {
    if (this.currentState === null) return
    const definition = this.states.get(this.currentState)
    definition?.onUpdate?.(deltaMilliseconds)
  }
}
