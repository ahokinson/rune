import { type ActionBindings, Keys } from "@ahokinson/rune"

// The authentic three-button nav: ◄ ► move the menu cursor, enter activates the
// selected care action. R hatches a fresh egg once the pet has passed on. (esc
// quits, handled by the runtime.)
export type PetAction = "prev" | "next" | "confirm" | "reset"

export const petBindings: ActionBindings<PetAction> = {
  prev: [Keys.Left],
  next: [Keys.Right],
  confirm: [Keys.Enter],
  reset: [Keys.R],
}
