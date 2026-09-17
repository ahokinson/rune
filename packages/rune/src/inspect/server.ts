/**
 * Inspection server: streams live game state to `rune inspect` over a Unix socket.
 *
 * @module
 */

import { mkdirSync, rmSync } from "node:fs"
import { dirname } from "node:path"
import type { Socket } from "bun"
import type { ApplicationHandle } from "@/context"
import type { Entity } from "@/scene/entity"
import { InspectorCommandAction, type InspectorMessage } from "./protocol"
import { applyEdit, serializeApplication } from "./snapshot"

// Snapshots are pushed at most this often. The game ticks faster than a human can
// read, and a fresh snapshot allocates a full tree, so we cap the rate well below
// the tick rate; the client interpolates nothing — it just shows the latest.
const DEFAULT_BROADCAST_INTERVAL_MS = 1000 / 15

// A per-socket line accumulator: socket data arrives in arbitrary chunks, so we
// buffer until a newline completes a JSON message.
interface ClientState {
  buffer: string
}

/** Options for constructing an {@link InspectionServer}. */
export interface InspectionServerOptions {
  /** The running application handle to inspect. */
  handle: ApplicationHandle
  /** Path to the Unix socket to listen on. */
  socketPath: string
  /** Minimum milliseconds between snapshot broadcasts (default ~15fps). */
  intervalMilliseconds?: number
}

/**
 * Exposes a running game's live state over a Unix socket for `rune inspect`. The
 * engine constructs this only when RUNE_INSPECT_SOCKET is set, so it costs
 * nothing in a normal build. Broadcasts a serialized snapshot on each tick
 * (throttled) and applies inbound edits/commands to the live scene.
 */
export class InspectionServer {
  private readonly handle: ApplicationHandle
  private readonly socketPath: string
  private readonly intervalMilliseconds: number
  private readonly clients = new Map<Socket<ClientState>, ClientState>()
  private readonly registry = new Map<number, Entity>()
  private listener: { stop(closeActiveConnections?: boolean): void } | null = null
  private unsubscribeTick: (() => void) | null = null
  private lastBroadcast = 0

  /**
   * @param options - Server configuration.
   */
  constructor(options: InspectionServerOptions) {
    this.handle = options.handle
    this.socketPath = options.socketPath
    this.intervalMilliseconds = options.intervalMilliseconds ?? DEFAULT_BROADCAST_INTERVAL_MS
  }

  /**
   * Start listening on the configured socket and subscribe to ticks. Pushes an
   * immediate snapshot to each new client so it isn't blank until the next tick.
   */
  start(): void {
    mkdirSync(dirname(this.socketPath), { recursive: true })
    removeSocketFile(this.socketPath)
    this.listener = Bun.listen<ClientState>({
      unix: this.socketPath,
      socket: {
        open: (socket) => {
          const state: ClientState = { buffer: "" }
          socket.data = state
          this.clients.set(socket, state)
          // Push an immediate snapshot so a freshly attached client isn't blank
          // until the next tick.
          this.send(socket)
        },
        close: (socket) => {
          this.clients.delete(socket)
        },
        error: (socket) => {
          this.clients.delete(socket)
        },
        data: (socket, chunk) => {
          this.ingest(socket, chunk.toString())
        },
      },
    })
    this.unsubscribeTick = this.handle.events.on("tick", () => this.onTick())
  }

  /** Stop listening, disconnect all clients, and clean up the socket file. */
  stop(): void {
    this.unsubscribeTick?.()
    this.unsubscribeTick = null
    for (const client of this.clients.keys()) client.end()
    this.clients.clear()
    this.listener?.stop(true)
    this.listener = null
    removeSocketFile(this.socketPath)
  }

  private onTick(): void {
    if (this.clients.size === 0) return
    const now = performance.now()
    if (now - this.lastBroadcast < this.intervalMilliseconds) return
    this.lastBroadcast = now
    const line = `${JSON.stringify(serializeApplication(this.handle, this.registry))}\n`
    for (const client of this.clients.keys()) client.write(line)
  }

  private send(socket: Socket<ClientState>): void {
    socket.write(`${JSON.stringify(serializeApplication(this.handle, this.registry))}\n`)
  }

  private ingest(socket: Socket<ClientState>, chunk: string): void {
    const state = this.clients.get(socket)
    if (!state) return
    state.buffer += chunk
    let newline = state.buffer.indexOf("\n")
    while (newline >= 0) {
      const line = state.buffer.slice(0, newline).trim()
      state.buffer = state.buffer.slice(newline + 1)
      if (line) this.handleLine(line)
      newline = state.buffer.indexOf("\n")
    }
  }

  private handleLine(line: string): void {
    let message: InspectorMessage
    try {
      message = JSON.parse(line) as InspectorMessage
    } catch {
      return
    }
    if (message.kind === "edit") {
      const entity = this.registry.get(message.id)
      // Applied synchronously off the event loop, between frames — the entity's
      // position is its canonical value here (draw-time interpolation has already
      // been restored), so the edit sticks.
      if (entity) applyEdit(entity, message.prop, message.value)
    } else if (message.kind === "command") {
      if (message.action === InspectorCommandAction.Pause) this.handle.pause()
      else if (message.action === InspectorCommandAction.Resume) this.handle.resume()
    }
  }
}

function removeSocketFile(path: string): void {
  try {
    rmSync(path, { force: true })
  } catch {
    // A leftover socket from a crashed run is the common case; ignore races.
  }
}
