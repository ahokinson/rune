import { describe, expect, it } from "bun:test"
import { Vector2 } from "@/math/vector2"
import { CollisionLayer } from "@/physics/layers"
import { detectCollisions } from "@/scene/collision"
import { Entity2D } from "@/scene/entity2d"
import { Scene } from "@/scene/scene"

const PLAYER = CollisionLayer.bit(0)
const PICKUP = CollisionLayer.bit(1)

class Actor extends Entity2D {
  readonly hits: Entity2D[] = []
  override onCollide(other: Entity2D): void {
    this.hits.push(other)
  }
}

function at(x: number, y: number) {
  return { position: new Vector2(x, y), size: new Vector2(2, 2) }
}

describe("detectCollisions", () => {
  it("dispatches onCollide for overlapping entities matching the mask", () => {
    const scene = new Scene("test")
    const player = new Actor({ ...at(0, 0), collisionLayer: PLAYER, collisionMask: PICKUP })
    const coin = new Entity2D({ ...at(1, 1), collisionLayer: PICKUP })
    scene.add(player)
    scene.add(coin)
    detectCollisions(scene)
    expect(player.hits).toEqual([coin])
  })

  it("ignores entities outside the actor's mask", () => {
    const scene = new Scene("test")
    const player = new Actor({ ...at(0, 0), collisionLayer: PLAYER, collisionMask: PICKUP })
    const other = new Entity2D({ ...at(1, 1), collisionLayer: PLAYER })
    scene.add(player)
    scene.add(other)
    detectCollisions(scene)
    expect(player.hits).toHaveLength(0)
  })

  it("ignores non-overlapping entities", () => {
    const scene = new Scene("test")
    const player = new Actor({ ...at(0, 0), collisionLayer: PLAYER, collisionMask: PICKUP })
    const coin = new Entity2D({ ...at(50, 50), collisionLayer: PICKUP })
    scene.add(player)
    scene.add(coin)
    detectCollisions(scene)
    expect(player.hits).toHaveLength(0)
  })
})
