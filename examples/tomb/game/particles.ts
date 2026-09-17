import { burstEmitter, Color, type Particles, Vector2 } from "@ahokinson/rune"

// Muzzle flash sparks fired from screen center when the weapon shoots.
export function createMuzzleParticles(canvasWidth: number, canvasHeight: number): Particles {
  return burstEmitter({
    origin: new Vector2(canvasWidth / 2, canvasHeight / 2 - 1),
    lifetimeMilliseconds: 220,
    speedRange: [4, 7],
    angleRange: [-Math.PI / 8, Math.PI / 8],
    characters: ["*", "+", ".", "~"],
    color: Color.fromBytes(255, 220, 120),
    maximumParticles: 64,
    zIndex: 500,
  })
}

// Blood spray emitted at an enemy's screen position when it is hit.
export function createBloodParticles(): Particles {
  return burstEmitter({
    lifetimeMilliseconds: 480,
    speedRange: [6, 12],
    angleRange: [Math.PI / 6, (5 * Math.PI) / 6],
    gravity: new Vector2(0, 38),
    characters: ["*", "+", ".", "'"],
    color: Color.fromBytes(190, 30, 30),
    maximumParticles: 128,
    zIndex: 600,
  })
}
