import { type Accessor, createSignal, type Setter } from "solid-js"

export type Screen = "title" | "game" | "over" | "win"

export const STARTING_HEALTH = 100
export const STARTING_AMMO = 50

export interface GameState {
  screen: Accessor<Screen>
  setScreen: Setter<Screen>
  health: Accessor<number>
  setHealth: Setter<number>
  ammo: Accessor<number>
  setAmmo: Setter<number>
  level: Accessor<number>
  setLevel: Setter<number>
  canvasWidth: number
  canvasHeight: number
  levelCount: number
  reset: () => void
  nextLevel: () => boolean
}

export function createGameState(canvasWidth: number, canvasHeight: number, levelCount: number): GameState {
  const [screen, setScreen] = createSignal<Screen>("title")
  const [health, setHealth] = createSignal(STARTING_HEALTH)
  const [ammo, setAmmo] = createSignal(STARTING_AMMO)
  const [level, setLevel] = createSignal(0)
  return {
    screen,
    setScreen,
    health,
    setHealth,
    ammo,
    setAmmo,
    level,
    setLevel,
    canvasWidth,
    canvasHeight,
    levelCount,
    reset() {
      setHealth(STARTING_HEALTH)
      setAmmo(STARTING_AMMO)
      setLevel(0)
    },
    nextLevel() {
      if (level() + 1 >= levelCount) {
        setScreen("title")
        return false
      }
      setScreen("win")
      return true
    },
  }
}
