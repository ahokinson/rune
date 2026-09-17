import { relative, resolve } from "node:path"
import { projectName, resolveEntry } from "../project"

// OpenTUI's renderer is a native package selected at runtime via per-platform
// dynamic imports. Only the current platform's package is installed, so the
// others must be external — otherwise the bundler fails resolving, say, the
// win32 package on macOS. The current platform's package stays bundled so
// `--compile` embeds its native library into the binary (loaded from bunfs).
const OPENTUI_PLATFORM_PACKAGES = [
  "@opentui/core-linux-x64",
  "@opentui/core-linux-x64-musl",
  "@opentui/core-linux-arm64",
  "@opentui/core-linux-arm64-musl",
  "@opentui/core-darwin-x64",
  "@opentui/core-darwin-arm64",
  "@opentui/core-win32-x64",
  "@opentui/core-win32-arm64",
]

function otherPlatformPackages(): string[] {
  const current = `@opentui/core-${process.platform}-${process.arch}`
  return OPENTUI_PLATFORM_PACKAGES.filter((name) => name !== current)
}

// `rune build` — produce a shippable artifact. Default compiles a standalone
// binary with the current platform's native renderer embedded; `--bundle` emits a
// lighter dist/main.js that runs with `bun` against node_modules. SolidJS needs
// its JSX transform at build time, which `bun build` (CLI) does NOT pick up from
// bunfig's preload — so we run Bun.build with @opentui/solid's plugin explicitly.
export async function runBuild(flags: Map<string, string>): Promise<number> {
  const entry = await resolveEntry()
  if (!entry) {
    console.error("no entry file found (looked for main.tsx / main.ts). run from a rune project root.")
    return 1
  }

  const solidPlugin = (await import("@opentui/solid/bun-plugin")).default
  const bundle = flags.has("bundle")
  const outDirectory = resolve(process.cwd(), "dist")

  console.error(`▸ rune build: ${bundle ? "bundle → dist/" : "standalone binary"}`)
  const result = await Bun.build({
    entrypoints: [entry],
    target: "bun",
    plugins: [solidPlugin],
    external: bundle ? ["@opentui/*"] : otherPlatformPackages(),
    // Compile out the live inspection server: this folds the engine's
    // `process.env.RUNE_COMPILED !== "1"` guard to a constant, so the
    // InspectionServer is dead-code-eliminated and a shipped game has no
    // inspection ability. (Running from source via `rune dev` never sets this.)
    define: { "process.env.RUNE_COMPILED": JSON.stringify("1") },
    ...(bundle ? { outdir: outDirectory } : { compile: { outfile: flags.get("outfile") ?? (await projectName()) } }),
  })

  if (!result.success) {
    for (const log of result.logs) console.error(log)
    console.error("build failed. run from source with `rune dev`, or try `rune build --bundle`.")
    return 1
  }

  if (bundle) {
    const target = `${relative(process.cwd(), outDirectory)}/main.js`
    console.error(`✓ built ${target} — run it with: bun ${target}`)
  } else {
    // The binary reads a bunfig.toml from its working directory at startup, so a
    // dev project's `preload` would shadow it; it runs cleanly anywhere else.
    console.error("✓ built standalone binary — distribute and run it outside this project tree.")
  }
  return 0
}
