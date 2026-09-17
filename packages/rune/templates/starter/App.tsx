import { Application, Canvas, useTerminal } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import { World } from "./scene/World"

// The App shell: <Application> drives the fixed-timestep loop, RNG, input and
// scene stack; <Canvas> is the terminal-sized drawing surface the scene renders
// into. Game content lives in the scene below.
export function App(): JSX.Element {
  return (
    <Application ticksPerSecond={60}>
      <Stage />
    </Application>
  )
}

function Stage(): JSX.Element {
  const terminal = useTerminal()
  const size = terminal()
  return (
    <Canvas width={size.width} height={size.height}>
      <World />
    </Canvas>
  )
}
