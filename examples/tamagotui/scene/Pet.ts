import {
  type AnimatedSprite,
  type Camera,
  type CanvasSurface,
  drawPixelSprite,
  Entity2D,
  type PixelSprite,
  Random,
  StateMachine,
} from "@ahokinson/rune"
import { MoodFx } from "./fx"
import { buildPetAnimation } from "./sprites"
import { LifeStage, Mood, moodFor, type PetState } from "./state"

// Horizontal wander, in cells per second, and how far the pet strays from
// centre before turning back.
const WANDER_SPEED = 6
const WANDER_RANGE = 10
// The pet sits a little above the vertical middle so the HUD has room below.
const VERTICAL_FRACTION = 0.42

// The autonomous states. Each frame `decide()` picks the one that fits the pet's
// stats and the machine transitions (a no-op if it's already current). Each
// state's onUpdate steers `offsetCells` toward a target X and sets `moving` so
// the clip picks the walk loop only while actually travelling.
type PetAiState = "wander" | "seekFood" | "seekToy" | "goSleep" | "alert" | "dead"

export interface PetTargets {
  // Floor-line X offsets (cells from centre) the AI heads for per need.
  food: number
  sleep: number
  play: number
}

export interface PetOptions {
  state: PetState
  targets: PetTargets
}

export class Pet extends Entity2D {
  private readonly state: PetState
  private readonly targets: PetTargets
  private animation: AnimatedSprite<PixelSprite>
  private renderedStage: LifeStage
  private offsetCells = 0
  private direction = 1
  private moving = false
  private readonly ai: StateMachine<PetAiState>
  private readonly random = new Random(42)
  private targetX = 0
  // Mood particles, parented to the pet so they track its head as it wanders.
  readonly fx: MoodFx

  constructor(options: PetOptions) {
    super({ zIndex: 10 })
    this.state = options.state
    this.targets = options.targets
    this.renderedStage = options.state.stage
    this.animation = buildPetAnimation(this.renderedStage)
    this.ai = this.buildAi()
    this.fx = new MoodFx()
    this.add(this.fx)
  }

  private buildAi(): StateMachine<PetAiState> {
    const machine = new StateMachine<PetAiState>()

    const steer = (target: number): void => {
      this.targetX = target
    }

    machine.addState("wander", {
      onEnter: () => steer(this.random.float(-WANDER_RANGE, WANDER_RANGE)),
      onUpdate: (deltaMilliseconds) => this.stepTowards(deltaMilliseconds),
    })
    machine.addState("seekFood", {
      onEnter: () => steer(this.targets.food),
      onUpdate: (deltaMilliseconds) => this.stepTowards(deltaMilliseconds),
    })
    machine.addState("seekToy", {
      onEnter: () => steer(this.targets.play),
      onUpdate: (deltaMilliseconds) => this.stepTowards(deltaMilliseconds),
    })
    machine.addState("goSleep", {
      onEnter: () => steer(this.targets.sleep),
      onUpdate: (deltaMilliseconds) => this.stepTowards(deltaMilliseconds),
    })
    machine.addState("alert", {
      onEnter: () => steer(0),
      onUpdate: (deltaMilliseconds) => this.stepTowards(deltaMilliseconds),
    })
    machine.addState("dead", {
      onEnter: () => {
        this.moving = false
        this.targetX = this.offsetCells
      },
    })

    machine.transitionTo("wander")
    return machine
  }

  // Move `offsetCells` toward `targetX` at WANDER_SPEED; `moving` is true only
  // while there's ground to cover, so the walk clip stops cleanly on arrival.
  private stepTowards(deltaMilliseconds: number): void {
    const deltaSeconds = deltaMilliseconds / 1000
    const delta = this.targetX - this.offsetCells
    const distance = Math.abs(delta)
    if (distance < 0.5) {
      this.moving = false
      this.offsetCells = this.targetX
      return
    }
    this.direction = delta >= 0 ? 1 : -1
    const step = Math.min(distance, WANDER_SPEED * deltaSeconds)
    this.offsetCells += this.direction * step
    this.moving = true
  }

  // Pick the state that matches the pet's current stats. Called every frame; the
  // machine itself no-ops a transition to the current state.
  private decide(): PetAiState {
    if (this.state.dead) return "dead"
    if (this.state.sleeping) return "goSleep"
    if (this.state.hunger <= 0.4) return "seekFood"
    if (this.state.happiness >= 0.6 && this.state.energy >= 0.4) return "seekToy"
    if (this.state.happiness <= 0.2 || this.state.hunger <= 0.2 || this.state.sick) return "alert"
    return "wander"
  }

  override update(deltaMilliseconds: number): void {
    // Rebuild the sprite set when the pet grows into a new stage.
    if (this.state.stage !== this.renderedStage) {
      this.renderedStage = this.state.stage
      this.animation = buildPetAnimation(this.renderedStage)
      this.offsetCells = 0
    }

    const mood = moodFor(this.state)
    const settled = this.renderedStage === LifeStage.Egg || mood === Mood.Sleeping || mood === Mood.Dead

    // The egg doesn't move; once hatched the StateMachine drives all travel.
    if (settled) {
      this.moving = false
      if (this.state.dead) this.ai.transitionTo("dead")
    } else {
      this.ai.transitionTo(this.decide())
      this.ai.update(deltaMilliseconds)
    }

    const clip = this.renderedStage === LifeStage.Egg ? "egg" : this.moving ? "walk" : mood
    this.animation.play(clip)
    this.animation.update(deltaMilliseconds)
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const sprite = this.animation.currentFrame()
    const rows = Math.ceil(sprite.height / 2)
    const x = Math.round(canvas.width / 2 - sprite.width / 2 + this.offsetCells)
    const y = Math.round(canvas.height * VERTICAL_FRACTION - rows / 2)
    drawPixelSprite(canvas, sprite, x, y)
    // Position the mood emitters at the pet's head for this frame. Children draw
    // right after this, and particles spawn from this origin next update.
    this.fx.setOrigin(x + Math.round(sprite.width / 2), y - 1)
  }
}
