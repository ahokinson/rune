import { runInspectorTui } from "../inspector/run"
import { scanProject } from "../preview/scan"
import { projectName, resolveEntry } from "../project"

// `rune preview` — a read-only TUI that describes the game in the current
// directory without running it: project metadata, asset inventory, and the
// scene/entity source files. Browse the same tree/detail UI the live inspector
// uses (`rune inspect`), minus editing.
export async function runPreview(): Promise<number> {
  const root = process.cwd()
  const name = await projectName()
  const entry = await resolveEntry()
  const snapshot = scanProject(root, name, entry)
  await runInspectorTui({
    title: `rune preview · ${name}`,
    snapshot: () => snapshot,
    editable: false,
  })
  return 0
}
