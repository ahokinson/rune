/**
 * Raw data shapes for authored asset YAML.
 *
 * Each interface describes one slice of the YAML a game author writes; the
 * asset-system parsers consume these and produce runtime objects. Color and
 * legend shapes are shared across pixel and terminal sprite assets; per-asset
 * shapes are kept distinct so the parser can dispatch on `type`.
 *
 * @module
 */

/** Authored color value: a hex string or an RGB/RGBA byte tuple. */
export type ColorData = [number, number, number] | [number, number, number, number] | string

/**
 * Pixel legend data: a character-to-color map with optional `extends` for
 * inheritance from another named legend. `null` colors mean "no fill".
 */
export type PixelLegendData = Record<string, ColorData | null> & { extends?: string }

/** One entry in a terminal sprite legend: a character with foreground/background colors. */
export interface SpriteLegendEntryData {
  /** Character to use; defaults to the legend key. */
  char?: string
  /** Foreground color. */
  fg: ColorData
  /** Background color (optional). */
  bg?: ColorData
}

/** Terminal legend data: a character-to-legend entry map. */
export type TerminalLegendData = Record<string, SpriteLegendEntryData>

/** A single frame in a pixel-sprite clip, with its own legend reference and art. */
export interface PixelSpriteFrameData {
  /** Name of the legend to resolve this frame's characters against. */
  legend: string
  /** Multi-line ASCII art for this frame. */
  art: string
}

/** A named clip in a pixel-sprite asset. */
export interface PixelSpriteClipData {
  /** Clip-level legend used for inline string frames. */
  legend?: string
  /** Duration of each frame in milliseconds. */
  frameDuration: number
  /** Whether the clip loops. */
  loop: boolean
  /** Frames, as inline art strings or frame objects. */
  frames: (string | PixelSpriteFrameData)[]
}

/** Authored YAML for a `pixelSprite` asset. */
export interface PixelSpriteAssetData {
  /** Asset type discriminator (`"pixelSprite"`). */
  type: "pixelSprite"
  /** Named pixel legends. */
  legends: Record<string, PixelLegendData>
  /** Optional standalone (non-animated) sprite. */
  standalone?: { legend: string; art: string }
  /** Named animation clips. */
  clips?: Record<string, PixelSpriteClipData>
}

/** A single frame in a terminal-sprite clip, with its own legend reference and art. */
export interface TerminalSpriteFrameData {
  /** Name of the legend to resolve this frame's characters against. */
  legend: string
  /** Multi-line ASCII art for this frame. */
  art: string
}

/** A named clip in a terminal-sprite asset. */
export interface TerminalSpriteClipData {
  /** Clip-level legend used for inline string frames. */
  legend?: string
  /** Frames, as inline art strings or frame objects. */
  frames: (string | TerminalSpriteFrameData)[]
  /** Duration of each frame in milliseconds. */
  frameDuration: number
  /** Whether the clip loops. */
  loop: boolean
}

/** Authored YAML for a `terminalSprite` asset. */
export interface TerminalSpriteAssetData {
  /** Asset type discriminator (`"terminalSprite"`). */
  type: "terminalSprite"
  /** Named terminal legends. */
  legends: Record<string, TerminalLegendData>
  /** Optional standalone (non-animated) sprite. */
  standalone?: { legend: string; art: string }
  /** Named animation clips. */
  clips?: Record<string, TerminalSpriteClipData>
}

/** Union of authored sprite asset data (pixel or terminal). */
export type SpriteAssetData = PixelSpriteAssetData | TerminalSpriteAssetData
