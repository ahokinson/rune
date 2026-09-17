#!/usr/bin/env bun
import { join } from "node:path"
import { runAdd } from "./commands/add"
import { runBuild } from "./commands/build"
import { runDev } from "./commands/dev"
import { runInspect } from "./commands/inspect"
import { runNew } from "./commands/new"
import { runPreview } from "./commands/preview"
import { enginePackageRoot } from "./templates"

const HELP = `rune — TUI game engine toolchain

usage:
  rune new <name> [--template <t>]   scaffold a new game project
  rune add <entity|scene> <Name>     generate a game file in the current project
  rune dev [--no-watch] [--no-inspect]  run the game from source (watches by default)
  rune preview                       inspect a game's files/assets without running it
  rune inspect [--socket <path>]     attach to a running game and inspect live state
  rune build [--bundle] [--outfile]  build a standalone binary (or --bundle to dist/)

  rune --help                        show this help
  rune --version                     show the engine version
`

interface ParsedArgs {
  command: string | undefined
  positionals: string[]
  flags: Map<string, string>
}

function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = []
  const flags = new Map<string, string>()
  let command: string | undefined

  for (let index = 0; index < argv.length; index++) {
    const token = argv[index] as string
    if (token.startsWith("--")) {
      const body = token.slice(2)
      const equals = body.indexOf("=")
      if (equals >= 0) {
        flags.set(body.slice(0, equals), body.slice(equals + 1))
      } else {
        const next = argv[index + 1]
        if (next !== undefined && !next.startsWith("-")) {
          flags.set(body, next)
          index++
        } else {
          flags.set(body, "")
        }
      }
    } else if (command === undefined) {
      command = token
    } else {
      positionals.push(token)
    }
  }

  return { command, positionals, flags }
}

async function version(): Promise<string> {
  const manifest = (await Bun.file(join(enginePackageRoot, "package.json")).json()) as { version?: string }
  return manifest.version ?? "0.0.0"
}

async function main(): Promise<number> {
  const { command, positionals, flags } = parseArgs(process.argv.slice(2))

  if (flags.has("version") && command === undefined) {
    console.log(await version())
    return 0
  }
  if (command === undefined || command === "help" || flags.has("help")) {
    console.log(HELP)
    return command === undefined && !flags.has("help") ? 1 : 0
  }

  switch (command) {
    case "new":
      return await runNew(positionals, flags)
    case "add":
      return await runAdd(positionals)
    case "dev":
      return await runDev(flags)
    case "preview":
      return await runPreview()
    case "inspect":
      return await runInspect(flags)
    case "build":
      return await runBuild(flags)
    default:
      console.error(`unknown command "${command}"\n`)
      console.log(HELP)
      return 1
  }
}

process.exit(await main())
