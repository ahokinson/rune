/**
 * PixelSprite asset: authored ASCII-art sprites resolved against pixel legends.
 *
 * A {@link PixelSpriteAsset} bundles an optional standalone sprite plus a set of
 * named animation clips, all parsed from {@link PixelSpriteAssetData}. Use the
 * standalone accessors for static sprites or {@link PixelSpriteAsset.createAnimation}
 * for clips.
 *
 * @module
 */

import type { AnimationClip } from "@/draw/animatedSprite"
import { AnimatedSprite } from "@/draw/animatedSprite"
import type { Color } from "@/draw/color"
import { PixelSprite } from "@/draw/pixelSprite"
import type { AssetOptions } from "./asset"
import { Asset } from "./asset"
import { resolvePixelLegends } from "./color"
import { loadYamlSync } from "./load"
import type { PixelSpriteAssetData, PixelSpriteFrameData } from "./types"

/**
 * Asset wrapping one or more pixel sprites (a standalone sprite and/or a set of
 * animation clips) resolved against named pixel legends.
 */
export class PixelSpriteAsset extends Asset {
  private readonly legends: Map<string, Record<string, Color | null>>
  private readonly clips: Map<string, AnimationClip<PixelSprite>>
  private readonly _standalone: PixelSprite | null

  private constructor(
    options: AssetOptions,
    legends: Map<string, Record<string, Color | null>>,
    clips: Map<string, AnimationClip<PixelSprite>>,
    standalone: PixelSprite | null,
  ) {
    super(options)
    this.legends = legends
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
   * @returns The standalone {@link PixelSprite}.
   */
  get standalone(): PixelSprite {
    if (!this._standalone) {
      throw new Error(`PixelSpriteAsset "${this.name}" has no standalone sprite`)
    }
    return this._standalone
  }

  /**
   * Look up a clip by name.
   *
   * @param name - Clip name.
   * @returns The clip, or `undefined` if not found.
   */
  getClip(name: string): AnimationClip<PixelSprite> | undefined {
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
  createAnimation(initial?: string): AnimatedSprite<PixelSprite> {
    if (this.clips.size === 0) {
      throw new Error(`PixelSpriteAsset "${this.name}" has no animation clips`)
    }
    const clips: Record<string, AnimationClip<PixelSprite>> = {}
    for (const [name, clip] of this.clips) {
      clips[name] = clip
    }
    const firstKey = this.clips.keys().next()
    const start = initial ?? (firstKey.done ? "" : firstKey.value)
    return new AnimatedSprite({ clips, initial: start })
  }

  /**
   * Build a {@link PixelSpriteAsset} from parsed YAML data.
   *
   * @param data - Authored asset data.
   * @param options - Name and source path.
   * @returns A new {@link PixelSpriteAsset}.
   */
  static fromData(data: PixelSpriteAssetData, options: AssetOptions): PixelSpriteAsset {
    const legends = resolvePixelLegends(data.legends)
    const legendMap = new Map(Object.entries(legends))

    const clips = new Map<string, AnimationClip<PixelSprite>>()
    let standalone: PixelSprite | null = null

    if (data.standalone) {
      const legend = legends[data.standalone.legend]
      if (!legend) {
        throw new Error(`Legend "${data.standalone.legend}" not found in asset "${options.name}"`)
      }
      standalone = PixelSprite.fromString(data.standalone.art, legend)
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

    return new PixelSpriteAsset(options, legendMap, clips, standalone)
  }

  /**
   * Load and build a {@link PixelSpriteAsset} from a YAML file.
   *
   * @param path - Path to the YAML file.
   * @returns A new {@link PixelSpriteAsset}.
   */
  static fromYaml(path: string): PixelSpriteAsset {
    const data = loadYamlSync<PixelSpriteAssetData & { name?: string }>(path)
    const name =
      data.name ??
      path
        .split("/")
        .pop()!
        .replace(/\.\w+$/, "")
    return PixelSpriteAsset.fromData(data, { name, path })
  }
}

function resolveFrame(
  frame: string | PixelSpriteFrameData,
  clipLegend: string | undefined,
  legends: Record<string, Record<string, Color | null>>,
): PixelSprite {
  if (typeof frame === "string") {
    if (!clipLegend) {
      throw new Error("Cannot resolve inline frame without a clip-level legend")
    }
    const legend = legends[clipLegend]
    if (!legend) {
      throw new Error(`Legend "${clipLegend}" not found`)
    }
    return PixelSprite.fromString(frame, legend)
  }
  const legend = legends[frame.legend]
  if (!legend) {
    throw new Error(`Legend "${frame.legend}" not found`)
  }
  return PixelSprite.fromString(frame.art, legend)
}

/**
 * Parse a pixel-art string into a {@link PixelSprite} using a
 * character-to-`Color` legend.
 *
 * @param art - Multi-line ASCII art.
 * @param legend - Character-to-`Color | null` mapping.
 * @returns A new {@link PixelSprite}.
 */
export function parsePixelSprite(art: string, legend: Record<string, Color | null>): PixelSprite {
  return PixelSprite.fromString(art, legend)
}
