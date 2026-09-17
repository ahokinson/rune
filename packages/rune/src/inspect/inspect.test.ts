import { afterEach, describe, expect, it } from "bun:test"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { Socket } from "bun"
import type { ApplicationHandle } from "@/context"
import { EventEmitter } from "@/core/events"
import { Camera3D } from "@/geom/camera3d"
import { Vector2 } from "@/math/vector2"
import { Vector3 } from "@/math/vector3"
import { Entity2D } from "@/scene/entity2d"
import { Entity3D } from "@/scene/entity3d"
import { Scene } from "@/scene/scene"
import { Scene3D } from "@/scene/scene3d"
import { SceneManager } from "@/scene/sceneManager"
import { WorldView3D } from "@/scene/worldView3d"
import { InspectorNodeKind, type InspectorSnapshot } from "./protocol"
import { InspectionServer } from "./server"
import { applyEdit, serializeApplication } from "./snapshot"

class TestEntity3D extends Entity3D {
  draw(): void {}
}

// A minimal handle exposing only what the inspect module reads: the scene stack,
// the stat accessors, and pause/resume + a tick event the server subscribes to.
function makeHandle(scene: Scene): {
  handle: ApplicationHandle
  events: EventEmitter<{ tick: unknown }>
  isPaused: () => boolean
} {
  const scenes = new SceneManager()
  scenes.push(scene)
  const events = new EventEmitter<{ tick: unknown }>()
  let paused = false
  const handle = {
    tick: () => 7,
    framesPerSecond: () => 59,
    ticksPerSecond: () => 30,
    paused: () => paused,
    scenes,
    events,
    pause: () => {
      paused = true
    },
    resume: () => {
      paused = false
    },
  } as unknown as ApplicationHandle
  return { handle, events, isPaused: () => paused }
}

describe("serializeApplication", () => {
  it("walks the scene tree with nested children and stable ids", () => {
    const scene = new Scene("game")
    const player = new Entity2D({ position: new Vector2(12, 8), zIndex: 1 })
    const weapon = new Entity2D({ position: new Vector2(0.5, 0) })
    player.add(weapon)
    scene.add(player)
    const { handle } = makeHandle(scene)

    const first = serializeApplication(handle)
    expect(first.scene?.name).toBe("game")
    expect(first.tick).toBe(7)
    expect(first.scene?.entities).toHaveLength(1)

    const playerNode = first.scene?.entities[0]
    expect(playerNode?.type).toBe("Entity2D")
    expect(playerNode?.zIndex).toBe(1)
    expect(playerNode?.props.position).toEqual({ x: 12, y: 8 })
    expect(playerNode?.children).toHaveLength(1)
    expect(playerNode?.children[0]?.props.position).toEqual({ x: 0.5, y: 0 })

    // Ids are stable across snapshots so the client can keep its selection.
    const second = serializeApplication(handle)
    expect(second.scene?.entities[0]?.id).toBe(playerNode?.id as number)
  })

  it("surfaces a WorldView3D's nested 3D world", () => {
    const scene = new Scene("game")
    const world = new Scene3D({ camera: new Camera3D() })
    const mesh = new TestEntity3D({ position: new Vector3(1, 2, 3) })
    world.add(mesh)
    scene.add(new WorldView3D({ world }))
    const { handle } = makeHandle(scene)

    const node = serializeApplication(handle).scene?.entities[0]
    expect(node?.kind).toBe(InspectorNodeKind.WorldView3D)
    expect(node?.world?.entities[0]?.kind).toBe(InspectorNodeKind.Entity3D)
    expect(node?.world?.entities[0]?.props.position).toEqual({ x: 1, y: 2, z: 3 })
  })

  it("populates a registry for edit resolution", () => {
    const scene = new Scene("game")
    const entity = new Entity2D()
    scene.add(entity)
    const { handle } = makeHandle(scene)
    const registry = new Map()
    const snapshot = serializeApplication(handle, registry)
    const id = snapshot.scene?.entities[0]?.id as number
    expect(registry.get(id)).toBe(entity)
  })
})

describe("applyEdit", () => {
  it("mutates 2D transform, flags, and zIndex", () => {
    const entity = new Entity2D({ position: new Vector2(0, 0) })
    applyEdit(entity, "position.x", 9)
    applyEdit(entity, "rotation", 1.5)
    applyEdit(entity, "visible", false)
    applyEdit(entity, "zIndex", 4)
    expect(entity.position.x).toBe(9)
    expect(entity.rotation).toBe(1.5)
    expect(entity.visible).toBe(false)
    expect(entity.zIndex).toBe(4)
  })

  it("mutates a 3D entity's z axis but ignores props that don't apply", () => {
    const entity = new TestEntity3D()
    applyEdit(entity, "position.z", -2)
    applyEdit(entity, "rotation", 1) // 3D rotation is read-only — no-op
    expect(entity.position.z).toBe(-2)
    expect(entity.rotation.w).toBe(1) // unchanged identity quaternion
  })
})

// Binding a Unix socket is forbidden in some sandboxes (EPERM). Probe once so the
// transport test runs where sockets are allowed and skips cleanly where they are
// not — the serialize/edit logic above already covers the server's behavior.
function canBindUnixSocket(): boolean {
  const path = join(tmpdir(), `rune-probe-${process.pid}-${Date.now()}.sock`)
  try {
    const listener = Bun.listen({ unix: path, socket: { data() {} } })
    listener.stop(true)
    return true
  } catch {
    return false
  } finally {
    try {
      rmSync(path, { force: true })
    } catch {
      // ignore
    }
  }
}

const SOCKETS_ALLOWED = canBindUnixSocket()

describe("InspectionServer", () => {
  let server: InspectionServer | null = null
  let client: Socket<undefined> | null = null

  afterEach(() => {
    client?.end()
    client = null
    server?.stop()
    server = null
  })

  it.skipIf(!SOCKETS_ALLOWED)("streams snapshots and applies edits + commands over the socket", async () => {
    const scene = new Scene("game")
    const player = new Entity2D({ position: new Vector2(1, 1) })
    scene.add(player)
    const { handle, isPaused } = makeHandle(scene)
    const socketPath = join(tmpdir(), `rune-inspect-${process.pid}-${Date.now()}.sock`)
    server = new InspectionServer({ handle, socketPath, intervalMilliseconds: 0 })
    server.start()

    const received: InspectorSnapshot[] = []
    let buffer = ""
    client = await Bun.connect<undefined>({
      unix: socketPath,
      socket: {
        data: (_socket, chunk) => {
          buffer += chunk.toString()
          let newline = buffer.indexOf("\n")
          while (newline >= 0) {
            const line = buffer.slice(0, newline).trim()
            buffer = buffer.slice(newline + 1)
            if (line) received.push(JSON.parse(line) as InspectorSnapshot)
            newline = buffer.indexOf("\n")
          }
        },
      },
    })

    // The server sends an immediate snapshot on connect.
    await until(() => received.length >= 1)
    const id = received[0]?.scene?.entities[0]?.id as number
    expect(typeof id).toBe("number")

    client.write(`${JSON.stringify({ kind: "edit", id, prop: "position.x", value: 42 })}\n`)
    await until(() => player.position.x === 42)
    expect(player.position.x).toBe(42)

    client.write(`${JSON.stringify({ kind: "command", action: "pause" })}\n`)
    await until(() => isPaused())
    expect(isPaused()).toBe(true)
  })
})

async function until(predicate: () => boolean, timeoutMilliseconds = 1000): Promise<void> {
  const start = Date.now()
  while (!predicate()) {
    if (Date.now() - start > timeoutMilliseconds) throw new Error("timed out waiting for condition")
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}
