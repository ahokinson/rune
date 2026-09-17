# rune dev

Run the game from source with Bun, watching for changes by default, inheriting the TTY so the terminal game gets the real screen and input. Unless disabled, also exposes a live inspection socket that `rune inspect` can attach to from another terminal.

## Synopsis

```sh
rune dev [--no-watch] [--no-inspect] [--socket <path>]
```

## Flags

| Flag | Default | Description |
| --- | --- | --- |
| `--no-watch` | (unset — watching on) | Disable Bun's `--watch` mode. The game runs once and exits when the app tears down. |
| `--no-inspect` | (unset — inspect on) | Do not set `RUNE_INSPECT_SOCKET`; the game runs with no inspection server. |
| `--socket <path>` | `.rune/inspect.sock` (or a temp fallback) | Override the inspection socket path, resolved relative to the current working directory. Only meaningful when `--no-inspect` is not set. |

## Description

`rune dev` is the primary inner-loop command. It locates the game's entry module, starts it under Bun, and gets out of the way — stdio is inherited, so the game renders straight to your terminal and reads the real keyboard and mouse.

### Entry resolution

The command calls `resolveEntry()`, which probes the following candidates in order relative to the current working directory and uses the first that exists:

1. `main.tsx`
2. `main.ts`
3. `src/main.tsx`
4. `src/main.ts`

If none is found, the command exits with code 1 and points you to run from a rune project root. Run `rune dev` from the directory containing your `package.json`.

### Watch mode

Watching is on by default. The spawned command is `bun --watch <entry>`; with `--no-watch` it is `bun <entry>`. `--watch` keeps the Bun process alive after the app tears down, so the engine exits the process itself when the player quits (see `Application`'s shutdown). `RUNE_DEV=1` marks this standalone run to the engine.

### Inspection socket

Unless `--no-inspect` is passed, the command computes a socket path via `inspectionSocketPath(flags.get("socket"))`, creates its parent directory, and exposes it to the game as `RUNE_INSPECT_SOCKET`. The path resolution is:

1. An explicit `--socket <path>` is resolved against the cwd and used verbatim.
2. Otherwise the default is `<cwd>/.rune/inspect.sock` (the engine's `DEFAULT_SOCKET_PATH`).
3. If that path would exceed ~100 bytes (the Unix socket limit on macOS), it falls back to `$TMPDIR/rune-<project>.sock` (or `/tmp/...` if `TMPDIR` is unset), where `<project>` is derived from `package.json`'s `name`.

While the socket is set, `rune dev` prints a hint pointing you at `rune inspect`. The engine constructs an `InspectionServer` only when `RUNE_INSPECT_SOCKET` is present, so `--no-inspect` skips the server entirely.

### Spawn

The child is spawned with `Bun.spawn(args, { stdio: ["inherit", "inherit", "inherit"], env })` — full TTY inheritance, plus the augmented environment. `rune dev` returns the child's exit code.

## Examples

```sh
# Run from source, watching, with inspection on
rune dev

# Run once without watch (e.g. for a clean capture)
rune dev --no-watch

# Run with no inspection server
rune dev --no-inspect

# Use a custom socket path
rune dev --socket /tmp/my-game.sock
```

## Environment variables

| Variable | Effect |
| --- | --- |
| `RUNE_DEV` | Always set to `"1"` by `rune dev`. Marks a standalone dev run to the engine. |
| `RUNE_INSPECT_SOCKET` | Set to the resolved socket path unless `--no-inspect` is passed. The engine constructs an `InspectionServer` listening here. |

## See also

- [rune inspect](inspect.md) — attach to the socket this command exposes.
- [rune build](build.md) — produce a shippable artifact instead of running from source.
- [Inspection](../concepts/inspection.md) — the socket, the protocol, the dead-code-elimination guard.
