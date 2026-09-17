import { SceneRenderer } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import type { GameState } from "../state"
import { CenteredOverlay } from "./CenteredOverlay"
import { useAdvanceOnKey } from "./input"

export interface GameOverScreenProps {
  state: GameState
}

export function GameOverScreen(props: GameOverScreenProps): JSX.Element {
  useAdvanceOnKey(() => {
    props.state.reset()
    props.state.setScreen("title")
  })

  return (
    <>
      <SceneRenderer />
      <CenteredOverlay>
        <text fg="red">☠ Y O U D I E D ☠</text>
        <text> </text>
        <text fg="cyan">press SPACE to return to title</text>
      </CenteredOverlay>
    </>
  )
}
