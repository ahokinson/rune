import { type ActionBindings, Keys } from "@ahokinson/rune"

// Replay controls for the git visualizer. Mouse-drag orbits the camera (handled
// directly through the OrbitControl); the keyboard drives the replay clock:
// Space pauses, ←/→ slow down / speed up the timeline, R restarts from the first
// commit, L toggles cast shadows, and F snaps the camera tilt back to rest.
export type GourceAction = "togglePause" | "slower" | "faster" | "restart" | "reframe" | "toggleShadows"

export const gourceBindings: ActionBindings<GourceAction> = {
  togglePause: [Keys.Space],
  slower: [Keys.Left, Keys.A],
  faster: [Keys.Right, Keys.D],
  restart: [Keys.R],
  reframe: [Keys.F],
  toggleShadows: [Keys.L],
}
