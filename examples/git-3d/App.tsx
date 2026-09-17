import { Application, FullscreenCanvas } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import { TreeView } from "./scene/TreeView"

export function App(): JSX.Element {
  return (
    <Application ticksPerSecond={60}>
      <FullscreenCanvas>
        <TreeView />
      </FullscreenCanvas>
    </Application>
  )
}
