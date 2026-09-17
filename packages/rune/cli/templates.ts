import { cp, readdir } from "node:fs/promises"
import { join } from "node:path"

const enginePackageJson = Bun.file(join(import.meta.dir, "..", "package.json"))

// The engine package root (one level up from cli/). When published, `cli` and
// `templates` ship alongside `src`, so this relative path holds for consumers too.
export const enginePackageRoot = join(import.meta.dir, "..")
export const templatesRoot = join(enginePackageRoot, "templates")
// The monorepo root that owns the bun workspace (packages/* and examples/*).
export const workspaceRoot = join(enginePackageRoot, "..", "..")

export async function listTemplates(): Promise<string[]> {
  const entries = await readdir(templatesRoot, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

export async function copyTemplate(templateName: string, destination: string): Promise<void> {
  const source = join(templatesRoot, templateName)
  await cp(source, destination, { recursive: true })
}

// A new game created inside this workspace (under examples/ or packages/) is a
// real workspace member, so it resolves the engine through `workspace:*`. Created
// anywhere else it depends on the published `@ahokinson/rune` at the engine's own
// current version.
export async function engineDependencySpec(destination: string): Promise<string> {
  const inWorkspace =
    destination.startsWith(`${join(workspaceRoot, "examples")}/`) ||
    destination.startsWith(`${join(workspaceRoot, "packages")}/`)
  if (inWorkspace) return "workspace:*"
  const { version } = (await enginePackageJson.json()) as { version: string }
  return `^${version}`
}
