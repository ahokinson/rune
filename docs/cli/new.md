# rune new

Scaffold a new game project from a template into the current directory, rewriting the copied `package.json` so the project depends on a locally resolvable copy of the engine.

## Synopsis

```sh
rune new <name> [--template <template>]
```

## Flags

| Flag | Default | Description |
| --- | --- | --- |
| `--template <t>` | `starter` | The template directory to copy from `packages/rune/templates/`. Must be one of the available template names. |

## Description

`rune new <name>` copies a template directory from the engine's `templates/` folder into `<cwd>/<name>`. It is the only command that creates a project; everything else (`dev`, `build`, `add`, `preview`, `inspect`) runs against an existing one.

The template name is validated against `listTemplates()` — a directory listing of `packages/rune/templates/`. If `--template` is omitted, `starter` is used. An unknown template name exits with code 1 and prints the available list.

Before copying, the command checks whether the destination path already exists and refuses to overwrite it — there is no `--force`. After copying, `rewritePackageJson` loads the template's `package.json`, sets `name` to `basename(destination)`, and — if the manifest declares a `rune` dependency — rewrites that dependency's spec via `engineDependencySpec`:

- If the destination sits inside the monorepo (under `packages/` or `examples/`), the spec becomes `workspace:*`, making the new project a real workspace member.
- Otherwise the spec becomes `file:<enginePackageRoot>`, pointing at the local engine checkout. (`rune` is not on npm yet; this will switch to a version range once it is.)

On success the command prints a one-line confirmation and a next-steps block (`cd <name>`, `bun install`, `bunx rune dev`).

## Examples

```sh
# Scaffold a project from the default "starter" template
rune new my-game

# Scaffold from a different template
rune new roguelike --template roguelike
```

## See also

- [rune dev](dev.md) — run the scaffolded project from source.
- [rune add](add.md) — generate entities and scenes inside the new project.
- [Getting started](../getting-started.md) — the end-to-end scaffold/run flow.
