import { CollisionLayer } from "@ahokinson/rune"

// Collision layers used across the tomb game. Triggers test the player layer
// against their trigger mask; the player sits on PLAYER_LAYER.
export const PLAYER_LAYER = CollisionLayer.bit(0)
export const PICKUP_LAYER = CollisionLayer.bit(2)
export const EXIT_LAYER = CollisionLayer.bit(3)
