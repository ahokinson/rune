import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Asset } from "@/assets/asset"
import { AssetPack } from "@/assets/pack"
import type { Ref } from "@/assets/ref"
import { data, pixelSprite, pixelSpriteAnimation, ref } from "@/assets/slot"
import type { AnimatedSprite } from "@/draw/animatedSprite"
import type { PixelSprite } from "@/draw/pixelSprite"

interface ThemeData {
  type: "theme"
  name: string
  baseColor: string
}

class ThemeAsset extends Asset {
  declare config: ThemeData
  static schema = {
    config: data<ThemeData>(),
  } as const
}

interface LevelData {
  type: "level"
  name: string
  theme: string
  size: number
}

class LevelAsset extends Asset {
  declare theme: Ref<ThemeAsset>
  declare config: LevelData
  declare resolvedTheme: ThemeAsset
  static schema = {
    theme: ref<ThemeAsset>(),
    config: data<LevelData>(),
  } as const
  static finalize(asset: LevelAsset) {
    asset.resolvedTheme = asset.theme.get()
  }
}

interface ImpData {
  type: "imp"
  name: string
  sightRange: number
}

class ImpAsset extends Asset {
  declare sprite: PixelSprite
  declare config: ImpData
  static schema = {
    sprite: pixelSprite,
    config: data<ImpData>(),
  } as const
}

class ImpAnimAsset extends Asset {
  declare animation: AnimatedSprite<PixelSprite>
  declare config: ImpData
  static schema = {
    animation: pixelSpriteAnimation({ initial: "idle" }),
    config: data<ImpData>(),
  } as const
}

const SPRITE_YAML = `
type: imp
name: imp
sightRange: 7
legends:
  body:
    R: "#ff0000"
    .: null
standalone:
  legend: body
  art: |
    .R.
    RRR
    .R.
`.trim()

const SPRITE_ANIM_YAML = `
type: imp
name: imp
sightRange: 5
legends:
  body:
    R: "#ff0000"
    .: null
clips:
  idle:
    legend: body
    frameDuration: 100
    loop: true
    frames:
      - |
        .R.
        RRR
        .R.
      - |
        RRR
        .R.
        RRR
`.trim()

const THEME_YAML = `
type: theme
name: gateway
baseColor: "#102030"
`.trim()

const LEVEL_YAML = `
type: level
name: first
theme: gateway
size: 16
`.trim()

const LEVEL_BAD_REF_YAML = `
type: level
name: orphan
theme: missing-theme
size: 8
`.trim()

const UNKNOWN_TYPE_YAML = `
type: mystery
name: ufo
`.trim()

let workDir: string

function writePack(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "rune-pack-"))
  for (const [rel, content] of Object.entries(files)) {
    const fullPath = join(dir, rel)
    mkdirSync(join(fullPath, ".."), { recursive: true })
    writeFileSync(fullPath, content)
  }
  return dir
}

describe("AssetPack", () => {
  beforeAll(() => {
    workDir = ""
  })
  afterAll(() => {
    if (workDir) rmSync(workDir, { recursive: true, force: true })
  })

  it("mounts a pack and resolves refs eagerly", () => {
    const dir = writePack({
      "manifest.yaml": "assets:\n  - theme.yaml\n  - level.yaml",
      "theme.yaml": THEME_YAML,
      "level.yaml": LEVEL_YAML,
    })
    const pack = AssetPack.mount(dir, { theme: ThemeAsset, level: LevelAsset })

    expect(pack.size).toBe(2)
    const level = pack.get<LevelAsset>("first")
    expect(level.config.size).toBe(16)
    expect(level.theme.isResolved).toBe(true)
    expect(level.theme.get().config.baseColor).toBe("#102030")
    expect(level.resolvedTheme.config.baseColor).toBe("#102030")
    rmSync(dir, { recursive: true, force: true })
  })

  it("throws a clear error on an unresolved ref", () => {
    const dir = writePack({
      "manifest.yaml": "assets:\n  - theme.yaml\n  - level.yaml",
      "theme.yaml": THEME_YAML,
      "level.yaml": LEVEL_BAD_REF_YAML,
    })
    expect(() => AssetPack.mount(dir, { theme: ThemeAsset, level: LevelAsset })).toThrow(
      /Unresolved Ref\('missing-theme'\) referenced from orphan\.theme/,
    )
    rmSync(dir, { recursive: true, force: true })
  })

  it("throws on unknown asset type", () => {
    const dir = writePack({
      "manifest.yaml": "assets:\n  - mystery.yaml",
      "mystery.yaml": UNKNOWN_TYPE_YAML,
    })
    expect(() => AssetPack.mount(dir, { theme: ThemeAsset })).toThrow(/Unknown asset type 'mystery'/)
    rmSync(dir, { recursive: true, force: true })
  })

  it("round-trips a standalone pixelSprite slot alongside data", () => {
    const dir = writePack({
      "manifest.yaml": "assets:\n  - imp.yaml",
      "imp.yaml": SPRITE_YAML,
    })
    const pack = AssetPack.mount(dir, { imp: ImpAsset })
    const imp = pack.get<ImpAsset>("imp")
    expect(imp.config.sightRange).toBe(7)
    expect(imp.sprite).toBeDefined()
    expect(imp.sprite.height).toBe(3)
    expect(imp.sprite.width).toBe(3)
    rmSync(dir, { recursive: true, force: true })
  })

  it("round-trips an animated pixelSprite slot", () => {
    const dir = writePack({
      "manifest.yaml": "assets:\n  - imp.yaml",
      "imp.yaml": SPRITE_ANIM_YAML,
    })
    const pack = AssetPack.mount(dir, { imp: ImpAnimAsset })
    const imp = pack.get<ImpAnimAsset>("imp")
    expect(imp.config.sightRange).toBe(5)
    expect(imp.animation).toBeDefined()
    expect(imp.animation.currentClipName).toBe("idle")
    rmSync(dir, { recursive: true, force: true })
  })
})
