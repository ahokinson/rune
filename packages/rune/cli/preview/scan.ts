import { existsSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import {
  INSPECT_PROTOCOL_VERSION,
  type InspectorNode,
  InspectorNodeKind,
  type InspectorSnapshot,
  type InspectorTree,
  loadYamlSync,
} from "../../src/index"

// Builds the static structure shown by `rune preview` from a project directory,
// without running the game: project metadata, the YAML asset inventory, and the
// scene/entity source files. Returns the same InspectorSnapshot shape the live
// inspector uses, so one TUI renders both. Pure (takes the root dir + resolved
// entry) so it can be unit-tested directly.

const ASSET_DIRECTORIES = ["assets"]
const CODE_DIRECTORIES = ["scene", "scenes", "game", "entities"]

export function scanProject(root: string, projectName: string, entry: string | null): InspectorSnapshot {
  const categories: InspectorNode[] = [
    leaf(`project: ${projectName}`, [
      `name: ${projectName}`,
      `entry: ${entry ? relative(root, entry) : "(none found)"}`,
      `directory: ${root}`,
    ]),
    scanAssets(root),
    scanCode(root),
  ]
  const tree: InspectorTree = { name: projectName, entities: categories }
  return staticSnapshot(tree)
}

function scanAssets(root: string): InspectorNode {
  const nodes: InspectorNode[] = []
  for (const directory of ASSET_DIRECTORIES) {
    const full = join(root, directory)
    if (isDirectory(full)) nodes.push(...scanAssetDirectory(root, full))
  }
  const count = countLeaves(nodes)
  return group("assets", [count > 0 ? `${count} YAML asset${count === 1 ? "" : "s"}` : "no YAML assets found"], nodes)
}

function scanAssetDirectory(root: string, directory: string): InspectorNode[] {
  const nodes: InspectorNode[] = []
  for (const entry of sortedEntries(directory)) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) {
      const children = scanAssetDirectory(root, full)
      if (children.length > 0) {
        nodes.push(group(entry.name, [`${countLeaves(children)} files`], children))
      }
    } else if (isYaml(entry.name)) {
      nodes.push(leaf(entry.name, describeAsset(root, full)))
    }
  }
  return nodes
}

function describeAsset(root: string, path: string): string[] {
  const lines = [`path: ${relative(root, path)}`]
  try {
    const data = loadYamlSync<Record<string, unknown>>(path)
    if (data && typeof data === "object") {
      if (typeof data.type === "string") lines.push(`type: ${data.type}`)
      if (typeof data.name === "string") lines.push(`name: ${data.name}`)
      if (isRecord(data.legends)) lines.push(`legends: ${Object.keys(data.legends).length}`)
      if (isRecord(data.clips)) lines.push(`clips: ${Object.keys(data.clips).length}`)
      if (Array.isArray(data.assets)) lines.push(`manifest entries: ${data.assets.length}`)
    }
  } catch (error) {
    lines.push(`(parse error: ${(error as Error).message})`)
  }
  return lines
}

function scanCode(root: string): InspectorNode {
  const groups: InspectorNode[] = []
  for (const directory of CODE_DIRECTORIES) {
    const full = join(root, directory)
    if (!isDirectory(full)) continue
    const children = scanCodeDirectory(root, full)
    if (children.length > 0) groups.push(group(directory, [`${countLeaves(children)} files`], children))
  }
  const summary = groups.length > 0 ? groups.map((entry) => entry.type).join(", ") : "no scene/entity directories"
  return group("scenes & entities", [summary], groups)
}

function scanCodeDirectory(root: string, directory: string): InspectorNode[] {
  const nodes: InspectorNode[] = []
  for (const entry of sortedEntries(directory)) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) {
      const children = scanCodeDirectory(root, full)
      if (children.length > 0) nodes.push(group(entry.name, [`${countLeaves(children)} files`], children))
    } else if (isSource(entry.name)) {
      nodes.push(
        leaf(entry.name, [
          `path: ${relative(root, full)}`,
          `kind: ${entry.name.endsWith(".tsx") ? "scene/component" : "entity/module"}`,
        ]),
      )
    }
  }
  return nodes
}

// --- node + fs helpers -------------------------------------------------------

let nextId = 1

function leaf(type: string, detail: string[]): InspectorNode {
  return node(type, detail, [])
}

function group(type: string, detail: string[], children: InspectorNode[]): InspectorNode {
  return node(type, detail, children)
}

function node(type: string, detail: string[], children: InspectorNode[]): InspectorNode {
  return {
    id: nextId++,
    type,
    kind: InspectorNodeKind.Entity,
    enabled: true,
    visible: true,
    zIndex: 0,
    props: {},
    children,
    detail,
  }
}

function staticSnapshot(scene: InspectorTree): InspectorSnapshot {
  return {
    protocol: INSPECT_PROTOCOL_VERSION,
    tick: 0,
    framesPerSecond: 0,
    ticksPerSecond: 0,
    paused: false,
    sceneStack: [],
    scene,
  }
}

function countLeaves(nodes: readonly InspectorNode[]): number {
  let total = 0
  for (const entry of nodes) total += entry.children.length > 0 ? countLeaves(entry.children) : 1
  return total
}

function sortedEntries(directory: string): { name: string; isDirectory(): boolean }[] {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
}

function isDirectory(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory()
}

function isYaml(name: string): boolean {
  return name.endsWith(".yaml") || name.endsWith(".yml")
}

function isSource(name: string): boolean {
  return name.endsWith(".ts") || name.endsWith(".tsx")
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
