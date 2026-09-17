import { Application, FullscreenCanvas, type TerminalSize } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import { Globe } from "./globe/Globe"

export function App(): JSX.Element {
  return (
    <Application ticksPerSecond={30}>
      <FullscreenCanvas>{(size: TerminalSize) => <Globe width={size.width} height={size.height} />}</FullscreenCanvas>
    </Application>
  )
}
