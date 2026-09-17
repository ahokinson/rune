import {
  Camera3D,
  Color,
  PerspectiveProjector3D,
  Scene,
  Scene3D,
  SceneRenderer,
  useActions,
  useApplication,
  useSceneEntities,
  Vector3,
  WorldView3D,
} from "@ahokinson/rune"
import type { JSX } from "solid-js"
import { meshBindings } from "../actions"
import { Hud } from "./Hud"
import { MeshStage } from "./MeshEntity"

const CLEAR_COLOR = Color.fromBytes(8, 10, 14)

export function MeshView(): JSX.Element {
  return (
    <Scene name="teapot">
      <MeshViewInner />
    </Scene>
  )
}

function MeshViewInner(): JSX.Element {
  const app = useApplication()
  const controls = useActions(meshBindings)

  // The 3D scene: one perspective camera, the mesh stage drawn through the shared
  // subpixel target (the renderMesh rasterizer).
  const camera = new Camera3D({
    position: new Vector3(0, 0, 2.6),
    forward: new Vector3(0, 0, -1),
    up: new Vector3(0, -1, 0),
    projector: new PerspectiveProjector3D({ fieldOfView: Math.PI / 3, near: 0.05 }),
  })
  const world = new Scene3D({ camera, subpixel: true, clearColor: CLEAR_COLOR })
  const stage = new MeshStage(controls, app.mouse)
  world.add(stage)

  // The 2D scene composites the 3D view (via the WorldView3D bridge) with the HUD
  // layered on top by zIndex.
  const view = new WorldView3D({ world })
  const hud = new Hud(stage)

  useSceneEntities(() => [view, hud])

  return <SceneRenderer clearColor={CLEAR_COLOR} />
}
