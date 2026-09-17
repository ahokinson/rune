import { Application, FullscreenCanvas } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import { World } from "./scene/World"

export function App(): JSX.Element {
  return (
    <Application ticksPerSecond={60}>
      <FullscreenCanvas>
        <World />
      </FullscreenCanvas>
    </Application>
  )
}
