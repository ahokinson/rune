import type { Rectangle } from "@ahokinson/rune"

// The common surface the player, fireballs, and sliding shells treat enemies
// through: goombas and Koopas both expose whether they are still a threat, their
// world bounds, and a `kill` that flips them off the course (fireball / shell /
// star-invincible contact). Koopa-specific shell behavior is handled by the
// player via an instanceof check.
export interface Mob {
  alive: boolean
  readonly bounds: Rectangle
  kill(direction: number): void
}
