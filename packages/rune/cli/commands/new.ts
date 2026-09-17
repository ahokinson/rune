import { access } from "node:fs/promises"
import { basename, resolve } from "node:path"
import { copyTemplate, engineDependencySpec, listTemplates } from "../templates"

interface NewOptions {
  template: string
}

// `rune new <name> [--template <t>]` — scaffold a standalone game project from a
// template, then wire its dependency on the engine to whatever resolves locally.
export async function runNew(positionals: string[], flags: Map<string, string>): Promise<number> {
  const name = positionals[0]
  if (!name) {
    console.error("usage: rune new <name> [--template <template>]")
    return 1
  }

  const options: NewOptions = { template: flags.get("template") ?? "starter" }
  const templates = await listTemplates()
  if (!templates.includes(options.template)) {
    console.error(`unknown template "${options.template}". available: ${templates.join(", ")}`)
    return 1
  }

  const destination = resolve(process.cwd(), name)
  if (await exists(destination)) {
    console.error(`refusing to overwrite existing path: ${destination}`)
    return 1
  }

  await copyTemplate(options.template, destination)
  await rewritePackageJson(destination)

  const display = basename(destination)
  console.log(`created ${display}/ from the "${options.template}" template`)
  console.log("\nnext steps:")
  console.log(`  cd ${name}`)
  console.log("  bun install")
  console.log("  bunx rune dev")
  return 0
}

async function rewritePackageJson(destination: string): Promise<void> {
  const path = resolve(destination, "package.json")
  const manifest = (await Bun.file(path).json()) as Record<string, unknown>
  manifest.name = basename(destination)
  const dependencies = manifest.dependencies as Record<string, string> | undefined
  if (dependencies && "@ahokinson/rune" in dependencies) {
    dependencies["@ahokinson/rune"] = await engineDependencySpec(destination)
  }
  await Bun.write(path, `${JSON.stringify(manifest, null, 2)}\n`)
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
