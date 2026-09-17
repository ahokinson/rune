import { describe, expect, it } from "bun:test"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { type InspectorNode, InspectorNodeKind } from "@ahokinson/rune"
import { scanProject } from "../preview/scan"
import { breadcrumb, flattenTree, propertyRows, rowLabel } from "./model"

function node(id: number, type: string, overrides: Partial<InspectorNode> = {}): InspectorNode {
  return {
    id,
    type,
    kind: InspectorNodeKind.Entity2D,
    enabled: true,
    visible: true,
    zIndex: 0,
    props: {},
    children: [],
    ...overrides,
  }
}

describe("flattenTree", () => {
  const child = node(2, "Weapon")
  const root = node(1, "Player", { children: [child] })
  const tree = { name: "game", entities: [root] }

  it("shows only roots when nothing is expanded", () => {
    const rows = flattenTree(tree, new Set())
    expect(rows).toHaveLength(1)
    expect(rows[0]?.hasChildren).toBe(true)
    expect(rows[0]?.expanded).toBe(false)
  })

  it("reveals children under an expanded node", () => {
    const rows = flattenTree(tree, new Set([1]))
    expect(rows.map((row) => row.node.type)).toEqual(["Player", "Weapon"])
    expect(rows[1]?.depth).toBe(1)
  })

  it("treats a WorldView3D's world entities as descendants", () => {
    const worldEntity = node(3, "MeshEntity3D", { kind: InspectorNodeKind.Entity3D })
    const view = node(1, "WorldView3D", {
      kind: InspectorNodeKind.WorldView3D,
      world: { name: "Scene3D", entities: [worldEntity] },
    })
    const rows = flattenTree({ name: "game", entities: [view] }, new Set([1]))
    expect(rows.map((row) => row.node.type)).toEqual(["WorldView3D", "MeshEntity3D"])
  })
})

describe("breadcrumb", () => {
  it("builds the ancestor path from flattened rows", () => {
    const grandchild = node(3, "Muzzle")
    const child = node(2, "Weapon", { children: [grandchild] })
    const root = node(1, "Player", { children: [child] })
    const rows = flattenTree({ name: "game", entities: [root] }, new Set([1, 2]))
    // rows: [Player(0), Weapon(1), Muzzle(2)]
    expect(breadcrumb(rows, 2)).toBe("Player / Weapon / Muzzle")
    expect(breadcrumb(rows, 0)).toBe("Player")
  })
})

describe("propertyRows", () => {
  it("lists editable transform fields for a 2D node", () => {
    const entity = node(1, "Player", {
      props: { position: { x: 1, y: 2 }, rotation: 0, scale: { x: 1, y: 1 }, size: { x: 1, y: 1 } },
    })
    const props = propertyRows(entity)
    const editable = props.filter((row) => row.prop).map((row) => row.prop)
    expect(editable).toContain("position.x")
    expect(editable).toContain("rotation")
    // size is read-only (no `prop`).
    expect(props.find((row) => row.label === "size")?.prop).toBeUndefined()
  })

  it("returns no editable rows for an informational node", () => {
    const info = node(1, "imp.yaml", { detail: ["type: enemy"] })
    expect(propertyRows(info)).toEqual([])
  })
})

describe("rowLabel", () => {
  it("renders caret, type, id and flags for an entity", () => {
    const row = { node: node(3, "Player", { zIndex: 2, visible: false }), depth: 1, hasChildren: true, expanded: false }
    const label = rowLabel(row)
    expect(label).toContain("▸")
    expect(label).toContain("Player #3")
    expect(label).toContain("z2")
    expect(label).toContain("hidden")
  })

  it("omits entity flags for an informational node", () => {
    const row = { node: node(1, "assets", { detail: ["3 files"] }), depth: 0, hasChildren: true, expanded: true }
    expect(rowLabel(row)).toContain("assets")
    expect(rowLabel(row)).not.toContain("z0")
  })
})

describe("scanProject", () => {
  it("describes project metadata, YAML assets, and scene/entity files", () => {
    const root = mkdtempSync(join(tmpdir(), "rune-preview-"))
    mkdirSync(join(root, "assets", "weapons"), { recursive: true })
    mkdirSync(join(root, "scene"), { recursive: true })
    writeFileSync(join(root, "assets", "weapons", "pistol.yaml"), "type: weapon\nname: pistol\nlegends:\n  idle: {}\n")
    writeFileSync(join(root, "scene", "Player.ts"), "export class Player {}\n")
    writeFileSync(join(root, "scene", "Title.tsx"), "export function Title() {}\n")

    const snapshot = scanProject(root, "demo", join(root, "main.tsx"))
    const categories = snapshot.scene?.entities ?? []
    const labels = categories.map((category) => category.type)
    expect(labels[0]).toBe("project: demo")
    expect(labels).toContain("assets")
    expect(labels).toContain("scenes & entities")

    const assets = categories.find((category) => category.type === "assets")
    // assets -> weapons -> pistol.yaml
    const pistol = assets?.children[0]?.children[0]
    expect(pistol?.type).toBe("pistol.yaml")
    expect(pistol?.detail).toContain("type: weapon")

    const code = categories.find((category) => category.type === "scenes & entities")
    const sceneFiles = code?.children[0]?.children.map((file) => file.type) ?? []
    expect(sceneFiles).toContain("Player.ts")
    expect(sceneFiles).toContain("Title.tsx")
  })
})
