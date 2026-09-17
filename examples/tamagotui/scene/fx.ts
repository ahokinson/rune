import { burstEmitter, Entity2D, type Particles, Vector2 } from "@ahokinson/rune"
import * as theme from "../theme"
import type { PetState } from "./state"

// Mood-driven particle emitters parked on the pet's head, built with the engine's
// `burstEmitter` factory. Continuous emitters (zzz, stink, sweat, and a slow hearts
// drift when happy) toggle their spawn rate from `setMood`; sparkles and the bulk
// of hearts are one-shot bursts fired by the World on care/evolve events. All
// five are children of this entity, so they tick and draw alongside the pet.
//
// Colours stick to the mid DMG shades so the FX read against the field in both
// the day (light) and night (inverted, dark) palettes — the lightest/darkest
// ends would vanish against one of the two.

const UP = -Math.PI / 2

export class MoodFx extends Entity2D {
  private readonly hearts: Particles
  private readonly zzz: Particles
  private readonly stink: Particles
  private readonly sweat: Particles
  private readonly sparkles: Particles

  constructor() {
    super({ zIndex: 20 })
    this.hearts = burstEmitter({
      characters: ["♥"],
      color: theme.BELLY,
      lifetimeMilliseconds: 1000,
      speedRange: [4, 9],
      angleRange: [UP - 0.4, UP + 0.4],
      gravity: new Vector2(0, -2),
    })
    this.zzz = burstEmitter({
      characters: ["z", "Z"],
      color: theme.BODY,
      lifetimeMilliseconds: 1300,
      speedRange: [3, 6],
      angleRange: [UP - 0.25, UP + 0.25],
      gravity: new Vector2(0, -1),
    })
    this.stink = burstEmitter({
      characters: ["~", "≈"],
      color: theme.BODY_DARK,
      lifetimeMilliseconds: 900,
      speedRange: [1, 3],
      angleRange: [UP - 0.5, UP + 0.5],
      gravity: new Vector2(0, -0.5),
    })
    this.sweat = burstEmitter({
      characters: ["`", "'"],
      color: theme.BODY,
      lifetimeMilliseconds: 600,
      speedRange: [3, 7],
      angleRange: [UP + 0.3, UP + 0.8],
      gravity: new Vector2(0, 1),
    })
    this.sparkles = burstEmitter({
      characters: ["✦", "·"],
      color: theme.BELLY,
      lifetimeMilliseconds: 700,
      speedRange: [5, 11],
      angleRange: [0, Math.PI * 2],
    })
    this.addAll([this.hearts, this.zzz, this.stink, this.sweat, this.sparkles])
  }

  // Park every emitter at the pet's head, in canvas-cell coords. Called from the
  // pet's draw() each frame (one-frame lag on spawn position is invisible).
  setOrigin(x: number, y: number): void {
    this.hearts.origin.set(x, y)
    this.zzz.origin.set(x, y)
    this.stink.origin.set(x, y)
    this.sweat.origin.set(x, y)
    this.sparkles.origin.set(x, y)
  }

  // Toggle the continuous emitters from the live stats. Hearts drift slowly while
  // the pet is happy; zzz only while sleeping; stink when sick or filthy; sweat
  // when starving. Sparkles are burst-only so their rate stays 0 here.
  setMood(state: PetState): void {
    this.hearts.ratePerSecond = state.happiness >= 0.75 && !state.dead && !state.sleeping ? 0.8 : 0
    this.zzz.ratePerSecond = state.sleeping ? 1.5 : 0
    this.stink.ratePerSecond = state.sick || state.hygiene < 0.3 ? 1.2 : 0
    this.sweat.ratePerSecond = state.hunger < 0.3 && !state.sleeping && !state.dead ? 1.0 : 0
  }

  burstHearts(): void {
    this.hearts.emit(6)
  }

  burstSparkles(): void {
    this.sparkles.emit(8)
  }
}
