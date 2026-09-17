// Shared mutable pet state, threaded through the entities and the sim loop the
// same way overworld threads its Session. Stats are 0..1 floats; the HUD renders
// each as a row of hearts. Time is compressed: one real minute is one game day,
// so a full life plays out in a sitting.

// Creature evolution line. The good line is Mochi → Goober → Chonkus. A
// neglected teen instead grows into Grouch, then Ghoul — same life span, but a
// grumpier face. The branch is decided once, the moment the teen stage begins,
// and sticks for life.
export enum LifeStage {
  Egg = "egg",
  Mochi = "mochi",
  Goober = "goober",
  Chonkus = "chonkus",
  Grouch = "grouch",
  Ghoul = "ghoul",
}

export enum Branch {
  Good = "good",
  Bad = "bad",
}

export enum Mood {
  Idle = "idle",
  Happy = "happy",
  Hungry = "hungry",
  Tired = "tired",
  Sick = "sick",
  Sleeping = "sleeping",
  Dead = "dead",
}

export const SECONDS_PER_DAY = 1200

// Age (in days) at which each stage begins, and the age the pet dies of old age.
// The bad-line stages share their good counterpart's threshold; which one you
// get is decided by `branch`, set at the teen transition.
export const STAGE_DAYS: Record<LifeStage, number> = {
  [LifeStage.Egg]: 0,
  [LifeStage.Mochi]: 0.15,
  [LifeStage.Goober]: 1,
  [LifeStage.Chonkus]: 3,
  [LifeStage.Grouch]: 1,
  [LifeStage.Ghoul]: 3,
}
export const MAX_AGE_DAYS = 8

// The teen and adult stages where the good/bad split happens.
export const TEEN_STAGES: readonly LifeStage[] = [LifeStage.Goober, LifeStage.Grouch]
export const ADULT_STAGES: readonly LifeStage[] = [LifeStage.Chonkus, LifeStage.Ghoul]
export function isTeen(stage: LifeStage): boolean {
  return TEEN_STAGES.includes(stage)
}
export function isAdult(stage: LifeStage): boolean {
  return ADULT_STAGES.includes(stage)
}

// Night runs for the back third of each day; the pet sleeps through it.
export const NIGHT_START = 0.66
export const NIGHT_END = 1

export interface PetState {
  hunger: number // 1 = well fed, 0 = starving
  happiness: number
  energy: number
  hygiene: number
  health: number
  discipline: number
  weight: number
  ageSeconds: number
  careMistakes: number
  sleeping: boolean
  sick: boolean
  dead: boolean
  stage: LifeStage
  // null until the teen transition decides it; after that it's fixed for life
  // and steers `lifeStageFor` toward the good or bad line.
  branch: Branch | null
}

export function createPetState(): PetState {
  return {
    hunger: 1,
    happiness: 1,
    energy: 1,
    hygiene: 1,
    health: 1,
    discipline: 0.5,
    weight: 5,
    ageSeconds: 0,
    careMistakes: 0,
    sleeping: false,
    sick: false,
    dead: false,
    stage: LifeStage.Egg,
    branch: null,
  }
}

export function ageDays(state: PetState): number {
  return state.ageSeconds / SECONDS_PER_DAY
}

// Fraction through the current day, 0 (dawn) .. 1 (midnight).
export function dayPhase(state: PetState): number {
  return ageDays(state) % 1
}

export function isNightPhase(state: PetState): boolean {
  const phase = dayPhase(state)
  return phase >= NIGHT_START && phase < NIGHT_END
}

export function lifeStageFor(state: PetState): LifeStage {
  const days = ageDays(state)
  if (days >= STAGE_DAYS[LifeStage.Chonkus]) {
    return state.branch === Branch.Bad ? LifeStage.Ghoul : LifeStage.Chonkus
  }
  if (days >= STAGE_DAYS[LifeStage.Goober]) {
    return state.branch === Branch.Bad ? LifeStage.Grouch : LifeStage.Goober
  }
  if (days >= STAGE_DAYS[LifeStage.Mochi]) return LifeStage.Mochi
  return LifeStage.Egg
}

// Decide the good/bad branch at the moment the pet grows into its teen stage.
// A neglected pet (any of: too many care mistakes, low happiness, low health, or
// already sick when teen begins) goes down the bad line.
export function decideBranch(state: PetState): Branch {
  if (state.careMistakes >= 2 || state.happiness < 0.4 || state.health < 0.4 || state.sick) {
    return Branch.Bad
  }
  return Branch.Good
}

// A need at or below this is "critical" — the HUD flashes an alert and ignoring
// it long enough costs a care mistake.
export const CRITICAL = 0.2

export function moodFor(state: PetState): Mood {
  if (state.dead) return Mood.Dead
  if (state.sleeping) return Mood.Sleeping
  if (state.sick) return Mood.Sick
  if (state.hunger <= CRITICAL) return Mood.Hungry
  if (state.energy <= CRITICAL) return Mood.Tired
  if (state.happiness >= 0.75 && state.hunger >= 0.5) return Mood.Happy
  return Mood.Idle
}

// Which needs are currently critical (drives the HUD alert glyph + beep).
export function hasCriticalNeed(state: PetState): boolean {
  if (state.dead || state.sleeping) return false
  return state.hunger <= CRITICAL || state.happiness <= CRITICAL || state.hygiene <= CRITICAL || state.sick
}
