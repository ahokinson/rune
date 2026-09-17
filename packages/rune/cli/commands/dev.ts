import { mkdir } from "node:fs/promises"
import { dirname, relative } from "node:path"
import { inspectionSocketPath, resolveEntry } from "../project"

// `rune dev` — run the game from source with Bun, watching for changes. The TTY
// is inherited so the terminal game gets the real screen, keyboard and mouse.
// Unless `--no-inspect`, the game also exposes a live inspection socket
// (RUNE_INSPECT_SOCKET) that `rune inspect` attaches to from another terminal.
export async function runDev(flags: Map<string, string>): Promise<number> {
  const entry = await resolveEntry()
  if (!entry) {
    console.error("no entry file found (looked for main.tsx / main.ts). run from a rune project root.")
    return 1
  }

  const watch = !flags.has("no-watch")
  // Marks a standalone `rune dev` run: the game runs under `bun --watch`, which
  // keeps the process alive after the app tears down, so the engine exits the
  // process itself when the player quits (see Application's shutdown).
  const env: Record<string, string | undefined> = { ...process.env, RUNE_DEV: "1" }

  let socketPath: string | null = null
  if (!flags.has("no-inspect")) {
    socketPath = await inspectionSocketPath(flags.get("socket"))
    await mkdir(dirname(socketPath), { recursive: true })
    env.RUNE_INSPECT_SOCKET = socketPath
  }

  const args = ["bun", ...(watch ? ["--watch"] : []), entry]
  console.error(`▸ rune dev: ${relative(process.cwd(), entry) || entry}${watch ? " (watching)" : ""}`)
  if (socketPath) {
    console.error(
      `  inspect: run \`rune inspect\` in another terminal (socket ${relative(process.cwd(), socketPath) || socketPath})`,
    )
  }

  const child = Bun.spawn(args, { stdio: ["inherit", "inherit", "inherit"], env })
  return await child.exited
}
