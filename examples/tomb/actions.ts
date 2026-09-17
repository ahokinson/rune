import { type ActionBindings, Keys } from "@ahokinson/rune"

// First-person controls: WASD/arrows move and strafe, mouse fires, Space jumps,
// E/F open doors and flip switches. Two bindings per action so arrows and WASD
// both work.
export type PlayerAction = "moveForward" | "moveBackward" | "strafeLeft" | "strafeRight" | "fire" | "jump" | "use"

export const playerBindings: ActionBindings<PlayerAction> = {
  moveForward: [Keys.W, Keys.Up],
  moveBackward: [Keys.S, Keys.Down],
  strafeLeft: [Keys.A, Keys.Left],
  strafeRight: [Keys.D, Keys.Right],
  fire: ["mouse:left"],
  jump: [Keys.Space],
  use: [Keys.E, Keys.F],
}
