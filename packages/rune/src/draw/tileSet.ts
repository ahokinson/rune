/**
 * Tile rendering legend: maps cell values to sprites (fixed, animated, or
 * neighbour-aware) and tracks which cells are solid. See {@link TileSet}.
 *
 * @module
 */

import type { TileMap } from "@/world/tileMap"
import { AnimatedSprite } from "./animatedSprite"
import type { Color } from "./color"
import { Sprite } from "./sprite"

/**
 * Passed to a neighbour-aware appearance so it can vary a tile by what surrounds
 * it (a pipe rim only where the tile above is open, ground edges, autotiling).
 */
export interface TileContext<TCell> {
  /** The tile map the cell lives in. */
  tileMap: TileMap<TCell>
  /** Column index of the cell. */
  column: number
  /** Row index of the cell. */
  row: number
}

/**
 * What a cell looks like: a fixed sprite, an animated sprite the tile set keeps
 * ticking, or a function that chooses a sprite from its surroundings.
 */
export type TileAppearance<TCell> = Sprite | AnimatedSprite<Sprite> | ((context: TileContext<TCell>) => Sprite)

/** How a cell value is rendered and whether it blocks movement. */
export interface TileDefinition<TCell> {
  /** The sprite, animated sprite, or appearance function for the cell. */
  appearance: TileAppearance<TCell>
  /**
   * Whether the tile blocks movement. Read by collision queries
   * (TileLayer.collidersNear) — `undefined` counts as passable.
   */
  solid?: boolean
}

/**
 * A legend for rendering: it maps each cell value to how that cell is drawn (and
 * whether it is solid). One animated appearance instance is shared by every cell
 * of that type, so e.g. all coin tiles spin in sync, advanced once per frame by
 * `update`.
 *
 * @example
 * ```ts
 * const tiles = new TileSet<string>()
 *   .define("#", { appearance: fillTile(2, "#", Color.GRAY), solid: true })
 *   .define(".", { appearance: fillTile(2, ".", Color.BLACK) })
 * tiles.appearanceFor("#", context)  // -> the wall sprite
 * ```
 */
export class TileSet<TCell> {
  private readonly definitions = new Map<TCell, TileDefinition<TCell>>()
  private readonly animated: AnimatedSprite<Sprite>[] = []

  /**
   * Register how `cell` is drawn and whether it is solid.
   *
   * @param cell - Cell value to define.
   * @param definition - Appearance and solidity.
   * @returns `this` for chaining.
   */
  define(cell: TCell, definition: TileDefinition<TCell>): this {
    this.definitions.set(cell, definition)
    if (definition.appearance instanceof AnimatedSprite) this.animated.push(definition.appearance)
    return this
  }

  /**
   * Whether `cell` has a definition.
   *
   * @param cell - Cell value.
   * @returns `true` if the cell is defined.
   */
  has(cell: TCell): boolean {
    return this.definitions.has(cell)
  }

  /**
   * Whether `cell` blocks movement. `undefined`/unknown cells are passable.
   *
   * @param cell - Cell value (may be `undefined` for empty/out-of-bounds).
   * @returns `true` if the cell is solid.
   */
  isSolid(cell: TCell | undefined): boolean {
    if (cell === undefined) return false
    return this.definitions.get(cell)?.solid ?? false
  }

  /**
   * The sprite to draw for `cell` right now, or null if the cell has no
   * appearance (blank/undecorated cells are simply skipped).
   *
   * @param cell - Cell value.
   * @param context - Surrounding context for neighbour-aware appearances.
   * @returns The current sprite, or `null` if undefined.
   */
  appearanceFor(cell: TCell, context: TileContext<TCell>): Sprite | null {
    const definition = this.definitions.get(cell)
    if (!definition) return null
    const appearance = definition.appearance
    if (appearance instanceof Sprite) return appearance
    if (appearance instanceof AnimatedSprite) return appearance.currentFrame()
    return appearance(context)
  }

  /**
   * Advance every animated appearance. TileLayer calls this each update.
   *
   * @param deltaMilliseconds - Time to advance in milliseconds.
   */
  update(deltaMilliseconds: number): void {
    for (const sprite of this.animated) sprite.update(deltaMilliseconds)
  }
}

/**
 * Build a solid `size`×`size` sprite filled with one character/colour — the tile
 * equivalent of a painted block, instead of hand-setting every cell.
 *
 * @param size - Edge length in cells.
 * @param character - Glyph to fill with.
 * @param color - Glyph colour.
 * @returns A new {@link Sprite}.
 */
export function fillTile(size: number, character: string, color: Color): Sprite {
  const sprite = new Sprite(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) sprite.setCell(x, y, character, color)
  }
  return sprite
}

/**
 * Wrap a list of frames into an animated tile appearance.
 *
 * @param frames - Frames to cycle through.
 * @param frameDuration - Milliseconds each frame is held.
 * @param loop - Whether to wrap after the last frame (default true).
 * @returns An {@link AnimatedSprite} playing the frames as a single clip.
 */
export function animatedTile(frames: Sprite[], frameDuration: number, loop = true): AnimatedSprite<Sprite> {
  return new AnimatedSprite<Sprite>({ clips: { tile: { frames, frameDuration, loop } }, initial: "tile" })
}
