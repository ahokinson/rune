import {
  burstEmitter,
  clamp,
  detectCollisions,
  Scene,
  SceneRenderer,
  useActions,
  useFixedUpdate,
  useScene,
  useTerminal,
  useUpdate,
  Vector2,
} from "@ahokinson/rune"
import { type JSX, onCleanup, onMount } from "solid-js"
import { runBindings } from "../actions"
import { BlockContent, loadLevel } from "../level"
import * as theme from "../theme"
import { Coin } from "./Coin"
import { Enemy } from "./Enemy"
import { Fireball } from "./Fireball"
import { Hud } from "./Hud"
import { Koopa } from "./Koopa"
import { LEVEL_HEIGHT_CELLS, LEVEL_WIDTH_CELLS, Level } from "./Level"
import type { Mob } from "./mob"
import { Player, type PlayerEffects, PowerState } from "./Player"
import { PowerUp, PowerUpKind } from "./PowerUp"
import { createSession } from "./session"

// Time units tick down at the classic ~0.4s-per-unit cadence.
const TIME_PER_SECOND = 2.5

export function World(): JSX.Element {
  return (
    <Scene name="overworld">
      <WorldInner />
    </Scene>
  )
}

function makeEffects(): PlayerEffects {
  // Manual-emit bursts (rate 0). Positions are world cells, so in this orthographic
  // scene the engine projects them through the camera and they scroll with the
  // course; lifetimes are short so a fading burst stays anchored to its event.
  const sparkle = burstEmitter({
    lifetimeMilliseconds: 460,
    speedRange: [6, 15],
    angleRange: [-Math.PI, 0],
    gravity: new Vector2(0, 44),
    characters: ["✦", "✧", "•", "·"],
    color: theme.COIN,
    maximumParticles: 256,
    zIndex: 20,
  })
  const shatter = burstEmitter({
    lifetimeMilliseconds: 620,
    speedRange: [9, 19],
    angleRange: [-Math.PI, 0],
    gravity: new Vector2(0, 70),
    characters: ["▪", "▫", "·"],
    color: theme.BRICK,
    maximumParticles: 256,
    zIndex: 20,
  })
  const puff = burstEmitter({
    lifetimeMilliseconds: 320,
    speedRange: [4, 11],
    angleRange: [-Math.PI, 0],
    gravity: new Vector2(0, 20),
    characters: ["•", "∘", "·"],
    color: theme.CLOUD,
    maximumParticles: 128,
    zIndex: 20,
  })
  return { sparkle, shatter, puff }
}

function WorldInner(): JSX.Element {
  const scene = useScene()
  const controls = useActions(runBindings)
  const terminal = useTerminal()

  const { tiles, markers, contents } = loadLevel()
  const session = createSession()

  const level = new Level({ tiles, markers, contents })
  const effects = makeEffects()
  const enemies = markers.goombas.map((foot) => new Enemy({ spawnFoot: foot, level }))
  const koopas = markers.koopas.map((foot) => new Koopa({ spawnFoot: foot, level }))
  const mobs: Mob[] = [...enemies, ...koopas]
  const fireballs: Fireball[] = []

  // Spawn callbacks close over `player`, which is assigned just below — by the
  // time they fire the runner exists.
  let player!: Player
  const spawnFireball = (origin: Vector2, direction: number): void => {
    if (fireballs.filter((fireball) => fireball.alive).length >= 2) return
    const fireball = new Fireball({ origin, direction, level })
    fireballs.push(fireball)
    scene.add(fireball)
  }
  const spawnItem = (content: BlockContent, x: number, y: number): void => {
    const kind =
      content === BlockContent.Star
        ? PowerUpKind.Star
        : content === BlockContent.OneUp
          ? PowerUpKind.OneUp
          : player.power === PowerState.Small
            ? PowerUpKind.Mushroom
            : PowerUpKind.Flower
    scene.add(new PowerUp({ center: new Vector2(x, y), kind, player, level, session, sparkle: effects.sparkle }))
  }

  player = new Player({
    spawnFoot: markers.playerSpawn,
    controls,
    level,
    mobs,
    effects,
    session,
    spawnFireball,
    spawnItem,
  })
  const coins = markers.coins.map((center) => new Coin({ center, sparkle: effects.sparkle, session }))
  const hud = new Hud({ session })

  // The camera tracks the runner with a little smoothing, framing it about 40%
  // from the left, and clamps so it never scrolls past the edges of the course.
  const target = new Vector2(0, 0)
  let framed = false
  let timeExpired = false

  // Coin pickups resolve through the engine's overlap pass, in the fixed step so
  // it runs after the scene has moved everything this tick (see Coin.onCollide).
  useFixedUpdate(() => detectCollisions(scene))

  useUpdate((deltaMilliseconds) => {
    if (!session.won && !session.gameOver) {
      session.time -= (deltaMilliseconds / 1000) * TIME_PER_SECOND
      if (session.time <= 0 && !timeExpired) {
        timeExpired = true
        player.defeat()
      }
    }
    resolveHazards()

    const { width, height } = terminal()
    const centerX = player.position.x + 1.5
    const centerY = player.position.y + 2
    target.set(
      clamp(centerX - width * 0.4, 0, Math.max(0, LEVEL_WIDTH_CELLS - width)),
      clamp(centerY - height * 0.6, 0, Math.max(0, LEVEL_HEIGHT_CELLS - height)),
    )
    scene.camera.follow(target, framed ? 0.18 : 1)
    framed = true
  })

  // Sliding shells mow down any enemy they overtake; fireballs pop the first
  // enemy they touch. Both award points and a little puff.
  function resolveHazards(): void {
    for (const koopa of koopas) {
      if (!koopa.alive || koopa.state !== "slide") continue
      for (const mob of mobs) {
        if (mob === koopa || !mob.alive) continue
        if (koopa.bounds.intersects(mob.bounds)) {
          mob.kill(koopa.bounds.x < mob.bounds.x ? 1 : -1)
          session.score += 100
        }
      }
    }
    for (const fireball of fireballs) {
      if (!fireball.alive) continue
      for (const mob of mobs) {
        if (!mob.alive) continue
        if (fireball.bounds.intersects(mob.bounds)) {
          mob.kill(fireball.bounds.x < mob.bounds.x ? 1 : -1)
          session.score += 100
          effects.puff.origin = new Vector2(mob.bounds.x + mob.bounds.width / 2, mob.bounds.y)
          effects.puff.emit(8)
          fireball.pop()
          break
        }
      }
    }
    for (let i = fireballs.length - 1; i >= 0; i--) if (!fireballs[i]!.alive) fireballs.splice(i, 1)
  }

  onMount(() => {
    scene.autoPrune = true
    scene.addAll([level, ...enemies, ...koopas, ...coins, player, effects.sparkle, effects.shatter, effects.puff, hud])
  })
  onCleanup(() => {
    scene.clear()
  })

  return <SceneRenderer clearColor={theme.SKY} />
}
