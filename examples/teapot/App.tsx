import { Application, FullscreenCanvas } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import { MeshView } from "./scene/MeshView"

export function App(): JSX.Element {
  return (
    <Application ticksPerSecond={60}>
      <FullscreenCanvas>
        <MeshView />
      </FullscreenCanvas>
    </Application>
  )
}
