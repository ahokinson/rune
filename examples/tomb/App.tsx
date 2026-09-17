import {
  Application,
  type AssetPack,
  DebugOverlay,
  FullscreenCanvas,
  Scene,
  SceneSwitch,
  SystemAudioContext,
  type TerminalSize,
} from "@ahokinson/rune"
import { type JSX, Show } from "solid-js"
import { LevelAsset } from "./assets/level"
import { loadAssets } from "./assets/manifest"
import { GameOverScreen } from "./components/GameOverScreen"
import { GameScreen } from "./components/GameScreen"
import { TitleScreen } from "./components/TitleScreen"
import { WinScreen } from "./components/WinScreen"
import { createGameState } from "./state"

export function App(): JSX.Element {
  const audio = new SystemAudioContext()
  const pack = loadAssets()
  return (
    <Application ticksPerSecond={30} randomSeed={1} audio={audio}>
      <Stage pack={pack} />
    </Application>
  )
}

function Stage(props: { pack: AssetPack }): JSX.Element {
  const campaignLevels = props.pack.getAll(LevelAsset).filter((l) => !l.document.name.endsWith("Test"))
  const isDev = !!process.env.TOMB_TEST_LEVEL
  const levelCount = isDev ? 1 : campaignLevels.length

  return (
    <FullscreenCanvas>
      {(size: TerminalSize) => {
        const state = createGameState(size.width, size.height, levelCount)
        return (
          <>
            <SceneSwitch active={state.screen}>
              {{
                title: () => (
                  <Scene name="title">
                    <TitleScreen state={state} />
                  </Scene>
                ),
                game: () => (
                  <Scene name="game">
                    <Show keyed when={state.level() + 1}>
                      {() => <GameScreen state={state} pack={props.pack} />}
                    </Show>
                  </Scene>
                ),
                over: () => (
                  <Scene name="over">
                    <GameOverScreen state={state} />
                  </Scene>
                ),
                win: () => (
                  <Scene name="win">
                    <Show keyed when={state.level() + 1}>
                      {() => <WinScreen state={state} />}
                    </Show>
                  </Scene>
                ),
              }}
            </SceneSwitch>
            <DebugOverlay corner="bottomRight" />
          </>
        )
      }}
    </FullscreenCanvas>
  )
}
