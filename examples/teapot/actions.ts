import { type ActionBindings, Keys } from "@ahokinson/rune"

// Player controls for the mesh viewer. Arrow/AD cycle the mesh, W toggles
// wireframe, Space pauses the auto-spin; S/T cycle shading mode and texture, H
// toggles shadows, P drops the mesh into a bouncing physics sim.
export type MeshAction =
  | "nextMesh"
  | "prevMesh"
  | "toggleWireframe"
  | "togglePause"
  | "cycleShader"
  | "cycleTexture"
  | "toggleShadows"
  | "togglePhysics"

export const meshBindings: ActionBindings<MeshAction> = {
  nextMesh: [Keys.Right, Keys.D],
  prevMesh: [Keys.Left, Keys.A],
  toggleWireframe: [Keys.W, Keys.Tab],
  togglePause: [Keys.Space],
  cycleShader: [Keys.S],
  cycleTexture: [Keys.T],
  toggleShadows: [Keys.H],
  togglePhysics: [Keys.P],
}
