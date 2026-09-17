import type { EditableProp, InspectorNode, InspectorTree } from "@ahokinson/rune"

// Pure view-model helpers shared by the inspector TUI. Kept free of Solid/opentui
// so the flattening and property-list logic can be unit-tested directly.

export interface TreeRow {
  node: InspectorNode
  depth: number
  hasChildren: boolean
  expanded: boolean
}

// A node's descendants for traversal: its own children plus, for a WorldView3D,
// the entities of its nested 3D world (so you can drill from the 2D tree into 3D).
export function childrenOf(node: InspectorNode): InspectorNode[] {
  if (node.world && node.world.entities.length > 0) return [...node.children, ...node.world.entities]
  return node.children
}

// Depth-first flatten of the tree into the visible rows, honoring the expanded
// set. Root entities are always present; deeper rows appear only under an
// expanded ancestor.
export function flattenTree(tree: InspectorTree | null, expanded: ReadonlySet<number>): TreeRow[] {
  const rows: TreeRow[] = []
  if (!tree) return rows
  const walk = (nodes: readonly InspectorNode[], depth: number): void => {
    for (const node of nodes) {
      const children = childrenOf(node)
      const isExpanded = expanded.has(node.id)
      rows.push({ node, depth, hasChildren: children.length > 0, expanded: isExpanded })
      if (isExpanded) walk(children, depth + 1)
    }
  }
  walk(tree.entities, 0)
  return rows
}

export interface PropertyRow {
  label: string
  display: string
  // Present only when the field can be edited over the live channel.
  prop?: EditableProp
  kind: "boolean" | "number"
  value: number | boolean
  step: number
}

// The properties shown in the detail pane for a node, in display order. Editable
// rows carry a `prop` (the wire field) and `step` (the nudge increment).
export function propertyRows(node: InspectorNode): PropertyRow[] {
  // Informational (preview) nodes describe files, not entities — they render
  // their `detail` lines instead of editable transform fields.
  if (node.detail) return []
  const rows: PropertyRow[] = [
    { label: "enabled", display: String(node.enabled), prop: "enabled", kind: "boolean", value: node.enabled, step: 0 },
    { label: "visible", display: String(node.visible), prop: "visible", kind: "boolean", value: node.visible, step: 0 },
    { label: "zIndex", display: String(node.zIndex), prop: "zIndex", kind: "number", value: node.zIndex, step: 1 },
  ]
  const props = node.props
  if (props.position) {
    rows.push(numberRow("position.x", props.position.x, 0.5))
    rows.push(numberRow("position.y", props.position.y, 0.5))
    if ("z" in props.position) rows.push(numberRow("position.z", props.position.z, 0.5))
  }
  if (props.scale) {
    rows.push(numberRow("scale.x", props.scale.x, 0.1))
    rows.push(numberRow("scale.y", props.scale.y, 0.1))
    if ("z" in props.scale) rows.push(numberRow("scale.z", props.scale.z, 0.1))
  }
  if (typeof props.rotation === "number") {
    rows.push(numberRow("rotation", props.rotation, 0.1))
  } else if (props.rotation) {
    const { x, y, z, w } = props.rotation
    rows.push(readonlyRow("rotation", `(${fmt(x)}, ${fmt(y)}, ${fmt(z)}, ${fmt(w)})`))
  }
  if (props.size) rows.push(readonlyRow("size", `(${fmt(props.size.x)}, ${fmt(props.size.y)})`))
  return rows
}

function numberRow(prop: EditableProp, value: number, step: number): PropertyRow {
  return { label: prop, display: fmt(value), prop, kind: "number", value, step }
}

function readonlyRow(label: string, display: string): PropertyRow {
  return { label, display, kind: "number", value: 0, step: 0 }
}

// Compact numeric formatting: integers stay bare, everything else gets two
// decimals so columns line up and tiny float noise doesn't dominate.
export function fmt(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

// The single-line label for a tree row: indent, expand caret, type, id, and a
// terse flag summary (z-index, hidden/disabled markers).
// The ancestor chain to the row at `index`, as "Root / Child / Selected",
// reconstructed from the flattened rows' depths (each step up is the nearest
// earlier row at a shallower depth).
export function breadcrumb(rows: readonly TreeRow[], index: number): string {
  const target = rows[index]
  if (!target) return ""
  const parts = [target.node.type]
  let depth = target.depth
  for (let i = index - 1; i >= 0 && depth > 0; i--) {
    const candidate = rows[i]
    if (candidate && candidate.depth < depth) {
      parts.unshift(candidate.node.type)
      depth = candidate.depth
    }
  }
  return parts.join(" / ")
}

export function rowLabel(row: TreeRow): string {
  const indent = "  ".repeat(row.depth)
  const caret = row.hasChildren ? (row.expanded ? "▾ " : "▸ ") : "  "
  // Informational (preview) nodes have no entity flags to show.
  if (row.node.detail) return `${indent}${caret}${row.node.type}`
  const flags: string[] = [`z${row.node.zIndex}`]
  if (!row.node.visible) flags.push("hidden")
  if (!row.node.enabled) flags.push("off")
  return `${indent}${caret}${row.node.type} #${row.node.id}  ${flags.join(" ")}`
}
