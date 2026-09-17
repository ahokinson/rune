/**
 * TerminalSprite asset: authored ASCII sprites resolved against character legends.
 *
 * A {@link TerminalSpriteAsset} bundles an optional standalone sprite plus a set
 * of named animation clips, all parsed from {@link TerminalSpriteAssetData}. Use
 * the standalone accessors for static sprites or
 * {@link TerminalSpriteAsset.createAnimation} for clips.
 *
 * @module
 */

import type { AnimationClip } from "@/draw/animatedSprite"
import { AnimatedSprite } from "@/draw/animatedSprite"
import type { SpriteLegendEntry } from "@/draw/sprite"
import { Sprite } from "@/draw/sprite"
import type { AssetOptions } from "./asset"
import { Asset } from "./asset"
import { parseColor } from "./color"
import { loadYamlSync } from "./load"
import type { TerminalLegendData, TerminalSpriteAssetData, TerminalSpriteFrameData } from "./types"

/**
 * Asset wrapping one or more terminal sprites (a standalone sprite and/or a set
 * of animation clips) resolved against named character legends.
 */
export class TerminalSpriteAsset extends Asset {
  private readonly clips: Map<string, AnimationClip<Sprite>>
  private readonly _standalone: Sprite | null

  private constructor(options: AssetOptions, clips: Map<string, AnimationClip<Sprite>>, standalone: Sprite | null) {
    super(options)
    this.clips = clips
    this._standalone = standalone
  }

  /** Whether this asset has a standalone (non-animated) sprite. */
  get isStandalone(): boolean {
    return this._standalone !== null
  }

  /** Whether this asset has any animation clips. */
  get isAnimated(): boolean {
    return this.clips.size > 0
  }

  /**
   * The standalone sprite.
   *
   * @returns The standalone {@link Sprite}.
   */
  get standalone(): Sprite {
    if (!this._standalone) {
      throw new Error(`TerminalSpriteAsset "${this.name}" has no standalone sprite`)
    }
    return this._standalone
  }

  /**
   * Look up a clip by name.
   *
   * @param name - Clip name.
   * @returns The clip, or `undefined` if not found.
   */
  getClip(name: string): AnimationClip<Sprite> | undefined {
    return this.clips.get(name)
  }

  /**
   * List all clip names.
   *
   * @returns A new array of clip names.
   */
  getClipNames(): string[] {
    return [...this.clips.keys()]
  }

  /**
   * Build a runnable {@link AnimatedSprite} from this asset's clips.
   *
   * @param initial - Optional clip to play first; defaults to the first clip.
   * @returns A new {@link AnimatedSprite}.
   */
  createAnimation(initial?: string): AnimatedSprite<Sprite> {
    if (this.clips.size === 0) {
      throw new Error(`TerminalSpriteAsset "${this.name}" has no animation clips`)
    }
    const clips: Record<string, AnimationClip<Sprite>> = {}
    for (const [name, clip] of this.clips) {
      clips[name] = clip
    }
    const firstKey = this.clips.keys().next()
    const start = initial ?? (firstKey.done ? "" : firstKey.value)
    return new AnimatedSprite({ clips, initial: start })
  }

  /**
   * Build a {@link TerminalSpriteAsset} from parsed YAML data.
   *
   * @param data - Authored asset data.
   * @param options - Name and source path.
   * @returns A new {@link TerminalSpriteAsset}.
   */
  static fromData(data: TerminalSpriteAssetData, options: AssetOptions): TerminalSpriteAsset {
    const legends = resolveTerminalLegends(data)

    const clips = new Map<string, AnimationClip<Sprite>>()
    let standalone: Sprite | null = null

    if (data.standalone) {
      const legend = legends[data.standalone.legend]
      if (!legend) {
        throw new Error(`Legend "${data.standalone.legend}" not found in asset "${options.name}"`)
      }
      standalone = Sprite.fromLegend(data.standalone.art, legend)
    }

    if (data.clips) {
      for (const [name, clipData] of Object.entries(data.clips)) {
        const frames = clipData.frames.map((frame) => resolveFrame(frame, clipData.legend, legends))
        clips.set(name, {
          frames,
          frameDuration: clipData.frameDuration,
          loop: clipData.loop,
        })
      }
    }

    return new TerminalSpriteAsset(options, clips, standalone)
  }

  /**
   * Load and build a {@link TerminalSpriteAsset} from a YAML file.
   *
   * @param path - Path to the YAML file.
   * @returns A new {@link TerminalSpriteAsset}.
   */
  static fromYaml(path: string): TerminalSpriteAsset {
    const data = loadYamlSync<TerminalSpriteAssetData & { name?: string }>(path)
    const name =
      data.name ??
      path
        .split("/")
        .pop()!
        .replace(/\.\w+$/, "")
    return TerminalSpriteAsset.fromData(data, { name, path })
  }
}

function _parseTerminalLegend(data: TerminalLegendData): Record<string, SpriteLegendEntry> {
  const result: Record<string, SpriteLegendEntry> = {}
  for (const [key, entry] of Object.entries(data)) {
    result[key] = {
      character: entry.char ?? key,
      foreground: parseColor(entry.fg),
      background: entry.bg ? parseColor(entry.bg) : undefined,
    }
  }
  return result
}

function resolveTerminalLegends(data: TerminalSpriteAssetData): Record<string, Record<string, SpriteLegendEntry>> {
  const resolved: Record<string, Record<string, SpriteLegendEntry>> = {}
  for (const [name, legendData] of Object.entries(data.legends)) {
    resolved[name] = _parseTerminalLegend(legendData)
  }
  return resolved
}

function resolveFrame(
  frame: string | TerminalSpriteFrameData,
  clipLegend: string | undefined,
  legends: Record<string, Record<string, SpriteLegendEntry>>,
): Sprite {
  if (typeof frame === "string") {
    if (!clipLegend) {
      throw new Error("Cannot resolve inline frame without a clip-level legend")
    }
    const legend = legends[clipLegend]
    if (!legend) {
      throw new Error(`Legend "${clipLegend}" not found`)
    }
    return Sprite.fromLegend(frame, legend)
  }
  const legend = legends[frame.legend]
  if (!legend) {
    throw new Error(`Legend "${frame.legend}" not found`)
  }
  return Sprite.fromLegend(frame.art, legend)
}

/**
 * Parse a terminal legend into a character-to-{@link SpriteLegendEntry} map.
 *
 * @param data - Authored legend data.
 * @returns A flat character-to-legend entry map.
 */
export function parseTerminalLegend(data: TerminalLegendData): Record<string, SpriteLegendEntry> {
  return _parseTerminalLegend(data)
}

/**
 * Parse a terminal-art string into a {@link Sprite} using a character legend.
 *
 * @param art - Multi-line ASCII art.
 * @param legend - Character-to-legend entry mapping.
 * @returns A new {@link Sprite}.
 */
export function parseSprite(art: string, legend: Record<string, SpriteLegendEntry>): Sprite {
  return Sprite.fromLegend(art, legend)
}
