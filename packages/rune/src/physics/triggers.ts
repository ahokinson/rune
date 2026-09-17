/**
 * Trigger volumes: rectangular {@link Entity2D}s that fire enter/stay/exit
 * callbacks against overlapping entities matching a layer mask, plus a
 * scene-wide driver that evaluates every trigger against every other entity.
 *
 * @module
 */

import { Entity2D } from "@/scene/entity2d"
import type { Scene } from "@/scene/scene"
import { intersects } from "./boundingBox"
import { CollisionLayer, type LayerMask } from "./layers"

/**
 * An entity that reports overlap enter/stay/exit events against other entities
 * whose bounds intersect it and whose collision layer matches `triggerMask`.
 */
export class TriggerVolume extends Entity2D {
  /** Layer mask an overlapping entity must match to be considered. */
  triggerMask: LayerMask = CollisionLayer.all
  private readonly overlapping: Set<Entity2D> = new Set()

  /** Called the first step `other` overlaps this volume (and matches the mask). */
  onOverlapEnter(_other: Entity2D): void {}
  /** Called each step an already-overlapping `other` remains overlapping. */
  onOverlapStay(_other: Entity2D): void {}
  /** Called the step an overlapping `other` stops overlapping (or matching the mask). */
  onOverlapExit(_other: Entity2D): void {}

  /**
   * Update this volume's overlap state against `other`: fires the appropriate
   * enter/stay/exit callback. Skips disabled entities and entities whose layer
   * does not match {@link triggerMask}.
   *
   * @param other - The candidate entity.
   */
  evaluateOverlap(other: Entity2D): void {
    if (!other.enabled) {
      if (this.overlapping.delete(other)) this.onOverlapExit(other)
      return
    }
    const layer = other.collisionLayer ?? CollisionLayer.all
    if (!CollisionLayer.matches(layer, this.triggerMask)) {
      if (this.overlapping.delete(other)) this.onOverlapExit(other)
      return
    }
    const overlapping = intersects(this.bounds, other.bounds)
    if (overlapping) {
      if (this.overlapping.has(other)) {
        this.onOverlapStay(other)
      } else {
        this.overlapping.add(other)
        this.onOverlapEnter(other)
      }
    } else if (this.overlapping.delete(other)) {
      this.onOverlapExit(other)
    }
  }
}

/**
 * Evaluate every {@link TriggerVolume} in `scene` against every other enabled
 * entity, dispatching enter/stay/exit callbacks.
 *
 * @param scene - The scene whose triggers and entities to evaluate.
 */
export function updateTriggers(scene: Scene): void {
  const triggers: TriggerVolume[] = []
  const others: Entity2D[] = []
  for (const entity of scene.entities) {
    if (entity instanceof TriggerVolume) triggers.push(entity)
    else others.push(entity)
  }
  for (const trigger of triggers) {
    if (!trigger.enabled) continue
    for (const other of others) {
      trigger.evaluateOverlap(other)
    }
  }
}
