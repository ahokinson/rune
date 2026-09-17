/**
 * Serialization of the live application into {@link InspectorSnapshot}s, and
 * application of inbound edits back onto live entities.
 *
 * @module
 */

import type { ApplicationHandle } from "@/context"
import type { Entity } from "@/scene/entity"
import { Entity2D } from "@/scene/entity2d"
import { Entity3D } from "@/scene/entity3d"
import type { Scene } from "@/scene/scene"
import type { Scene3D } from "@/scene/scene3d"
import { WorldView3D } from "@/scene/worldView3d"
import { inspectorId } from "./identity"
import {
  type EditableProp,
  INSPECT_PROTOCOL_VERSION,
  type InspectorNode,
  InspectorNodeKind,
  type InspectorProps,
  type InspectorSnapshot,
  type InspectorTree,
} from "./protocol"

/**
 * Serialize the live application into a single snapshot. When a `registry` is
 * passed it is cleared and repopulated with id -> entity for every node walked,
 * so the caller (the server) can resolve an incoming edit back to its entity.
 *
 * @param handle - The running application handle.
 * @param registry - Optional map to repopulate with id -> entity.
 * @returns A full {@link InspectorSnapshot}.
 */
export function serializeApplication(handle: ApplicationHandle, registry?: Map<number, Entity>): InspectorSnapshot {
  registry?.clear()
  const scene = handle.scenes.current
  return {
    protocol: INSPECT_PROTOCOL_VERSION,
    tick: handle.tick(),
    framesPerSecond: handle.framesPerSecond(),
    ticksPerSecond: handle.ticksPerSecond(),
    paused: handle.paused(),
    sceneStack: handle.scenes.scenes().map((entry) => entry.name),
    scene: scene ? serializeScene(scene, registry) : null,
  }
}

function serializeScene(scene: Scene, registry?: Map<number, Entity>): InspectorTree {
  return { name: scene.name, entities: scene.entities.map((entity) => serializeNode(entity, registry)) }
}

function serializeScene3D(scene: Scene3D, name: string, registry?: Map<number, Entity>): InspectorTree {
  return { name, entities: scene.entities.map((entity) => serializeNode(entity, registry)) }
}

function serializeNode(entity: Entity, registry?: Map<number, Entity>): InspectorNode {
  const id = inspectorId(entity)
  registry?.set(id, entity)
  const node: InspectorNode = {
    id,
    type: entity.constructor.name,
    kind: kindOf(entity),
    enabled: entity.enabled,
    visible: entity.visible,
    zIndex: entity.zIndex,
    props: propsOf(entity),
    children: entity.children.map((child) => serializeNode(child, registry)),
  }
  // A WorldView3D is a 2D entity that owns a Scene3D; surface that nested world
  // so the inspector can descend into the 3D tree from the 2D hierarchy.
  if (entity instanceof WorldView3D) {
    node.world = serializeScene3D(entity.world, `${entity.constructor.name} · Scene3D`, registry)
  }
  return node
}

function kindOf(entity: Entity): InspectorNodeKind {
  if (entity instanceof WorldView3D) return InspectorNodeKind.WorldView3D
  if (entity instanceof Entity2D) return InspectorNodeKind.Entity2D
  if (entity instanceof Entity3D) return InspectorNodeKind.Entity3D
  return InspectorNodeKind.Entity
}

function propsOf(entity: Entity): InspectorProps {
  if (entity instanceof Entity2D) {
    return {
      position: { x: entity.position.x, y: entity.position.y },
      rotation: entity.rotation,
      scale: { x: entity.scale.x, y: entity.scale.y },
      size: { x: entity.size.x, y: entity.size.y },
    }
  }
  if (entity instanceof Entity3D) {
    return {
      position: { x: entity.position.x, y: entity.position.y, z: entity.position.z },
      rotation: { x: entity.rotation.x, y: entity.rotation.y, z: entity.rotation.z, w: entity.rotation.w },
      scale: { x: entity.scale.x, y: entity.scale.y, z: entity.scale.z },
    }
  }
  return {}
}

/**
 * Apply a single whitelisted edit to an entity. Unknown/irrelevant props for the
 * entity's kind are ignored. Re-sorts the owning container when zIndex changes so
 * the new draw/update order takes effect on the next pass.
 *
 * @param entity - The entity to edit.
 * @param prop - The field to modify.
 * @param value - The new value.
 */
export function applyEdit(entity: Entity, prop: EditableProp, value: number | boolean): void {
  switch (prop) {
    case "enabled":
      entity.enabled = Boolean(value)
      return
    case "visible":
      entity.visible = Boolean(value)
      return
    case "zIndex":
      entity.zIndex = Number(value)
      if (entity.parent) entity.parent.markSortDirty()
      else if (entity instanceof Entity2D && entity.scene) entity.scene.markSortDirty()
      else if (entity instanceof Entity3D && entity.scene) entity.scene.markSortDirty()
      return
  }

  if (entity instanceof Entity2D) {
    switch (prop) {
      case "position.x":
        entity.position.x = Number(value)
        return
      case "position.y":
        entity.position.y = Number(value)
        return
      case "scale.x":
        entity.scale.x = Number(value)
        return
      case "scale.y":
        entity.scale.y = Number(value)
        return
      case "rotation":
        entity.rotation = Number(value)
        return
    }
    return
  }

  if (entity instanceof Entity3D) {
    switch (prop) {
      case "position.x":
        entity.position.x = Number(value)
        return
      case "position.y":
        entity.position.y = Number(value)
        return
      case "position.z":
        entity.position.z = Number(value)
        return
      case "scale.x":
        entity.scale.x = Number(value)
        return
      case "scale.y":
        entity.scale.y = Number(value)
        return
      case "scale.z":
        entity.scale.z = Number(value)
        return
    }
  }
}
