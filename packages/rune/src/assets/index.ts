/**
 * Asset system: loading, parsing, and packing authored game resources.
 *
 * An {@link Asset} is a named resource (sprite, tile map, theme, …) loaded from
 * YAML and resolved into a typed runtime object. {@link AssetPack} mounts a
 * directory of assets described by a manifest, parses each through a
 * class-declared schema of {@link Slot}s, and resolves inter-asset {@link Ref}s.
 * This barrel re-exports the public surface.
 *
 * @module
 */

export { parseAnimatedSprite } from "./animatedSprite"
export type { AssetOptions } from "./asset"
export { Asset } from "./asset"
export { parseColor, parsePixelLegend, resolvePixelLegends } from "./color"
export { loadYaml, loadYamlSync } from "./load"
export { PixelSpriteAsset, parsePixelSprite } from "./pixelSprite"
export { parseSprite, parseTerminalLegend, TerminalSpriteAsset } from "./sprite"

export type {
  ColorData,
  PixelLegendData,
  PixelSpriteAssetData,
  PixelSpriteClipData,
  PixelSpriteFrameData,
  SpriteAssetData,
  SpriteLegendEntryData,
  TerminalLegendData,
  TerminalSpriteAssetData,
  TerminalSpriteClipData,
  TerminalSpriteFrameData,
} from "./types"
