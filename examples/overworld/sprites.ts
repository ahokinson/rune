import { AnimatedSprite, Color, Sprite, type SpriteLegendEntry } from "@ahokinson/rune"
import * as theme from "./theme"

// Every filled sprite cell is a solid block tinted by the legend; the silhouette
// does the work. Spaces are transparent.
const BLOCK = "█"
function fill(color: Color): SpriteLegendEntry {
  return { character: BLOCK, foreground: color }
}

const CAP = Color.fromBytes(224, 64, 32)
const SKIN = Color.fromBytes(252, 196, 148)
const OVERALL = Color.fromBytes(40, 96, 216)
const BOOT = Color.fromBytes(120, 72, 32)

// Small / big Mario share this legend; fire Mario swaps cap and overalls for the
// white-and-red palette.
const PLAYER_LEGEND: Record<string, SpriteLegendEntry> = {
  c: fill(CAP),
  s: fill(SKIN),
  o: fill(OVERALL),
  b: fill(BOOT),
}
const FIRE_LEGEND: Record<string, SpriteLegendEntry> = {
  c: fill(theme.FIRE_CAP),
  s: fill(SKIN),
  o: fill(theme.FIRE_OVERALL),
  b: fill(BOOT),
}

// 3×4 small runner. The cap/skin/overalls stay put; only the boots shift to read
// as a stride, and the jump pose spreads the legs.
const SMALL_IDLE = `
ccc
sss
ooo
b b`
const SMALL_RUN_A = `
ccc
sss
ooo
bb `
const SMALL_RUN_B = `
ccc
sss
ooo
 bb`
const SMALL_JUMP = `
ccc
sso
ooo
b b`

// 3×6 big runner: a taller body with the same stride/jump treatment.
const BIG_IDLE = `
ccc
sss
oso
ooo
ooo
b b`
const BIG_RUN_A = `
ccc
sss
oso
ooo
ooo
bb `
const BIG_RUN_B = `
ccc
sss
oso
ooo
ooo
 bb`
const BIG_JUMP = `
ccc
sss
oso
ooo
oo
b b`

function clip(frames: Sprite[], frameDuration: number) {
  return { frames, frameDuration, loop: true }
}

// One AnimatedSprite holds every power state's clips so the player can `play` the
// right one without swapping the (readonly) animation. Clip names are
// `${power}-${motion}`; the player resizes its own box when the power changes.
export function buildMarioSprite(): AnimatedSprite {
  const sprite = (art: string, legend: Record<string, SpriteLegendEntry>) => Sprite.fromLegend(art, legend)
  const set = (
    prefix: string,
    legend: Record<string, SpriteLegendEntry>,
    idle: string,
    runA: string,
    runB: string,
    jump: string,
  ) => {
    const i = sprite(idle, legend)
    return {
      [`${prefix}-idle`]: clip([i], 1000),
      [`${prefix}-run`]: clip([sprite(runA, legend), i, sprite(runB, legend), i], 90),
      [`${prefix}-jump`]: clip([sprite(jump, legend)], 1000),
    }
  }
  return new AnimatedSprite({
    clips: {
      ...set("small", PLAYER_LEGEND, SMALL_IDLE, SMALL_RUN_A, SMALL_RUN_B, SMALL_JUMP),
      ...set("big", PLAYER_LEGEND, BIG_IDLE, BIG_RUN_A, BIG_RUN_B, BIG_JUMP),
      ...set("fire", FIRE_LEGEND, BIG_IDLE, BIG_RUN_A, BIG_RUN_B, BIG_JUMP),
    },
    initial: "small-idle",
  })
}

const BROW = Color.fromBytes(92, 52, 20)
const BODY = Color.fromBytes(168, 100, 44)
const FOOT = Color.fromBytes(60, 36, 16)

const GOOMBA_LEGEND: Record<string, SpriteLegendEntry> = {
  m: fill(BROW),
  M: fill(BODY),
  w: fill(FOOT),
}

const GOOMBA_A = `
 m
MMM
w w`
const GOOMBA_B = `
 m
MMM
 w `

// 3×3 goomba with a two-frame waddle.
export function buildGoombaSprite(): AnimatedSprite {
  return new AnimatedSprite({
    clips: {
      walk: {
        frames: [Sprite.fromLegend(GOOMBA_A, GOOMBA_LEGEND), Sprite.fromLegend(GOOMBA_B, GOOMBA_LEGEND)],
        frameDuration: 160,
        loop: true,
      },
    },
    initial: "walk",
  })
}

const KOOPA_LEGEND: Record<string, SpriteLegendEntry> = {
  s: fill(theme.KOOPA_SKIN),
  S: fill(theme.KOOPA_SHELL),
  r: fill(theme.KOOPA_RIM),
  w: fill(FOOT),
}

// 3×4 Koopa Troopa: a head over a green shell on two feet. The shell clip is the
// retracted form that slides when kicked.
const KOOPA_A = `
 s
SSS
SSS
w w`
const KOOPA_B = `
 s
SSS
SSS
 w `
// 3×3 retracted shell; the Koopa draws it anchored to the bottom of its box.
const KOOPA_SHELL = `
rSr
SSS
SSS`

export function buildKoopaSprite(): AnimatedSprite {
  return new AnimatedSprite({
    clips: {
      walk: {
        frames: [Sprite.fromLegend(KOOPA_A, KOOPA_LEGEND), Sprite.fromLegend(KOOPA_B, KOOPA_LEGEND)],
        frameDuration: 150,
        loop: true,
      },
      shell: { frames: [Sprite.fromLegend(KOOPA_SHELL, KOOPA_LEGEND)], frameDuration: 1000, loop: true },
    },
    initial: "walk",
  })
}
