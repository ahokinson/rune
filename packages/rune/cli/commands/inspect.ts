import type { Socket } from "bun"
import { INSPECT_PROTOCOL_VERSION, type InspectorCommand, type InspectorEdit, type InspectorSnapshot } from "../../src/index"
import { createSignal } from "solid-js"
import { runInspectorTui } from "../inspector/run"
import { inspectionSocketPath } from "../project"

const EMPTY_SNAPSHOT: InspectorSnapshot = {
  protocol: INSPECT_PROTOCOL_VERSION,
  tick: 0,
  framesPerSecond: 0,
  ticksPerSecond: 0,
  paused: false,
  sceneStack: [],
  scene: null,
}

// `rune inspect` — attach to a running game (started by `rune dev`) over its Unix
// socket and browse/edit the live scene tree in this terminal. Snapshots stream
// in as newline-delimited JSON; edits and pause/resume go back the same way.
export async function runInspect(flags: Map<string, string>): Promise<number> {
  const socketPath = await inspectionSocketPath(flags.get("socket"))
  const [snapshot, setSnapshot] = createSignal<InspectorSnapshot>(EMPTY_SNAPSHOT)
  const [connected, setConnected] = createSignal(true)
  let lostConnection = false
  const onDisconnect = (): void => {
    if (lostConnection) return
    lostConnection = true
    setConnected(false)
  }

  let buffer = ""
  const ingest = (chunk: string): void => {
    buffer += chunk
    let newline = buffer.indexOf("\n")
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim()
      buffer = buffer.slice(newline + 1)
      if (line) {
        try {
          setSnapshot(JSON.parse(line) as InspectorSnapshot)
        } catch {
          // Ignore a malformed line rather than tearing down the session.
        }
      }
      newline = buffer.indexOf("\n")
    }
  }

  let socket: Socket<undefined>
  try {
    socket = await Bun.connect<undefined>({
      unix: socketPath,
      socket: {
        data: (_socket, chunk) => ingest(chunk.toString()),
        error: onDisconnect,
        close: onDisconnect,
      },
    })
  } catch {
    console.error(`no running game found at ${socketPath}`)
    console.error("start the game with `rune dev`, then run `rune inspect` from the same project directory.")
    return 1
  }

  const send = (message: InspectorEdit | InspectorCommand): void => {
    socket.write(`${JSON.stringify(message)}\n`)
  }

  await runInspectorTui({
    title: "rune inspect",
    snapshot,
    editable: true,
    onEdit: send,
    onCommand: send,
    connected,
  })

  socket.end()
  if (lostConnection) console.error("game stopped (rune dev exited) — inspector disconnected.")
  return 0
}
