# rune preview

Open a read-only inspector TUI that describes the game in the current directory without running it — project metadata, the YAML asset inventory, and the scene/entity source files. It takes no arguments.

## Synopsis

```sh
rune preview
```

## Flags

`rune preview` takes no flags and no arguments. It scans the current working directory.

## Description

`rune preview` is the static counterpart to `rune inspect`: same TUI, different data source. Where `rune inspect` streams live snapshots from a running game, `rune preview` builds one `InspectorSnapshot` once — purely from the filesystem — and renders it read-only. Use it to browse a project's structure before running it, or to inspect a game whose source you're reading.

### What it scans

The scanner (`scanProject` in `cli/preview/scan.ts`) walks the current working directory and builds three top-level categories:

1. **Project metadata** — `name` (from `package.json`, falling back to the directory basename), `entry` (the resolved entry file or `(none found)`), and `directory` (the absolute root).
2. **Assets** — recursively scans the `assets/` directory for `.yaml` and `.yml` files. For each file it loads the YAML with `loadYamlSync` and reports `path`, `type`, `name`, `legends` (count), `clips` (count), and `manifest entries` (count) where present. Parse errors are surfaced inline as `(parse error: ...)`.
3. **Scenes & entities** — recursively scans `scene/`, `scenes/`, `game/`, and `entities/` for `.ts` and `.tsx` files. For each file it reports `path` and `kind` — `scene/component` for `.tsx`, `entity/module` for `.ts`.

### Entry resolution

The snapshot's `entry` field uses the same `resolveEntry()` as `rune dev` and `rune build`, probing `main.tsx`, `main.ts`, `src/main.tsx`, `src/main.ts` in order. If none is found, the metadata pane shows `(none found)` — the command does not exit early, since the file tree is still useful.

### Rendering

The snapshot is passed to `runInspectorTui` with `editable: false` and a `snapshot: () => snapshot` accessor that always returns the same precomputed value. The TUI is the same one `rune inspect` uses; the only differences are the title (`rune preview · <name>`), the static data source, and the absence of edit handlers. Preview nodes carry `detail` lines (path, type, kind) instead of editable transform props, so the detail pane renders informational text rather than `enabled`/`visible`/`position` rows.

The command exits with code 0 when you quit the TUI (`Q` / `Escape`).

## Examples

```sh
# Browse the current project's files and assets
rune preview

# From inside a project directory
cd my-game && rune preview
```

## See also

- [rune inspect](inspect.md) — the live, editable version of the same TUI.
- [Inspection](../concepts/inspection.md) — the snapshot shape, the wire protocol, the shared TUI.
- [Assets](../concepts/assets.md) — the YAML asset format the scanner introspects.
