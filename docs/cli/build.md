# rune build

Produce a shippable artifact from the game's entry module. By default compiles a standalone binary with the current platform's native renderer embedded; `--bundle` emits a lighter `dist/main.js` that runs against `node_modules` with `bun`.

## Synopsis

```sh
rune build [--bundle] [--outfile <path>]
```

## Flags

| Flag | Default | Description |
| --- | --- | --- |
| `--bundle` | (unset — binary) | Emit a JavaScript bundle to `dist/main.js` instead of compiling a standalone binary. |
| `--outfile <path>` | `<projectName>` | The output filename for the compiled binary (binary mode only). Resolved relative to the cwd. Ignored when `--bundle` is set. |

## Description

`rune build` is the one command that turns source into something distributable. It runs the game's entry through `Bun.build` with the OpenTUI Solid plugin, then either compiles a binary or writes a bundle.

### Entry resolution

Like `rune dev`, the command calls `resolveEntry()` and probes, in order: `main.tsx`, `main.ts`, `src/main.tsx`, `src/main.ts`. If none is found it exits with code 1. Run it from a project root.

### The Solid plugin

SolidJS needs its JSX transform at build time, which `bun build` (the CLI) does **not** pick up from `bunfig.toml`'s `preload`. So `rune build` imports `@opentui/solid/bun-plugin` and passes it to `Bun.build` explicitly as the only plugin. This is the reason a build command exists at all rather than just calling `bun build` directly.

### External packages

OpenTUI's renderer is a native package selected at runtime via per-platform dynamic imports. Only the current platform's package is installed, so the others must be external — otherwise the bundler fails resolving, say, `@opentui/core-win32-x64` on macOS.

- **Binary mode (default):** `external` is every `@opentui/core-*` package except the current platform's (`@opentui/core-${process.platform}-${process.arch}`). The current platform's package stays bundled so `--compile` embeds its native library into the binary, loaded from bunfs at runtime.
- **Bundle mode (`--bundle`):** `external` is `["@opentui/*"]` — all OpenTUI packages stay external, since the bundle is meant to run against a real `node_modules` tree.

The full set of platform packages considered: `@opentui/core-linux-x64`, `@opentui/core-linux-x64-musl`, `@opentui/core-linux-arm64`, `@opentui/core-linux-arm64-musl`, `@opentui/core-darwin-x64`, `@opentui/core-darwin-arm64`, `@opentui/core-win32-x64`, `@opentui/core-win32-arm64`.

### Dead-code elimination of the inspection server

`Bun.build` is called with `define: { "process.env.RUNE_COMPILED": JSON.stringify("1") }`. The engine's inspection server import is guarded by `process.env.RUNE_COMPILED !== "1"`, so this constant folds the guard to `false` and the `InspectionServer` (and its dynamic `import("./inspect/server")`) is dead-code-eliminated. A shipped game has no inspection ability. Running from source via `rune dev` never sets `RUNE_COMPILED`, so the server is present there.

### Output

- **Binary mode:** `Bun.build` is called with `compile: { outfile: flags.get("outfile") ?? await projectName() }`. `projectName()` reads `<cwd>/package.json`'s `name` (sanitized to `[^A-Za-z0-9._-]` → `-`), falling back to the directory's basename. The resulting binary reads a `bunfig.toml` from its working directory at startup, so a dev project's `preload` would shadow it — distribute and run it outside the project tree.
- **Bundle mode:** `Bun.build` is called with `outdir: <cwd>/dist`, producing `dist/main.js`. Run it with `bun dist/main.js` from a directory whose `node_modules` resolve `rune` and `@opentui/*`.

On failure the command prints `Bun.build`'s logs and suggests `rune dev` or `rune build --bundle` as fallbacks.

## Examples

```sh
# Compile a standalone binary named after the project
rune build

# Compile to a specific filename
rune build --outfile ./bin/my-game

# Emit a bundle to dist/main.js (run with: bun dist/main.js)
rune build --bundle
```

## Environment variables

| Variable | Effect |
| --- | --- |
| `RUNE_COMPILED` | Defined to `"1"` at build time via `Bun.build`'s `define`, **not** set in the runtime environment. Folds the engine's inspection-server guard to a constant so the server is dead-code-eliminated from the output. |

## See also

- [rune dev](dev.md) — run from source without building.
- [Inspection](../concepts/inspection.md) — the `RUNE_COMPILED` guard and why the server is compiled out.
- [Architecture](../architecture.md) — the dead-code-elimination mechanism.
