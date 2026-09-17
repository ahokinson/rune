import { Application, FullscreenCanvas, SystemAudioContext } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import { LcdPostFx } from "./scene/LcdPostFx"
import { World } from "./scene/World"

export function App(): JSX.Element {
  // Beeps are synthesised at runtime and played through the platform's audio
  // player; with no player available `play` simply no-ops, so the game runs silent.
  const audio = new SystemAudioContext()
  return (
    <Application ticksPerSecond={30} audio={audio}>
      <LcdPostFx />
      <FullscreenCanvas>
        <World />
      </FullscreenCanvas>
    </Application>
  )
}
