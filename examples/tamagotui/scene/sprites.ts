import { AnimatedSprite, type AnimationClip, type Color, PixelSprite } from "@ahokinson/rune"
import * as theme from "../theme"
import { LifeStage, Mood } from "./state"

// Pixel legend shared by every body silhouette. Faces are stamped on top of the
// belly afterwards, so the art strings only describe the outline + belly.
const LEGEND: Record<string, Color | null> = {
  b: theme.BODY,
  d: theme.BODY_DARK,
  w: theme.BELLY,
  s: theme.SHELL,
  o: theme.SHELL_SPOT,
  ".": null,
  " ": null,
}

// Where to stamp the face on a given body, plus the foot columns the walk cycle
// shuffles. All coordinates are in sprite pixels.
interface FaceAnchor {
  eyeY: number
  leftEyeX: number
  rightEyeX: number
  mouthY: number
  mouthX: number
  cheekY: number
  feetY: number
  leftFoot: number
  rightFoot: number
}

interface Body {
  art: string
  anchor: FaceAnchor
  // True on the bad-line bodies: their idle/happy faces use a downturned mouth
  // instead of the default smile, so a neglected pet reads as grumpy even when
  // its stats are fine.
  frown?: boolean
}

const MOCHI: Body = {
  art: `
..bbbbbb..
.bbbbbbbb.
bbbwwwwbbb
bbwwwwwwbb
bbwwwwwwbb
bbwwwwwwbb
.bbwwwwbb.
..bbbbbb..
..bb..bb..
..bb..bb..`,
  anchor: { eyeY: 3, leftEyeX: 3, rightEyeX: 5, mouthY: 5, mouthX: 4, cheekY: 5, feetY: 8, leftFoot: 2, rightFoot: 6 },
}

const GOOBER: Body = {
  art: `
...bbbbbb...
..bbbbbbbb..
.bbbbbbbbbb.
bbbbwwwwbbbb
bbbwwwwwwbbb
bbwwwwwwwwbb
bbwwwwwwwwbb
.bbwwwwwwbb.
.bbbwwwwbbb.
..bbbbbbbb..
...bb..bb...
...bb..bb...`,
  anchor: { eyeY: 4, leftEyeX: 3, rightEyeX: 7, mouthY: 6, mouthX: 5, cheekY: 6, feetY: 10, leftFoot: 3, rightFoot: 7 },
}

const CHONKUS: Body = {
  art: `
....dddddd....
..ddbbbbbbdd..
.dbbbbbbbbbd.
dbbbwwwwbbbbd
dbbbwwwwwwbbbd
dbbwwwwwwwwbbd
dbbwwwwwwwwbbd
dbbwwwwwwwwbbd
.dbbwwwwwwbbd.
.dbbbwwwwbbbd.
..dbbbbbbbbd..
...dbbbbbbd...
....bb..bb....
....bb..bb....`,
  anchor: { eyeY: 4, leftEyeX: 4, rightEyeX: 8, mouthY: 7, mouthX: 6, cheekY: 7, feetY: 12, leftFoot: 4, rightFoot: 8 },
}

// Bad-line stages share their good counterpart's silhouette but flag `frown` so
// `frame()` stamps a downturned mouth and angry eyebrows — the neglected pet
// reads as grumpy even when its stats recover. Same art, different expression.
const GROUCH: Body = { ...GOOBER, frown: true }
const GHOUL: Body = { ...CHONKUS, frown: true }

const BODIES: Record<Exclude<LifeStage, LifeStage.Egg>, Body> = {
  [LifeStage.Mochi]: MOCHI,
  [LifeStage.Goober]: GOOBER,
  [LifeStage.Chonkus]: CHONKUS,
  [LifeStage.Grouch]: GROUCH,
  [LifeStage.Ghoul]: GHOUL,
}

function block2(sprite: PixelSprite, x: number, y: number, color: Color): void {
  sprite.setPixel(x, y, color)
  sprite.setPixel(x + 1, y, color)
  sprite.setPixel(x, y + 1, color)
  sprite.setPixel(x + 1, y + 1, color)
}

function horizontal(sprite: PixelSprite, x: number, y: number, length: number, color: Color): void {
  for (let i = 0; i < length; i++) sprite.setPixel(x + i, y, color)
}

// The bad-line face: a downturned mouth (same shape as the sick frown) plus a
// pair of inward-angled brows above the eyes. Stamped for Idle/Happy so a
// neglected pet looks grumpy even when its stats are fine.
function stampGrumpy(sprite: PixelSprite, a: FaceAnchor): void {
  horizontal(sprite, a.mouthX - 1, a.mouthY + 1, 4, theme.MOUTH)
  sprite.setPixel(a.mouthX - 1, a.mouthY, theme.MOUTH)
  sprite.setPixel(a.mouthX + 2, a.mouthY, theme.MOUTH)
  horizontal(sprite, a.leftEyeX, a.eyeY - 1, 2, theme.EYE)
  horizontal(sprite, a.rightEyeX, a.eyeY - 1, 2, theme.EYE)
}

// One frame: a fresh body with a face stamped for the mood, and feet shifted by
// `footPhase` (0 or 1) to read as a stride.
function frame(body: Body, mood: Mood, footPhase: number): PixelSprite {
  const sprite = PixelSprite.fromString(body.art, LEGEND)
  const a = body.anchor

  // Feet: nudge one foot forward and the other back on the off phase.
  if (footPhase === 1) {
    sprite.setPixel(a.leftFoot - 1, a.feetY + 1, theme.BODY)
    sprite.setPixel(a.rightFoot + 1, a.feetY + 1, theme.BODY)
  }

  const eyeOpen = mood !== Mood.Sleeping && mood !== Mood.Tired
  if (eyeOpen) {
    block2(sprite, a.leftEyeX, a.eyeY, theme.EYE)
    block2(sprite, a.rightEyeX, a.eyeY, theme.EYE)
  } else {
    // Closed/half-shut eyes: a dark dash.
    horizontal(sprite, a.leftEyeX, a.eyeY + 1, 2, theme.EYE)
    horizontal(sprite, a.rightEyeX, a.eyeY + 1, 2, theme.EYE)
  }

  // Grumpy line: override the usual smile/cheeks for the resting moods so the
  // bad branch always looks sour. Other moods (hungry/sick/dead/...) keep their
  // own expression since the stat already explains the face.
  if (body.frown && (mood === Mood.Idle || mood === Mood.Happy)) {
    stampGrumpy(sprite, a)
    return sprite
  }

  switch (mood) {
    case Mood.Happy:
      horizontal(sprite, a.mouthX - 1, a.mouthY, 4, theme.MOUTH)
      sprite.setPixel(a.mouthX - 1, a.mouthY + 1, theme.MOUTH)
      sprite.setPixel(a.mouthX + 2, a.mouthY + 1, theme.MOUTH)
      sprite.setPixel(a.leftEyeX - 1, a.cheekY, theme.CHEEK)
      sprite.setPixel(a.rightEyeX + 2, a.cheekY, theme.CHEEK)
      break
    case Mood.Hungry:
      block2(sprite, a.mouthX, a.mouthY, theme.MOUTH) // open, round mouth
      break
    case Mood.Sick: {
      horizontal(sprite, a.mouthX - 1, a.mouthY + 1, 4, theme.MOUTH) // frown
      sprite.setPixel(a.mouthX - 1, a.mouthY, theme.MOUTH)
      sprite.setPixel(a.mouthX + 2, a.mouthY, theme.MOUTH)
      // Queasy green blotches.
      sprite.setPixel(a.leftEyeX - 1, a.cheekY, theme.SICK)
      sprite.setPixel(a.rightEyeX + 2, a.cheekY, theme.SICK)
      break
    }
    case Mood.Dead:
      // X-ed out eyes.
      block2(sprite, a.leftEyeX, a.eyeY, theme.MOUTH)
      block2(sprite, a.rightEyeX, a.eyeY, theme.MOUTH)
      horizontal(sprite, a.mouthX - 1, a.mouthY, 4, theme.MOUTH)
      break
    case Mood.Tired:
    case Mood.Sleeping:
      horizontal(sprite, a.mouthX, a.mouthY, 2, theme.MOUTH)
      break
    default: // Idle
      horizontal(sprite, a.mouthX, a.mouthY, 2, theme.MOUTH)
      sprite.setPixel(a.leftEyeX - 1, a.cheekY, theme.CHEEK)
      sprite.setPixel(a.rightEyeX + 2, a.cheekY, theme.CHEEK)
  }
  return sprite
}

function clip(frames: PixelSprite[], frameDuration: number): AnimationClip<PixelSprite> {
  return { frames, frameDuration, loop: true }
}

// The egg: a speckled shell with a gentle two-frame wobble.
const EGG_LEFT = PixelSprite.fromString(
  `
...ssss...
..ssssss..
.ssssssss.
.ssoossss.
ssssssssss
ssoossssss
ssssssooss
.ssssssss.
.ssssssss.
..ssssss..`,
  LEGEND,
)
const EGG_RIGHT = PixelSprite.fromString(
  `
...ssss...
..ssssss..
.ssssssss.
.ssssooss.
ssssssssss
ssssssooss
ssoossssss
.ssssssss.
.ssssssss.
..ssssss..`,
  LEGEND,
)

export function buildPetAnimation(stage: LifeStage): AnimatedSprite<PixelSprite> {
  if (stage === LifeStage.Egg) {
    return new AnimatedSprite<PixelSprite>({
      clips: { egg: clip([EGG_LEFT, EGG_RIGHT], 520) },
      initial: "egg",
    })
  }

  const body = BODIES[stage]
  const idle = frame(body, Mood.Idle, 0)
  return new AnimatedSprite<PixelSprite>({
    clips: {
      [Mood.Idle]: clip([idle, frame(body, Mood.Idle, 1)], 600),
      [Mood.Happy]: clip([frame(body, Mood.Happy, 0), frame(body, Mood.Happy, 1)], 220),
      [Mood.Hungry]: clip([frame(body, Mood.Hungry, 0)], 1000),
      [Mood.Tired]: clip([frame(body, Mood.Tired, 0)], 1000),
      [Mood.Sick]: clip([frame(body, Mood.Sick, 0)], 1000),
      [Mood.Sleeping]: clip([frame(body, Mood.Sleeping, 0)], 1000),
      [Mood.Dead]: clip([frame(body, Mood.Dead, 0)], 1000),
      walk: clip([frame(body, Mood.Idle, 1), idle, frame(body, Mood.Idle, 1), idle], 200),
    },
    initial: Mood.Idle,
  })
}
