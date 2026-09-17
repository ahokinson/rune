import { TextAttributes } from "@opentui/core"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/solid"
import {
  clamp,
  type InspectorCommand,
  InspectorCommandAction,
  type InspectorEdit,
  type InspectorNode,
  type InspectorSnapshot,
  Keys,
} from "../../src/index"
import { type Accessor, createEffect, createMemo, createSignal, For, type JSX, Show } from "solid-js"
import { breadcrumb, flattenTree, type PropertyRow, propertyRows, rowLabel } from "./model"

export interface InspectorAppProps {
  title: string
  // Reactive source of state: live socket snapshots, or a single static
  // snapshot for `rune preview`.
  snapshot: Accessor<InspectorSnapshot>
  // When false the detail pane is read-only and pause/edit keys do nothing.
  editable: boolean
  onEdit?: (edit: InspectorEdit) => void
  onCommand?: (command: InspectorCommand) => void
  // When provided and it turns false, the live game has stopped and the TUI
  // closes itself — there is nothing live left to inspect.
  connected?: Accessor<boolean>
  onExit?: () => void
}

interface KeyboardEventLike {
  name?: string
  eventType?: string
}

type Pane = "tree" | "detail"

// Percent of the width given to the tree pane; the detail pane takes the rest.
const TREE_WIDTH_PERCENT = 42
const TREE_WIDTH_FRACTION = TREE_WIDTH_PERCENT / 100
// Rows consumed by the header, footer, and the pane's top/bottom borders, so the
// scroll window knows how many entity rows actually fit.
const CHROME_ROWS = 5

export function InspectorApp(props: InspectorAppProps): JSX.Element {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()
  const [expanded, setExpanded] = createSignal<ReadonlySet<number>>(new Set())
  const [selectedId, setSelectedId] = createSignal<number | null>(null)
  const [propIndex, setPropIndex] = createSignal(0)
  const [focus, setFocus] = createSignal<Pane>("tree")
  const [scrollOffset, setScrollOffset] = createSignal(0)

  const rows = createMemo(() => flattenTree(props.snapshot().scene, expanded()))
  const selectedIndex = createMemo(() => {
    const list = rows()
    if (list.length === 0) return -1
    const id = selectedId()
    if (id === null) return 0
    const index = list.findIndex((row) => row.node.id === id)
    return index === -1 ? 0 : index
  })
  const selectedNode = createMemo(() => rows()[selectedIndex()]?.node ?? null)
  const properties = createMemo(() => {
    const node = selectedNode()
    return node ? propertyRows(node) : []
  })

  // Layout-derived sizes (reactive to terminal resize).
  const visibleRows = createMemo(() => Math.max(3, dimensions().height - CHROME_ROWS))
  const treeInner = createMemo(() => Math.max(12, Math.floor(dimensions().width * TREE_WIDTH_FRACTION) - 3))
  const detailInner = createMemo(() =>
    Math.max(12, dimensions().width - Math.floor(dimensions().width * TREE_WIDTH_FRACTION) - 3),
  )

  // Keep the selected row inside the scroll window, scrolling the minimum needed
  // and clamping when the list shrinks.
  createEffect(() => {
    const index = selectedIndex()
    const view = visibleRows()
    const total = rows().length
    setScrollOffset((offset) => {
      if (index < 0) return 0
      let next = offset
      if (index < offset) next = index
      else if (index >= offset + view) next = index - view + 1
      const maxOffset = Math.max(0, total - view)
      return Math.min(Math.max(0, next), maxOffset)
    })
  })

  const windowRows = createMemo(() => {
    const start = scrollOffset()
    return rows()
      .slice(start, start + visibleRows())
      .map((row, offset) => ({ row, index: start + offset }))
  })

  const moveSelection = (delta: number): void => {
    const list = rows()
    if (list.length === 0) return
    const next = list[clamp(selectedIndex() + delta, 0, list.length - 1)]
    if (next) setSelectedId(next.node.id)
  }

  const selectAt = (index: number): void => {
    const next = rows()[clamp(index, 0, rows().length - 1)]
    if (next) setSelectedId(next.node.id)
  }

  const expandSelected = (): void => {
    const row = rows()[selectedIndex()]
    if (!row?.hasChildren) return
    if (expanded().has(row.node.id)) {
      moveSelection(1) // already open — step into the first child
      return
    }
    setExpanded((previous) => new Set(previous).add(row.node.id))
  }

  const collapseSelected = (): void => {
    const list = rows()
    const index = selectedIndex()
    const row = list[index]
    if (!row) return
    if (row.hasChildren && expanded().has(row.node.id)) {
      setExpanded((previous) => {
        const next = new Set(previous)
        next.delete(row.node.id)
        return next
      })
      return
    }
    for (let i = index - 1; i >= 0; i--) {
      const candidate = list[i]
      if (candidate && candidate.depth < row.depth) {
        setSelectedId(candidate.node.id)
        return
      }
    }
  }

  const moveProp = (delta: number): void => {
    const list = properties()
    if (list.length === 0) return
    setPropIndex((index) => clamp(index + delta, 0, list.length - 1))
  }

  const editSelectedProp = (direction: number): void => {
    if (!props.editable) return
    const node = selectedNode()
    const prop = properties()[propIndex()]
    if (!node || !prop?.prop) return
    if (prop.kind === "boolean") {
      props.onEdit?.({ kind: "edit", id: node.id, prop: prop.prop, value: !(prop.value as boolean) })
      return
    }
    const next = (prop.value as number) + direction * prop.step
    props.onEdit?.({ kind: "edit", id: node.id, prop: prop.prop, value: roundStep(next) })
  }

  const togglePause = (): void => {
    if (!props.editable) return
    const action = props.snapshot().paused ? InspectorCommandAction.Resume : InspectorCommandAction.Pause
    props.onCommand?.({ kind: "command", action })
  }

  const quit = (): void => {
    renderer.destroy()
    props.onExit?.()
  }

  // The inspector only works while the game runs: when the live connection drops
  // (the `rune dev` session ended), close the TUI rather than leave stale state.
  createEffect(() => {
    if (props.connected && !props.connected()) quit()
  })

  // Keys common to both panes. Returns true when handled.
  const handleGlobal = (name: string): boolean => {
    switch (name) {
      case Keys.Q:
      case Keys.Escape:
        quit()
        return true
      case Keys.Tab:
        setFocus((pane) => (pane === "tree" ? "detail" : "tree"))
        return true
      case Keys.P:
        togglePause()
        return true
      default:
        return false
    }
  }

  useKeyboard((event: KeyboardEventLike) => {
    if (event.eventType === "release") return
    const name = event.name
    if (!name || handleGlobal(name)) return

    if (focus() === "tree") {
      switch (name) {
        case Keys.Up:
        case Keys.K:
          moveSelection(-1)
          return
        case Keys.Down:
        case Keys.J:
          moveSelection(1)
          return
        case Keys.Right:
        case Keys.L:
          expandSelected()
          return
        case Keys.Left:
        case Keys.H:
          collapseSelected()
          return
        case Keys.PageUp:
          moveSelection(-visibleRows())
          return
        case Keys.PageDown:
          moveSelection(visibleRows())
          return
        case Keys.Home:
          selectAt(0)
          return
        case Keys.End:
          selectAt(rows().length - 1)
          return
        case Keys.Enter:
          setFocus("detail")
          return
      }
      return
    }

    switch (name) {
      case Keys.Up:
      case Keys.K:
        moveProp(-1)
        return
      case Keys.Down:
      case Keys.J:
        moveProp(1)
        return
      case Keys.Left:
      case Keys.H:
        editSelectedProp(-1)
        return
      case Keys.Right:
      case Keys.L:
      case Keys.Space:
      case Keys.Enter:
        editSelectedProp(1)
        return
    }
  })

  const headerLine = (): string => {
    const snapshot = props.snapshot()
    const parts = [props.title, `scene: ${snapshot.scene ? snapshot.scene.name : "(none)"}`]
    if (snapshot.ticksPerSecond > 0) {
      parts.push(`fps ${snapshot.framesPerSecond.toFixed(0)}`, `tick ${snapshot.tick}`)
    }
    if (snapshot.paused) parts.push("◼ PAUSED")
    return parts.join("   ")
  }

  const footerLine = (): string => {
    const base = "↑↓/jk move · ←→/hl expand·edit · ⇥ pane · ⏎ focus · q quit"
    return props.editable ? `${base} · p pause` : `${base} · read-only`
  }

  const treeTitle = (): string => {
    const total = rows().length
    if (total === 0) return " tree "
    return ` tree  ${selectedIndex() + 1}/${total} `
  }

  return (
    <box flexDirection="column" width="100%" height="100%">
      <box paddingLeft={1} paddingRight={1}>
        <text fg="cyan" attributes={TextAttributes.BOLD}>
          {headerLine()}
        </text>
      </box>
      <box flexDirection="row" flexGrow={1}>
        <box
          flexDirection="column"
          width={`${TREE_WIDTH_PERCENT}%`}
          border
          borderColor={focus() === "tree" ? "cyan" : "gray"}
          title={treeTitle()}
        >
          <Show when={rows().length > 0} fallback={<text fg="gray">no entities</text>}>
            <For each={windowRows()}>
              {(entry) => {
                const selected = entry.index === selectedIndex()
                const active = selected && focus() === "tree"
                return (
                  <text
                    bg={selected ? (active ? "#1f6feb" : "#30363d") : undefined}
                    fg={active ? "white" : entry.row.node.visible ? "white" : "gray"}
                    attributes={active ? TextAttributes.BOLD : TextAttributes.NONE}
                  >
                    {fit(`${selected ? "▶" : " "} ${rowLabel(entry.row)}`, treeInner())}
                  </text>
                )
              }}
            </For>
          </Show>
        </box>
        <box
          flexDirection="column"
          flexGrow={1}
          border
          borderColor={focus() === "detail" ? "cyan" : "gray"}
          title=" properties "
        >
          <Show when={selectedNode()} fallback={<text fg="gray">no selection</text>}>
            {(node: Accessor<InspectorNode>) => (
              <Show
                when={node().detail}
                fallback={
                  <>
                    <text fg="yellow" attributes={TextAttributes.BOLD}>
                      {fit(breadcrumb(rows(), selectedIndex()), detailInner())}
                    </text>
                    <For each={properties()}>
                      {(prop, index) => {
                        const active = focus() === "detail" && index() === propIndex()
                        return (
                          <text bg={active ? "#1f6feb" : undefined} fg={propColor(prop, active)}>
                            {fit(formatProp(prop, active), detailInner())}
                          </text>
                        )
                      }}
                    </For>
                  </>
                }
              >
                {(detail: Accessor<string[]>) => (
                  <>
                    <text fg="yellow" attributes={TextAttributes.BOLD}>
                      {node().type}
                    </text>
                    <For each={detail()}>{(line: string) => <text fg="gray">{fit(line, detailInner())}</text>}</For>
                  </>
                )}
              </Show>
            )}
          </Show>
        </box>
      </box>
      <box paddingLeft={1} paddingRight={1}>
        <text fg="gray">{footerLine()}</text>
      </box>
    </box>
  )
}

function formatProp(prop: PropertyRow, active: boolean): string {
  const label = prop.label.padEnd(12)
  if (prop.kind === "boolean") return `  ${label} ${prop.value ? "● true" : "○ false"}`
  // Editable numeric: show nudge arrows on the focused row, a dot otherwise.
  if (prop.prop) return `${active ? "‹›" : "  "} ${label} ${prop.display}`
  return `  ${label} ${prop.display}`
}

function propColor(prop: PropertyRow, active: boolean): string {
  if (active) return "white"
  if (!prop.prop) return "gray" // read-only
  if (prop.kind === "boolean") return prop.value ? "green" : "red"
  return "cyan"
}

// Pad or truncate a line to exactly `width` cells so a row's highlight fills the
// pane and long labels don't wrap.
function fit(text: string, width: number): string {
  if (text.length === width) return text
  if (text.length < width) return text + " ".repeat(width - text.length)
  return width <= 1 ? text.slice(0, width) : `${text.slice(0, width - 1)}…`
}

// Round to a few decimals so repeated step nudges don't accumulate float noise.
function roundStep(value: number): number {
  return Math.round(value * 1000) / 1000
}
