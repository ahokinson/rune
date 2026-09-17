/**
 * Stable, process-local ids so an inspector client can correlate the same entity
 * across successive snapshots (to preserve selection) and target it for edits.
 * Held in a WeakMap so it never pins an entity in memory and the Entity class
 * itself stays free of any inspection concern.
 *
 * @module
 */

import type { Entity } from "@/scene/entity"

const ids = new WeakMap<Entity, number>()
let nextId = 1

/**
 * Return the stable inspector id for `entity`, assigning one on first use.
 *
 * @param entity - The entity to identify.
 * @returns A stable positive integer id.
 */
export function inspectorId(entity: Entity): number {
  let id = ids.get(entity)
  if (id === undefined) {
    id = nextId++
    ids.set(entity, id)
  }
  return id
}
