import { describe, expect, it } from "bun:test"
import { detectCollisions, Entity2D, type Particles, type Rectangle, SceneInstance, Vector2 } from "@ahokinson/rune"
import { Coin } from "./Coin"
import { Koopa } from "./Koopa"
import type { Level } from "./Level"
import { PLAYER_LAYER } from "./layers"
import { createSession } from "./session"

// The effects emitter is irrelevant to collection logic; stub it.
const noopParticles = { origin: new Vector2(), emit() {} } as unknown as Particles

// Koopa.update only reaches into the level for nearby colliders; an empty world
// is enough to exercise the state-machine-driven clip selection.
const emptyLevel = { collidersNear: (): Rectangle[] => [] } as unknown as Level

describe("Coin pickup via detectCollisions", () => {
  it("collects when the player overlaps the coin's reach", () => {
    const scene = new SceneInstance("test")
    const session = createSession()
    const coin = new Coin({ center: new Vector2(10, 10), sparkle: noopParticles, session })
    const player = new Entity2D({ position: new Vector2(9, 9), size: new Vector2(3, 3), collisionLayer: PLAYER_LAYER })
    scene.add(coin)
    scene.add(player)
    detectCollisions(scene)
    expect(session.coins).toBe(1)
    expect(coin.markedForRemoval).toBe(true)
  })

  it("leaves a distant coin untouched", () => {
    const scene = new SceneInstance("test")
    const session = createSession()
    const coin = new Coin({ center: new Vector2(10, 10), sparkle: noopParticles, session })
    const player = new Entity2D({
      position: new Vector2(40, 40),
      size: new Vector2(3, 3),
      collisionLayer: PLAYER_LAYER,
    })
    scene.add(coin)
    scene.add(player)
    detectCollisions(scene)
    expect(session.coins).toBe(0)
  })
})

describe("Koopa state machine drives its clip", () => {
  it("shows walk while walking and the shell frame once retracted or sliding", () => {
    const koopa = new Koopa({ spawnFoot: new Vector2(10, 10), level: emptyLevel })
    expect(koopa.state).toBe("walk")
    koopa.update(16)
    expect(koopa.animation.currentClipName).toBe("walk")

    koopa.becomeShell()
    expect(koopa.state).toBe("shell")
    koopa.update(16)
    expect(koopa.animation.currentClipName).toBe("shell")

    koopa.kick(1)
    expect(koopa.state).toBe("slide")
    koopa.update(16)
    expect(koopa.animation.currentClipName).toBe("shell")
  })
})
