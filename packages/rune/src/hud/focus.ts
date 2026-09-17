/**
 * Keyboard focus traversal across a set of controls. {@link FocusRing} owns an
 * ordered list and a focused index, advancing with {@link FocusRing.focusNext} /
 * {@link FocusRing.focusPrevious} while skipping disabled members — so Tab/arrow
 * keys can move focus between {@link Button}s and other widgets that the mouse
 * also drives.
 *
 * @module
 */

/** Options for constructing a {@link FocusRing}. */
export interface FocusRingOptions<T> {
  /** The controls, in focus order. */
  items: T[]
  /**
   * Whether a member can hold focus (default: always). Disabled members are
   * skipped by traversal.
   */
  isEnabled?: (item: T) => boolean
  /** Whether traversal wraps at the ends (default `true`). */
  wrap?: boolean
}

/**
 * An ordered, wrapping focus cursor over a list of controls. Generic over the
 * control type; pair an `isEnabled` predicate (e.g. reading {@link Button.enabled})
 * so traversal skips controls that can't take focus.
 */
export class FocusRing<T> {
  /** The controls, in focus order. */
  items: T[]
  /** Index of the focused control, or `-1` when nothing is focusable. */
  index: number
  private readonly isEnabled: (item: T) => boolean
  private readonly wrap: boolean

  /**
   * @param options - Items and traversal behaviour.
   */
  constructor(options: FocusRingOptions<T>) {
    this.items = options.items
    this.isEnabled = options.isEnabled ?? (() => true)
    this.wrap = options.wrap ?? true
    this.index = this.items.findIndex((item) => this.isEnabled(item))
  }

  /** The focused control, or `undefined` when nothing is focusable. */
  get focused(): T | undefined {
    return this.index === -1 ? undefined : this.items[this.index]
  }

  private move(step: 1 | -1): void {
    const count = this.items.length
    if (count === 0) return
    let index = this.index === -1 ? (step === 1 ? -1 : 0) : this.index
    for (let taken = 0; taken < count; taken++) {
      const next = index + step
      if (next < 0 || next >= count) {
        if (!this.wrap) return
        index = (next + count) % count
      } else {
        index = next
      }
      if (this.isEnabled(this.items[index]!)) {
        this.index = index
        return
      }
    }
  }

  /** Advance focus to the next enabled control (wrapping when configured). */
  focusNext(): void {
    this.move(1)
  }

  /** Move focus to the previous enabled control (wrapping when configured). */
  focusPrevious(): void {
    this.move(-1)
  }

  /**
   * Focus `item` if it is present and enabled.
   *
   * @param item - The control to focus.
   * @returns `true` if focus moved to it.
   */
  focus(item: T): boolean {
    const index = this.items.indexOf(item)
    if (index === -1 || !this.isEnabled(item)) return false
    this.index = index
    return true
  }
}
