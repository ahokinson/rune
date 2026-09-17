import { access, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"

type Kind = "entity" | "scene"

// `rune add entity <Name>` / `rune add scene <Name>` — generate a new game file
// in the current project following the engine's conventions (extend a primitive,
// single options object, override update/draw).
export async function runAdd(positionals: string[]): Promise<number> {
  const kind = positionals[0] as Kind | undefined
  const name = positionals[1]
  if (kind !== "entity" && kind !== "scene") {
    console.error("usage: rune add <entity|scene> <Name>")
    return 1
  }
  if (!name || !/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
    console.error(`invalid ${kind} name "${name ?? ""}": use PascalCase letters and digits`)
    return 1
  }

  const extension = kind === "entity" ? "ts" : "tsx"
  const path = resolve(process.cwd(), "scene", `${name}.${extension}`)
  if (await exists(path)) {
    console.error(`refusing to overwrite existing file: ${path}`)
    return 1
  }

  await mkdir(dirname(path), { recursive: true })
  await Bun.write(path, kind === "entity" ? entitySource(name) : sceneSource(name))
  console.log(`created scene/${name}.${extension}`)
  return 0
}

function entitySource(name: string): string {
  return `import { type Camera, type CanvasSurface, Color, Entity2D, Vector2 } from "@ahokinson/rune"

export interface ${name}Options {
  position?: Vector2
}

export class ${name} extends Entity2D {
  constructor(options: ${name}Options = {}) {
    super({ position: options.position ?? new Vector2(0, 0), size: new Vector2(1, 1) })
  }

  // Runs every fixed tick. Read input, move, resolve collisions, set state.
  override update(deltaMilliseconds: number): void {
    void deltaMilliseconds
  }

  // Runs every frame. Paint the entity through the scene camera.
  override draw(canvas: CanvasSurface, camera: Camera): void {
    const screen = camera.worldToScreen(this.position)
    canvas.setCell(Math.round(screen.x), Math.round(screen.y), "●", Color.WHITE)
  }
}
`
}

function sceneSource(name: string): string {
  const sceneName = name.charAt(0).toLowerCase() + name.slice(1)
  return `import { Color, Scene, SceneRenderer } from "@ahokinson/rune"
import type { JSX } from "solid-js"

export function ${name}(): JSX.Element {
  return (
    <Scene name="${sceneName}">
      <${name}Inner />
    </Scene>
  )
}

function ${name}Inner(): JSX.Element {
  // Use hooks here, e.g. const scene = useScene(), const controls = useActions(...).
  // Create entities and add them in onMount, remove them in onCleanup.
  return <SceneRenderer clearColor={Color.fromHex("#0f172a")} />
}
`
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
