/**
 * Broad-phase 2D collision dispatch: routes `onCollide()` to overlapping entities
 * once per fixed update, after movement has resolved.
 *
 * @module
 */

import { CollisionLayer } from "@/physics/layers"
import type { Entity2D } from "./entity2d"
import type { Scene } from "./scene"

/**
 * Dispatch `onCollide()` to overlapping entities, the solid-overlap counterpart to
 * `updateTriggers()`. An entity is an "actor" when it defines both a
 * `collisionMask` and an `onCollide` handler; it receives a callback for every
 * other root entity whose `collisionLayer` matches that mask and whose AABB it
 * overlaps this step.
 *
 * Run it once per fixed update, after movement has resolved.
 *
 * @param scene - The scene whose entities to test.
 */
export function detectCollisions(scene: Scene): void {
  const actors: Entity2D[] = []
  const targets: Entity2D[] = []
  for (const entity of scene.entities) {
    if (!entity.enabled) continue
    if (entity.collisionMask !== undefined && entity.onCollide) actors.push(entity)
    if (entity.collisionLayer !== undefined) targets.push(entity)
  }
  for (const actor of actors) {
    const mask = actor.collisionMask as number
    const bounds = actor.bounds
    for (const target of targets) {
      if (target === actor || !target.enabled) continue
      if (!CollisionLayer.matches(target.collisionLayer as number, mask)) continue
      if (bounds.intersects(target.bounds)) actor.onCollide?.(target)
    }
  }
}
