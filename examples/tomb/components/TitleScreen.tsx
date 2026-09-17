import { SceneRenderer } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import type { GameState } from "../state"
import { CenteredOverlay } from "./CenteredOverlay"
import { useAdvanceOnKey } from "./input"

export interface TitleScreenProps {
  state: GameState
}

export function TitleScreen(props: TitleScreenProps): JSX.Element {
  useAdvanceOnKey(() => {
    props.state.reset()
    props.state.setScreen("game")
  })

  return (
    <>
      <SceneRenderer />
      <CenteredOverlay>
        <text fg="red">☠ T O M B ☠</text>
        <text> </text>
        <text>WASD to move, Q/E or arrows to turn.</text>
        <text>SPACE to jump, click to fire. Reach the exit pad to win.</text>
        <text> </text>
        <text fg="cyan">press SPACE or ENTER to start</text>
        <text fg="gray">ESC to quit</text>
      </CenteredOverlay>
    </>
  )
}
