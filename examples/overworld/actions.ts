import { type ActionBindings, GamepadButton, Keys } from "@ahokinson/rune"

// The runner's controls: walk left/right, jump, and throw a fireball (as Fire
// Mario). Two key choices per action so arrows and WASD both work, plus a
// standard-layout gamepad (dpad to move, South to jump, West to fire) — the
// `"gamepad:"` bindings are live wherever a controller source is available
// (e.g. the browser canvas via the engine's Web Gamepad polling).
export type RunAction = "left" | "right" | "jump" | "fire"

export const runBindings: ActionBindings<RunAction> = {
  left: [Keys.Left, Keys.A, `gamepad:${GamepadButton.DpadLeft}`],
  right: [Keys.Right, Keys.D, `gamepad:${GamepadButton.DpadRight}`],
  jump: [Keys.Space, Keys.Up, Keys.W, `gamepad:${GamepadButton.South}`],
  fire: [Keys.X, Keys.J, `gamepad:${GamepadButton.West}`],
}
