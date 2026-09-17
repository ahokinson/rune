import { describe, expect, it } from "bun:test"
import { Entity2D } from "@/scene/entity2d"
import { Scene } from "@/scene/scene"

describe("Entity2D lifecycle", () => {
  it("markForRemoval flags the entity and disables it", () => {
    const entity = new Entity2D()
    entity.markForRemoval()
    expect(entity.markedForRemoval).toBe(true)
    expect(entity.enabled).toBe(false)
    expect(entity.visible).toBe(false)
  })

  it("calling markForRemoval twice is idempotent", () => {
    const entity = new Entity2D()
    entity.markForRemoval()
    entity.markForRemoval()
    expect(entity.markedForRemoval).toBe(true)
  })

  it("pruneRemoved drops marked entities and emits entity:removed", () => {
    const scene = new Scene("test")
    const keeper = new Entity2D()
    const goner = new Entity2D()
    scene.add(keeper)
    scene.add(goner)

    let removedEntity: Entity2D | null = null
    scene.events.on("entity:removed", ({ entity }) => {
      removedEntity = entity
    })

    goner.markForRemoval()
    const removed = scene.pruneRemoved()

    expect(removed).toBe(1)
    expect(scene.entities.length).toBe(1)
    expect(scene.entities[0]).toBe(keeper)
    expect(removedEntity as Entity2D | null).toBe(goner)
    expect(goner.scene).toBe(null)
  })

  it("removed entities no longer update", () => {
    const scene = new Scene("test", { autoPrune: true })
    let tickCount = 0
    class Counter extends Entity2D {
      override update(): void {
        tickCount++
      }
    }
    const counter = new Counter()
    scene.add(counter)

    scene.update(16)
    expect(tickCount).toBe(1)

    counter.markForRemoval()
    scene.update(16)
    expect(tickCount).toBe(1)
    expect(scene.entities.length).toBe(0)
  })

  it("autoPrune defaults to false", () => {
    const scene = new Scene("test")
    expect(scene.autoPrune).toBe(false)
  })

  it("legacy Camera constructor argument still works", () => {
    const scene = new Scene("test")
    expect(scene.camera).toBeDefined()
  })
})
