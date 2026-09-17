# rune inspect

Attach to a game already running under `rune dev` over its Unix socket and browse or edit the live scene/entity tree in this terminal. Snapshots stream in as newline-delimited JSON; edits and pause/resume commands go back the same way.

## Synopsis

```sh
rune inspect [--socket <path>]
```

## Flags

| Flag | Default | Description |
| --- | --- | --- |
| `--socket <path>` | `.rune/inspect.sock` (or a temp fallback) | The Unix socket path to connect to, resolved relative to the current working directory. Defaults to the same path `rune dev` exposes. |

## Description

`rune inspect` is the live counterpart to `rune preview`: same TUI, but the data source is a running game and edits flow back to it. Run it in a second terminal from the same project directory as `rune dev`.

### Socket resolution

The command calls `inspectionSocketPath(flags.get("socket"))` — the same helper `rune dev` uses — so by default the two ends agree without any flags:

1. An explicit `--socket <path>` is resolved against the cwd and used verbatim.
2. Otherwise the default is `<cwd>/.rune/inspect.sock` (the engine's `DEFAULT_SOCKET_PATH`).
3. If that path would exceed ~100 bytes (the Unix socket limit on macOS), it falls back to `$TMPDIR/rune-<project>.sock` (or `/tmp/...` if `TMPDIR` is unset), where `<project>` is derived from `package.json`'s `name`.

If no game is listening at the resolved path, `Bun.connect` throws and the command exits with code 1, pointing you at `rune dev`. Run both commands from the same project directory (or pass matching `--socket` paths) so they agree on the endpoint.

### The wire protocol

The protocol is newline-delimited JSON over the Unix socket. The inspector maintains a `buffer` and parses each complete line as an `InspectorSnapshot`; malformed lines are ignored rather than tearing down the session. Edits and commands are sent back as `JSON.stringify(message) + "\n"`.

- **Server → inspector:** `InspectorSnapshot` — `protocol`, `tick`, `framesPerSecond`, `ticksPerSecond`, `paused`, `sceneStack`, and `scene` (an `InspectorTree` of the active scene's entities). Each `InspectorNode` carries `id`, `type`, `enabled`, `visible`, `zIndex`, transform `props`, and `children`.
- **Inspector → server:** `InspectorEdit` — `{ kind: "edit", id, prop, value }` — applies a single property change to the live entity.
- **Inspector → server:** `InspectorCommand` — `{ kind: "command", action }` — `Pause` or `Resume`.

See [Inspection](../concepts/inspection.md) for the full protocol and snapshot shape.

### The TUI

The command wraps `runInspectorTui` with `editable: true`, passing the live `snapshot` signal, the `connected` signal, and `send` as both `onEdit` and `onCommand`. The TUI shows the entity tree, per-entity properties (`enabled`, `visible`, `zIndex`, `position`, `scale`, `rotation`), and the live FPS/TPS/tick/paused header. Edits affect the running process only — they are never written back to files.

### Teardown

The TUI tears itself down when the `connected` signal goes false, which happens on the socket's `error` or `close` event. The inspector treats the first disconnect as terminal (`lostConnection`) and ignores subsequent events. On exit the command calls `socket.end()` and, if the connection was lost, prints `game stopped (rune dev exited) — inspector disconnected.`

## Examples

```sh
# Terminal 1: start the game with inspection on
rune dev

# Terminal 2 (same directory): attach
rune inspect

# Attach to a non-default socket path
rune inspect --socket /tmp/my-game.sock
```

## See also

- [rune dev](dev.md) — the command that exposes the socket this connects to.
- [rune preview](preview.md) — the read-only, no-running-game version of the same TUI.
- [Inspection](../concepts/inspection.md) — the wire protocol, snapshot shape, edit model, and controls.
