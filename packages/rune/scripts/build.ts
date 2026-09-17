import { rm } from "node:fs/promises"

// `bun build` (CLI) doesn't pick up bunfig's preload, so SolidJS's JSX
// transform (needed for src/**.tsx and cli/**.tsx) has to be wired in
// explicitly via @opentui/solid's bun-plugin — same reason `rune build` does
// this for game projects (see cli/commands/build.ts).
const solidPlugin = (await import("@opentui/solid/bun-plugin")).default

await rm("dist", { recursive: true, force: true })

const external = ["solid-js", "@opentui/core", "@opentui/solid"]

const results = await Promise.all([
  Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: "dist",
    target: "bun",
    format: "esm",
    plugins: [solidPlugin],
    external,
    naming: "index.js",
  }),
  Bun.build({
    entrypoints: ["cli/index.ts"],
    outdir: "dist",
    target: "bun",
    format: "esm",
    plugins: [solidPlugin],
    external,
    naming: "cli.js",
  }),
])

let failed = false
for (const result of results) {
  if (!result.success) {
    failed = true
    for (const log of result.logs) console.error(log)
  }
}
if (failed) process.exit(1)
