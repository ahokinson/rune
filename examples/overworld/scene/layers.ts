import { CollisionLayer } from "@ahokinson/rune"

// Collision layers for the engine's detectCollisions() pass. The runner sits on
// PLAYER; simple overlap pickups (coins) carry a PLAYER mask and collect
// themselves via onCollide(). Enemy combat keeps its own bespoke resolution (stomp
// vs. hit vs. star) in Player, where the rules are richer than a layer test.
export const PLAYER_LAYER = CollisionLayer.bit(0)
