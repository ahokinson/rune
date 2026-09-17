import { clamp, Random, Scene, SceneRenderer, useActions, useAudio, useFixedUpdate, useScene, useUpdate } from "@ahokinson/rune"
import { type JSX, onCleanup, onMount } from "solid-js"
import { petBindings } from "../actions"
import { loadSounds } from "../sounds"
import * as theme from "../theme"
import { Background } from "./Background"
import { EvolveReveal } from "./EvolveReveal"
import { createPetUi, Hud } from "./Hud"
import { Minigame } from "./Minigame"
import { MENU, MenuAction } from "./menu"
import { Pet } from "./Pet"
import { Poop } from "./Poop"
import { Prop, PropKind } from "./props"
import {
  ageDays,
  CRITICAL,
  createPetState,
  decideBranch,
  hasCriticalNeed,
  isNightPhase,
  LifeStage,
  lifeStageFor,
  MAX_AGE_DAYS,
  STAGE_DAYS,
} from "./state"

// Decay per second (stats are 0..1). Slow on purpose: this is a pet you leave
// running in a corner and check on every so often, so a full meter drains over
// ~15-20 minutes and a whole life plays out across a couple of hours.
const HUNGER_DECAY = 0.001
const HAPPY_DECAY = 0.0009
const ENERGY_DECAY = 0.0007
const ENERGY_RECOVERY = 0.004
const HYGIENE_DECAY = 0.0004
const HYGIENE_PER_POOP = 0.0015
const HEALTH_EROSION = 0.001
const HEALTH_RECOVERY = 0.0008

// Poop cadence and how many piles can stack up.
const POOP_INTERVAL_SECONDS = 180
const MAX_POOPS = 4

// A need left critical this long costs one care mistake; enough of them (or a
// flatlined health bar, or old age) ends the pet.
const MISTAKE_GRACE_SECONDS = 120
const FATAL_MISTAKES = 6
const FATAL_HEALTH_SECONDS = 60

// Floor-line X offsets for the props the pet's AI heads for.
const BOWL_X = -22
const BED_X = -8
const TOY_X = 22

export function World(): JSX.Element {
  return (
    <Scene name="tamagotui">
      <WorldInner />
    </Scene>
  )
}

function WorldInner(): JSX.Element {
  const scene = useScene()
  const controls = useActions(petBindings)
  const audio = useAudio()
  const random = new Random(7)

  const state = createPetState()
  const ui = createPetUi()
  const background = new Background({ state })
  const bowl = new Prop({ kind: PropKind.Bowl, offsetCells: BOWL_X })
  const bed = new Prop({ kind: PropKind.Bed, offsetCells: BED_X })
  const toy = new Prop({ kind: PropKind.Toy, offsetCells: TOY_X })
  const pet = new Pet({ state, targets: { food: BOWL_X, sleep: BED_X, play: TOY_X } })
  const hud = new Hud({ state, ui })
  let poops: Poop[] = []

  let poopTimer = 0
  let alertTimer = 0
  let fatalTimer = 0
  let wasNight = false
  let minigame: Minigame | null = null

  function message(text: string): void {
    ui.message = text
    ui.messageRemaining = 1600
    ui.messageAge = 0
  }

  function spawnPoop(): void {
    if (poops.length >= MAX_POOPS) return
    const poop = new Poop({ offsetCells: Math.round(random.float(-18, 18)) })
    poops.push(poop)
    scene.add(poop)
  }

  function clearPoops(): void {
    for (const poop of poops) poop.markForRemoval()
    poops = []
  }

  // The Play action launches a reaction minigame instead of applying the payoff
  // directly; the score from the minigame scales the result.
  function startMinigame(): void {
    if (minigame) return
    minigame = new Minigame({
      state,
      onDone: (score) => {
        applyPlayResult(score)
        minigame = null
      },
    })
    scene.add(minigame)
  }

  function applyPlayResult(score: number): void {
    if (state.dead) return
    if (score <= 0) {
      audio.play("miss")
      message("missed!")
      return
    }
    state.happiness = clamp(state.happiness + 0.15 + score * 0.35, 0, 1)
    state.energy = clamp(state.energy - 0.12, 0, 1)
    state.weight = Math.max(1, state.weight - 0.5)
    if (score >= 1) {
      audio.play("win")
      message("PERFECT!")
      pet.fx.burstHearts()
    } else {
      audio.play("play")
      message(score > 0.6 ? "nice!" : "ok")
    }
  }

  function perform(action: MenuAction): void {
    if (state.dead) return
    switch (action) {
      case MenuAction.Feed:
        state.hunger = clamp(state.hunger + 0.34, 0, 1)
        state.weight += 1
        audio.play("feed")
        message("yum!")
        pet.fx.burstHearts()
        break
      case MenuAction.Play:
        if (state.energy < 0.1) {
          message("too tired…")
          break
        }
        startMinigame()
        break
      case MenuAction.Clean:
        clearPoops()
        state.hygiene = 1
        audio.play("clean")
        message("squeaky!")
        break
      case MenuAction.Medicine:
        if (state.sick) {
          state.sick = false
          state.health = clamp(state.health + 0.4, 0, 1)
          audio.play("cure")
          message("all better!")
        } else {
          message("not sick")
        }
        break
      case MenuAction.Discipline:
        state.discipline = clamp(state.discipline + 0.2, 0, 1)
        audio.play("play")
        message("behave!")
        break
      case MenuAction.Light:
        state.sleeping = !state.sleeping
        break
    }
  }

  function reset(): void {
    clearPoops()
    Object.assign(state, createPetState())
    poopTimer = 0
    alertTimer = 0
    fatalTimer = 0
    audio.play("evolve")
    message("a new egg!")
  }

  // Gameplay input is read in the fixed step so each discrete press is delivered
  // to exactly one tick — the engine's canonical place for wasPressed(). While the
  // minigame is up, confirm feeds it instead of the menu and ◄/► are locked; the
  // minigame entity never reads input itself, so there is no double-fire.
  useFixedUpdate(() => {
    if (state.dead) {
      if (controls.wasPressed("reset")) reset()
      return
    }
    const confirm = controls.wasPressed("confirm")
    if (minigame !== null) {
      if (confirm) minigame.resolve()
      return
    }
    if (controls.wasPressed("prev")) {
      ui.menuIndex = (ui.menuIndex - 1 + MENU.length) % MENU.length
      audio.play("select")
    }
    if (controls.wasPressed("next")) {
      ui.menuIndex = (ui.menuIndex + 1) % MENU.length
      audio.play("select")
    }
    if (confirm) {
      const item = MENU[ui.menuIndex % MENU.length]
      if (item) perform(item.action)
    }
  })

  useUpdate((deltaMilliseconds) => {
    const deltaSeconds = deltaMilliseconds / 1000
    if (ui.messageRemaining > 0) ui.messageRemaining -= deltaMilliseconds

    // Mood particles track the live stats every frame.
    pet.fx.setMood(state)

    if (state.dead) return // the pet (added to the scene) still ticks its own animation

    // --- Clock, evolution, day/night --------------------------------------
    state.ageSeconds += deltaSeconds
    // Decide the good/bad branch the first time the pet is old enough to grow
    // into a teen, so lifeStageFor resolves to the right stage in the same tick.
    if (state.branch === null && ageDays(state) >= STAGE_DAYS[LifeStage.Goober]) {
      state.branch = decideBranch(state)
    }
    const stage = lifeStageFor(state)
    if (stage !== state.stage) {
      state.stage = stage
      if (stage !== LifeStage.Egg) {
        audio.play("evolve")
        pet.fx.burstSparkles()
        scene.add(new EvolveReveal({ state, stage }))
        message(stage === LifeStage.Mochi ? "it hatched!" : `now a ${stage.toUpperCase()}!`)
      }
    }

    const night = isNightPhase(state)
    if (night !== wasNight) {
      state.sleeping = night // follow the day/night cycle on each transition
      wasNight = night
    }

    // --- Stat decay / recovery --------------------------------------------
    if (state.stage !== LifeStage.Egg) {
      state.hunger = clamp(state.hunger - HUNGER_DECAY * deltaSeconds, 0, 1)
      state.happiness = clamp(state.happiness - HAPPY_DECAY * deltaSeconds, 0, 1)
      if (state.sleeping) {
        state.energy = clamp(state.energy + ENERGY_RECOVERY * deltaSeconds, 0, 1)
      } else {
        state.energy = clamp(state.energy - ENERGY_DECAY * deltaSeconds, 0, 1)
      }
      const hygieneDrain = HYGIENE_DECAY + HYGIENE_PER_POOP * poops.length
      state.hygiene = clamp(state.hygiene - hygieneDrain * deltaSeconds, 0, 1)

      const ailing = state.hunger <= CRITICAL || state.hygiene <= CRITICAL || state.sick
      if (ailing) state.health = clamp(state.health - HEALTH_EROSION * deltaSeconds, 0, 1)
      else state.health = clamp(state.health + HEALTH_RECOVERY * deltaSeconds, 0, 1)

      // --- Poop ----------------------------------------------------------
      poopTimer += deltaSeconds
      const interval = POOP_INTERVAL_SECONDS * (state.hunger > 0.6 ? 0.7 : 1)
      if (poopTimer >= interval) {
        poopTimer = 0
        spawnPoop()
      }

      // --- Sickness ------------------------------------------------------
      if (!state.sick && (state.hygiene <= 0.05 || state.health <= 0.15)) state.sick = true

      // --- Care mistakes / death ----------------------------------------
      if (hasCriticalNeed(state)) {
        alertTimer += deltaSeconds
        if (alertTimer >= MISTAKE_GRACE_SECONDS) {
          state.careMistakes += 1
          alertTimer = 0
        }
      } else {
        alertTimer = 0
      }

      if (state.health <= 0) fatalTimer += deltaSeconds
      else fatalTimer = 0

      if (
        state.careMistakes >= FATAL_MISTAKES ||
        fatalTimer >= FATAL_HEALTH_SECONDS ||
        ageDays(state) >= MAX_AGE_DAYS
      ) {
        state.dead = true
        state.sleeping = false
        audio.play("sad")
        message("")
      }
    }
  })

  onMount(() => {
    // Beeps are synthesised at runtime (see ../sounds) — no .wav assets to ship.
    void loadSounds(audio)
    scene.autoPrune = true
    scene.addAll([background, bowl, bed, toy, pet, hud])
  })
  onCleanup(() => {
    scene.clear()
  })

  return <SceneRenderer clearColor={theme.GB3} />
}
