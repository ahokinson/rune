// Shared mutable run state, threaded through the entities that change or display
// it: the running score and coin tally, remaining lives, the countdown timer, the
// world label, and the win / game-over flags.
export interface Session {
  score: number
  coins: number
  lives: number
  time: number
  world: string
  won: boolean
  gameOver: boolean
}

const STARTING_LIVES = 3
const STARTING_TIME = 400

export function createSession(): Session {
  return {
    score: 0,
    coins: 0,
    lives: STARTING_LIVES,
    time: STARTING_TIME,
    world: "1-1",
    won: false,
    gameOver: false,
  }
}
