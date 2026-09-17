import { Color, Scene, SceneRenderer, useActions, useScene, useTerminal, Vector2 } from "@ahokinson/rune"
import { type JSX, onCleanup, onMount } from "solid-js"
import { moveBindings } from "../actions"
import { Banner } from "./Banner"
import { Mover } from "./Mover"

// The game scene. A <Scene> owns the entity tree and a camera; <SceneRenderer>
// draws it every frame. Build your game by adding entities here.
export function World(): JSX.Element {
  return (
    <Scene name="world">
      <WorldInner />
    </Scene>
  )
}

function WorldInner(): JSX.Element {
  const scene = useScene()
  const terminal = useTerminal()
  const controls = useActions(moveBindings)

  const size = terminal()
  const area = new Vector2(size.width, size.height)
  const mover = new Mover({ position: new Vector2((area.x / 2) | 0, (area.y / 2) | 0), controls, area })
  const banner = new Banner()

  onMount(() => {
    scene.add(banner)
    scene.add(mover)
  })
  onCleanup(() => {
    scene.remove(banner)
    scene.remove(mover)
  })

  return <SceneRenderer clearColor={Color.fromHex("#0f172a")} />
}
