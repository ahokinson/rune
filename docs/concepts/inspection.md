# Inspection

Rune ships a live inspection system used by two CLI commands: `rune inspect` (live, editable) and `rune preview` (static, read-only). Both render through the same inspector TUI; the only differences are the data source and whether edits are accepted.

## `rune inspect`

Attaches to a game already running under `rune dev` (over a local Unix socket) and shows its live scene/entity tree in a second terminal.

```sh
# Terminal 1
bunx rune dev

# Terminal 2 (same directory)
bunx rune inspect
```

The inspector shows:

- The active scene's entity tree, expandable/collapsible.
- Per-entity properties: `enabled`, `visible`, `zIndex`, `position`, `scale`, `rotation`.
- Live FPS, TPS, tick, and paused state in the header.

### Editing

- **Toggle booleans**: `enabled` / `visible` — press `Space` or `←`/`→` on the selected property.
- **Nudge numbers**: `position.x/y/z` (step 0.5), `scale.x/y/z` (step 0.1), `rotation` (step 0.1), `zIndex` (step 1) — press `←`/`→`.
- **Pause/resume**: press `P`.
- **Quit**: press `Q` or `Escape`.

Live edits affect the running process only — they are **never** written back to files.

### Controls

| Key | Action |
| --- | --- |
| `↑`/`↓` or `K`/`J` | Move selection |
| `→`/`L` or `←`/`H` | Expand / collapse (tree pane) or edit (detail pane) |
| `Enter` | Focus the detail pane |
| `Tab` | Switch pane (tree ↔ detail) |
| `PageUp`/`PageDown` | Move by a page |
| `Home`/`End` | Jump to top / bottom |
| `P` | Pause/resume the simulation |
| `Q` / `Escape` | Quit |

## `rune preview`

Browses a project's files and assets without running it.

```sh
bunx rune preview
```

It scans the current directory for:

- Project metadata (name, entry file, directory).
- YAML assets (from `assets/`) — type, name, legend/clip counts.
- Source files (from `scene/`, `scenes/`, `game/`, `entities/`) — path and kind.

The snapshot is computed once and rendered read-only (`editable: false`).

## The wire protocol

The inspector protocol is newline-delimited JSON over a Unix socket. The message types are defined in `inspect/protocol.ts`:

### Server → inspector: `InspectorSnapshot`

Broadcast on every frame (or on change). Contains:

- `protocol` — the protocol version ([`INSPECT_PROTOCOL_VERSION`](../api/Variable.INSPECT_PROTOCOL_VERSION.md)).
- `tick`, `framesPerSecond`, `ticksPerSecond`, `paused`.
- `sceneStack` — the names of all scenes on the stack.
- `scene` — an [`InspectorTree`](../api/Interface.InspectorTree.md) of the active scene's entities.

Each [`InspectorNode`](../api/Interface.InspectorNode.md) has:

- `id` — a stable per-process entity id (assigned by a `WeakMap` in `inspect/identity.ts`).
- `kind` — [`InspectorNodeKind`](../api/Enumeration.InspectorNodeKind.md) (`Entity` / `World`).
- `type` — the entity's class name.
- `enabled`, `visible`, `zIndex`.
- `props` — transform fields (`position`, `scale`, `rotation`, `size`) as `Vector2Data` / `Vector3Data` / `QuaternionData`.
- `children` — child nodes.
- `world` — for `WorldView3D` entities, the nested 3D scene's tree (lets you drill into a 3D world from the 2D tree).
- `detail` — for `rune preview`'s static nodes, informational lines instead of editable props.

### Inspector → server: `InspectorEdit`

```ts
{ kind: "edit", id: number, prop: string, value: number | boolean }
```

Applies a single property change to the live entity with id `id`. [`applyEdit`](../api/Function.applyEdit.md) in `inspect/snapshot.ts` handles this on the server side.

### Inspector → server: `InspectorCommand`

```ts
{ kind: "command", action: InspectorCommandAction }
```

[`InspectorCommandAction`](../api/Enumeration.InspectorCommandAction.md) is `Pause` / `Resume`.

## The inspection server

[`InspectionServer`](../api/Class.InspectionServer.md) is a Unix-socket server that:

- Broadcasts `InspectorSnapshot`s on every frame.
- Receives `InspectorEdit` / `InspectorCommand` messages and applies them.

It's only constructed when `RUNE_INSPECT_SOCKET` is set (which `rune dev` does by default). `rune build` defines `RUNE_COMPILED = "1"`, which dead-code-eliminates the server from shipped binaries — the `import("./inspect/server")` is dynamic and guarded by `process.env.RUNE_COMPILED !== "1"`.

## The socket path

[`DEFAULT_SOCKET_PATH`](../api/Variable.DEFAULT_SOCKET_PATH.md) is `.rune/inspect.sock` (project-local). `rune dev` sets `RUNE_INSPECT_SOCKET` to this path; `rune inspect` connects to it. If the project path is too long for a Unix socket (~100 bytes on macOS), it falls back to `$TMPDIR/rune-<project>.sock`. Override with `--socket <path>`.

## See also

- [`rune inspect` command](../cli/inspect.md)
- [`rune preview` command](../cli/preview.md)
- [`InspectorSnapshot` type](../api/Interface.InspectorSnapshot.md)
- [`InspectorNode` type](../api/Interface.InspectorNode.md)
- [`InspectionServer` class](../api/Class.InspectionServer.md)
- [Architecture](../architecture.md) — the dead-code-elimination mechanism.
