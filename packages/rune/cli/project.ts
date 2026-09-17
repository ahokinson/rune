import { access } from "node:fs/promises"
import { basename, resolve } from "node:path"
import { DEFAULT_SOCKET_PATH } from "../src/index"

const ENTRY_CANDIDATES = ["main.tsx", "main.ts", "src/main.tsx", "src/main.ts"]

// Unix socket paths have a tight length limit (~104 bytes on macOS); past this we
// can't bind a project-local socket, so fall back to a short temp path.
const MAX_SOCKET_PATH_LENGTH = 100

// Locate the game's entry module, the file that calls render(). Looked up
// relative to the current working directory so the CLI runs from a project root.
export async function resolveEntry(): Promise<string | null> {
  for (const candidate of ENTRY_CANDIDATES) {
    const path = resolve(process.cwd(), candidate)
    if (await exists(path)) return path
  }
  return null
}

// A filesystem-safe artifact name derived from the project's package.json name,
// falling back to the directory name.
export async function projectName(): Promise<string> {
  const path = resolve(process.cwd(), "package.json")
  if (await exists(path)) {
    const manifest = (await Bun.file(path).json()) as { name?: string }
    if (manifest.name) return manifest.name.replace(/[^A-Za-z0-9._-]/g, "-")
  }
  return basename(process.cwd())
}

// The inspection socket path agreed on by `rune dev` (which exposes it) and
// `rune inspect` (which connects to it). Defaults to a project-local path so an
// attach from the same directory needs no flags; an explicit `--socket` override
// wins, and a deep project path falls back to a short temp path.
export async function inspectionSocketPath(override?: string): Promise<string> {
  if (override) return resolve(process.cwd(), override)
  const projectLocal = resolve(process.cwd(), DEFAULT_SOCKET_PATH)
  if (projectLocal.length <= MAX_SOCKET_PATH_LENGTH) return projectLocal
  const base = process.env.TMPDIR ?? "/tmp"
  return resolve(base, `rune-${await projectName()}.sock`)
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
