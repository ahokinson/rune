import { type ActionBindings, Keys } from "@ahokinson/rune"

// Map game actions to keys. Listing two keys per action lets arrows and WASD
// both work. Read these through useActions(moveBindings) in a scene.
export type MoveAction = "up" | "down" | "left" | "right"

export const moveBindings: ActionBindings<MoveAction> = {
  up: [Keys.Up, Keys.W],
  down: [Keys.Down, Keys.S],
  left: [Keys.Left, Keys.A],
  right: [Keys.Right, Keys.D],
}
