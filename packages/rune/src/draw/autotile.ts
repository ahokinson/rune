/**
 * Autotiling helpers: pick a tile's sprite from which of its neighbours belong
 * to the same group, so one logical cell value renders the right edge/corner
 * piece (grass borders, pipe joints, cave walls). The 4-bit edge mask covers
 * the common 16-tile "blob" set; pass `same` to define what counts as a
 * matching neighbour.
 *
 * Edge bit layout (4-bit): North=1, East=2, South=4, West=8. A full 16-entry
 * sprite table indexed by this mask is the standard Wang edge tileset.
 *
 * @module
 */

import type { Sprite } from "./sprite"
import type { TileAppearance, TileContext } from "./tileSet"

/** Edge bits composing the 4-bit neighbour mask: North=1, East=2, South=4, West=8. */
export enum EdgeBit {
  North = 1,
  East = 2,
  South = 4,
  West = 8,
}

/**
 * Compute the 4-bit edge mask for the context cell: a bit is set when the
 * neighbour on that side satisfies `same`. Out-of-bounds neighbours are treated
 * as matching by default (so a tile at the map edge reads as continuing off-map)
 * — pass `edgesMatch: false` to instead treat the void as a non-match.
 *
 * @param context - The cell to compute the mask for.
 * @param same - Predicate deciding whether a neighbour belongs to the same group.
 * @param edgesMatch - Whether out-of-bounds neighbours count as matching (default true).
 * @returns The packed edge mask (bitwise OR of {@link EdgeBit} values).
 */
export function edgeMask<TCell>(
  context: TileContext<TCell>,
  same: (cell: TCell | undefined) => boolean,
  edgesMatch = true,
): number {
  const { tileMap, column, row } = context
  const test = (cx: number, cy: number): boolean => {
    if (!tileMap.inBounds(cx, cy)) return edgesMatch
    return same(tileMap.get(cx, cy))
  }
  let mask = 0
  if (test(column, row - 1)) mask |= EdgeBit.North
  if (test(column + 1, row)) mask |= EdgeBit.East
  if (test(column, row + 1)) mask |= EdgeBit.South
  if (test(column - 1, row)) mask |= EdgeBit.West
  return mask
}

/**
 * Build a neighbour-aware {@link TileAppearance} from a 16-entry sprite table
 * indexed by the edge mask. Drop the result straight into
 * `TileSet.define({ appearance })`.
 *
 * @param tiles - 16 sprites indexed by the 4-bit edge mask.
 * @param same - Predicate deciding whether a neighbour belongs to the same group.
 * @param edgesMatch - Whether out-of-bounds neighbours count as matching (default true).
 * @returns A function that picks a sprite from the surrounding cells.
 */
export function autoTile<TCell>(
  tiles: ReadonlyArray<Sprite>,
  same: (cell: TCell | undefined) => boolean,
  edgesMatch = true,
): TileAppearance<TCell> {
  if (tiles.length < 16) throw new Error("autoTile expects a 16-entry sprite table indexed by the 4-bit edge mask")
  return (context: TileContext<TCell>): Sprite => tiles[edgeMask(context, same, edgesMatch)]!
}
