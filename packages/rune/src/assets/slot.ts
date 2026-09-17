/**
 * Slots: schema-driven parsers that turn raw YAML into typed asset fields.
 *
 * A {@link Slot} knows how to parse one field of an asset's schema. The pack
 * loader calls `slot.parse(raw, ctx)` for each declared field; the slot returns
 * the typed value (a sprite, an animation, a {@link Ref}, raw data, …). This
 * module exports the slot constructors used by asset subclasses.
 *
 * @module
 */

import type { AnimatedSprite } from "@/draw/animatedSprite"
import type { PixelSprite } from "@/draw/pixelSprite"
import type { Sprite } from "@/draw/sprite"
import type { Asset } from "./asset"
import { PixelSpriteAsset } from "./pixelSprite"
import { Ref } from "./ref"
import { TerminalSpriteAsset } from "./sprite"
import type { PixelSpriteAssetData, TerminalSpriteAssetData } from "./types"

/** Context passed to {@link Slot.parse}, identifying the field being parsed. */
export interface ParseContext {
  /** Field key being parsed. */
  fieldKey: string
  /** Name of the asset being parsed. */
  assetName: string
  /** Absolute path of the asset's source file. */
  assetPath: string
}

/** A parser for one field of an asset's schema. */
export interface Slot<T> {
  /**
   * Parse the raw YAML for this field into a typed value.
   *
   * @param raw - The raw YAML for the whole asset.
   * @param ctx - Field/asset context.
   * @returns The parsed value.
   */
  parse(raw: any, ctx: ParseContext): T
}

/** Slot that parses a standalone {@link PixelSprite} from inline pixel-sprite data. */
export const pixelSprite: Slot<PixelSprite> = {
  parse(raw, ctx) {
    const asset = PixelSpriteAsset.fromData(raw as PixelSpriteAssetData, {
      name: ctx.assetName,
      path: ctx.assetPath,
    })
    if (!asset.isStandalone) {
      throw new Error(`pixelSprite slot '${ctx.fieldKey}' on asset '${ctx.assetName}': YAML has no standalone sprite`)
    }
    return asset.standalone
  },
}

/**
 * Build a slot that parses a pixel-sprite animation from inline data.
 *
 * @param opts - Optional `initial` clip name.
 * @returns A slot producing an {@link AnimatedSprite} of {@link PixelSprite}.
 */
export function pixelSpriteAnimation(opts?: { initial?: string }): Slot<AnimatedSprite<PixelSprite>> {
  return {
    parse(raw, ctx) {
      const asset = PixelSpriteAsset.fromData(raw as PixelSpriteAssetData, {
        name: ctx.assetName,
        path: ctx.assetPath,
      })
      if (!asset.isAnimated) {
        throw new Error(`pixelSpriteAnimation slot '${ctx.fieldKey}' on asset '${ctx.assetName}': YAML has no clips`)
      }
      return asset.createAnimation(opts?.initial)
    },
  }
}

/** Slot that parses a standalone terminal {@link Sprite} from inline terminal-sprite data. */
export const terminalSprite: Slot<Sprite> = {
  parse(raw, ctx) {
    const asset = TerminalSpriteAsset.fromData(raw as TerminalSpriteAssetData, {
      name: ctx.assetName,
      path: ctx.assetPath,
    })
    if (!asset.isStandalone) {
      throw new Error(
        `terminalSprite slot '${ctx.fieldKey}' on asset '${ctx.assetName}': YAML has no standalone sprite`,
      )
    }
    return asset.standalone
  },
}

/**
 * Build a slot that parses a terminal-sprite animation from inline data.
 *
 * @param opts - Optional `initial` clip name.
 * @returns A slot producing an {@link AnimatedSprite} of {@link Sprite}.
 */
export function terminalSpriteAnimation(opts?: { initial?: string }): Slot<AnimatedSprite<Sprite>> {
  return {
    parse(raw, ctx) {
      const asset = TerminalSpriteAsset.fromData(raw as TerminalSpriteAssetData, {
        name: ctx.assetName,
        path: ctx.assetPath,
      })
      if (!asset.isAnimated) {
        throw new Error(`terminalSpriteAnimation slot '${ctx.fieldKey}' on asset '${ctx.assetName}': YAML has no clips`)
      }
      return asset.createAnimation(opts?.initial)
    },
  }
}

/**
 * Build a slot that returns raw data, optionally projected through `pick`.
 *
 * @param pick - Optional projection from raw YAML to `T`.
 * @returns A slot returning the raw value (or its projection).
 */
export function data<T>(pick?: (raw: any) => T): Slot<T> {
  return {
    parse(raw) {
      return pick ? pick(raw) : (raw as T)
    },
  }
}

/**
 * Build a slot that parses a {@link Ref} to another asset by name.
 *
 * @returns A slot producing a {@link Ref} of `T`.
 */
export function ref<T extends Asset = Asset>(): Slot<Ref<T>> {
  return {
    parse(raw, ctx) {
      const value = raw[ctx.fieldKey]
      if (typeof value !== "string") {
        throw new Error(
          `ref slot '${ctx.fieldKey}' on asset '${ctx.assetName}': expected a string name, got ${typeof value}`,
        )
      }
      return new Ref<T>(value)
    },
  }
}
