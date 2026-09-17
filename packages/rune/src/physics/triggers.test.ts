import { describe, expect, it } from "bun:test"
import { Vector2 } from "@/math/vector2"
import { CollisionLayer } from "@/physics/layers"
import { TriggerVolume, updateTriggers } from "@/physics/triggers"
import { Entity2D } from "@/scene/entity2d"
import { Scene } from "@/scene/scene"

class RecordingTrigger extends TriggerVolume {
  enters: Entity2D[] = []
  stays: Entity2D[] = []
  exits: Entity2D[] = []

  override onOverlapEnter(other: Entity2D): void {
    this.enters.push(other)
  }
  override onOverlapStay(other: Entity2D): void {
    this.stays.push(other)
  }
  override onOverlapExit(other: Entity2D): void {
    this.exits.push(other)
  }
}

describe("TriggerVolume + updateTriggers", () => {
  it("fires onOverlapEnter the first frame of overlap", () => {
    const scene = new Scene("triggers")
    const trigger = new RecordingTrigger({ position: new Vector2(0, 0), size: new Vector2(2, 2) })
    const other = new Entity2D({ position: new Vector2(0.5, 0.5), size: new Vector2(1, 1) })
    scene.add(trigger)
    scene.add(other)
    updateTriggers(scene)
    expect(trigger.enters).toEqual([other])
    expect(trigger.stays.length).toBe(0)
  })

  it("fires onOverlapStay on subsequent overlapping frames", () => {
    const scene = new Scene("triggers")
    const trigger = new RecordingTrigger({ position: new Vector2(0, 0), size: new Vector2(2, 2) })
    const other = new Entity2D({ position: new Vector2(0.5, 0.5), size: new Vector2(1, 1) })
    scene.add(trigger)
    scene.add(other)
    updateTriggers(scene)
    updateTriggers(scene)
    expect(trigger.enters.length).toBe(1)
    expect(trigger.stays.length).toBe(1)
  })

  it("fires onOverlapExit when the entity leaves the volume", () => {
    const scene = new Scene("triggers")
    const trigger = new RecordingTrigger({ position: new Vector2(0, 0), size: new Vector2(2, 2) })
    const other = new Entity2D({ position: new Vector2(0.5, 0.5), size: new Vector2(1, 1) })
    scene.add(trigger)
    scene.add(other)
    updateTriggers(scene)
    other.position = new Vector2(10, 10)
    updateTriggers(scene)
    expect(trigger.exits).toEqual([other])
  })

  it("triggerMask filters by collisionLayer", () => {
    const scene = new Scene("triggers")
    const trigger = new RecordingTrigger({ position: new Vector2(0, 0), size: new Vector2(2, 2) })
    trigger.triggerMask = CollisionLayer.bit(0)

    const matching = new Entity2D({ position: new Vector2(0.5, 0.5), size: new Vector2(1, 1) })
    matching.collisionLayer = CollisionLayer.bit(0)

    const nonMatching = new Entity2D({ position: new Vector2(0.5, 0.5), size: new Vector2(1, 1) })
    nonMatching.collisionLayer = CollisionLayer.bit(1)

    scene.add(trigger)
    scene.add(matching)
    scene.add(nonMatching)

    updateTriggers(scene)
    expect(trigger.enters).toEqual([matching])
  })

  it("disabled entities trigger an exit", () => {
    const scene = new Scene("triggers")
    const trigger = new RecordingTrigger({ position: new Vector2(0, 0), size: new Vector2(2, 2) })
    const other = new Entity2D({ position: new Vector2(0.5, 0.5), size: new Vector2(1, 1) })
    scene.add(trigger)
    scene.add(other)
    updateTriggers(scene)
    other.enabled = false
    updateTriggers(scene)
    expect(trigger.exits).toEqual([other])
  })
})
