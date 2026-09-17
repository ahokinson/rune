/**
 * TileMap asset: an authored tile map loaded through the asset system.
 *
 * @module
 */

import { type BuildTileMapOptions, buildTileMap, type TileMapData, type TileMapDocument } from "@/world/tileDocument"
import { Asset } from "./asset"
import { data } from "./slot"

/**
 * An authored tile map loaded through the asset system, so maps sit alongside
 * sprites and themes in an AssetPack manifest. The raw document is parsed by the
 * schema; games subclass this and call {@link build} from their own `finalize`
 * to turn the legend into concrete cells and attach any domain extras (light
 * grids, theme refs, door bookkeeping). The standalone `loadTileMap` covers code
 * that does not need a pack.
 */
export class TileMapAsset<TCellSpec = unknown, TMarkerSpec = unknown> extends Asset {
  /** The raw authored tile-map document. */
  declare document: TileMapDocument<TCellSpec, TMarkerSpec>

  /** Schema declaring the `document` field parsed from YAML. */
  static schema = {
    document: data<TileMapDocument>((raw) => raw as TileMapDocument),
  } as const

  /**
   * Build a concrete tile map from this asset's document and a legend resolver.
   *
   * @param options - Cell-building options (legend, markers, …).
   * @returns The built {@link TileMapData}.
   */
  build<TCell>(options: BuildTileMapOptions<TCell, TCellSpec>): TileMapData<TCell, TMarkerSpec> {
    return buildTileMap<TCell, TCellSpec, TMarkerSpec>(this.document, options)
  }
}
