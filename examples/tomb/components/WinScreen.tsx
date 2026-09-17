import { SceneRenderer } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import type { GameState } from "../state"
import { CenteredOverlay } from "./CenteredOverlay"
import { useAdvanceOnKey } from "./input"

export interface WinScreenProps {
  state: GameState
}

export function WinScreen(props: WinScreenProps): JSX.Element {
  const totalLevels = props.state.levelCount
  const currentLevel = props.state.level()

  useAdvanceOnKey(() => {
    props.state.setLevel(currentLevel + 1)
    props.state.setScreen("game")
  })

  return (
    <>
      <SceneRenderer />
      <CenteredOverlay>
        <text fg="yellow">⚔ L E V E L C L E A R ⚔</text>
        <text> </text>
        <text>
          Level {currentLevel + 1} of {totalLevels} complete.
        </text>
        <text> </text>
        <text fg="cyan">press SPACE to continue</text>
      </CenteredOverlay>
    </>
  )
}
