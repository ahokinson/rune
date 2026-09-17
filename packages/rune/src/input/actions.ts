/**
 * Higher-level "action" abstraction layered over raw keyboard/mouse snapshots:
 * bind one or more inputs to a named action and query the action's state.
 *
 * @module
 */

import type { GamepadButton, GamepadSnapshot } from "./gamepad"
import type { KeyboardSnapshot } from "./keyboard"
import { MouseButton, type MouseSnapshot } from "./mouse"

/**
 * Map of action name to the list of bindings that trigger it. A binding is a
 * keyboard key string, a `"mouse:<button>"` string (`left`/`right`/`middle`),
 * or a `"gamepad:<button>"` string (a {@link GamepadButton} value, e.g.
 * `"gamepad:south"`).
 *
 * @typeParam TAction - Union of action names.
 */
export type ActionBindings<TAction extends string> = Record<TAction, readonly string[]>

/**
 * Read-only view of an action's current and edge state, mirroring the
 * keyboard/mouse snapshot API but keyed by action name.
 *
 * @typeParam TAction - Union of action names.
 */
export interface ActionSnapshot<TAction extends string> {
  /** `true` while any binding of `action` is currently held. */
  isDown(action: TAction): boolean
  /** `true` on the frame any binding of `action` transitioned from up to down. */
  wasPressed(action: TAction): boolean
  /** `true` on the frame any binding of `action` transitioned from down to up. */
  wasReleased(action: TAction): boolean
}

const MOUSE_PREFIX = "mouse:"
const GAMEPAD_PREFIX = "gamepad:"

const MOUSE_BUTTONS: Record<string, MouseButton> = {
  left: MouseButton.Left,
  right: MouseButton.Right,
  middle: MouseButton.Middle,
}

function mouseButtonFromBinding(binding: string): MouseButton | null {
  if (!binding.startsWith(MOUSE_PREFIX)) return null
  return MOUSE_BUTTONS[binding.slice(MOUSE_PREFIX.length)] ?? null
}

/**
 * Build an {@link ActionSnapshot} from a binding map plus the current keyboard
 * and (optionally) mouse and gamepad snapshots. Mouse/gamepad bindings are only
 * consulted when the corresponding snapshot is supplied.
 *
 * @typeParam TAction - Union of action names.
 * @param bindings - Action → binding list map.
 * @param keyboard - Keyboard snapshot backing key bindings.
 * @param mouse - Optional mouse snapshot backing `"mouse:<button>"` bindings.
 * @param gamepad - Optional gamepad snapshot backing `"gamepad:<button>"` bindings.
 * @returns A snapshot exposing `isDown`/`wasPressed`/`wasReleased` per action.
 */
export function createActionMap<TAction extends string>(
  bindings: ActionBindings<TAction>,
  keyboard: KeyboardSnapshot,
  mouse?: MouseSnapshot,
  gamepad?: GamepadSnapshot,
): ActionSnapshot<TAction> {
  function any(
    action: TAction,
    keyboardCheck: (binding: string) => boolean,
    mouseCheck: (button: MouseButton) => boolean,
    gamepadCheck: (button: GamepadButton) => boolean,
  ): boolean {
    const items = bindings[action]
    if (!items) return false
    for (const binding of items) {
      if (binding.startsWith(GAMEPAD_PREFIX)) {
        if (gamepad && gamepadCheck(binding.slice(GAMEPAD_PREFIX.length) as GamepadButton)) return true
        continue
      }
      const mouseButton = mouseButtonFromBinding(binding)
      if (mouseButton !== null) {
        if (mouse && mouseCheck(mouseButton)) return true
      } else if (keyboardCheck(binding)) {
        return true
      }
    }
    return false
  }

  return {
    isDown(action) {
      return any(
        action,
        (key) => keyboard.isDown(key),
        (button) => mouse!.isDown(button),
        (button) => gamepad!.isDown(button),
      )
    },
    wasPressed(action) {
      return any(
        action,
        (key) => keyboard.wasPressed(key),
        (button) => mouse!.wasPressed(button),
        (button) => gamepad!.wasPressed(button),
      )
    },
    wasReleased(action) {
      return any(
        action,
        (key) => keyboard.wasReleased(key),
        (button) => mouse!.wasReleased(button),
        (button) => gamepad!.wasReleased(button),
      )
    },
  }
}
