import { render } from "@opentui/solid"
import type { InspectorCommand, InspectorEdit, InspectorSnapshot } from "@ahokinson/rune"
import type { Accessor } from "solid-js"
import { InspectorApp } from "./InspectorApp"

export interface InspectorTuiOptions {
  title: string
  snapshot: Accessor<InspectorSnapshot>
  editable: boolean
  onEdit?: (edit: InspectorEdit) => void
  onCommand?: (command: InspectorCommand) => void
  // Live-connection state. When this turns false (the `rune dev` session ended)
  // the TUI tears itself down — the inspector only works while the game runs.
  connected?: Accessor<boolean>
}

// Boot the inspector TUI, resolving when the user quits (q / esc) or the live
// connection drops. Both `rune preview` and `rune inspect` render through this;
// the data source and whether edits are accepted are the only differences.
export function runInspectorTui(options: InspectorTuiOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    render(() => (
      <InspectorApp
        title={options.title}
        snapshot={options.snapshot}
        editable={options.editable}
        onEdit={options.onEdit}
        onCommand={options.onCommand}
        connected={options.connected}
        onExit={resolve}
      />
    ))
  })
}
