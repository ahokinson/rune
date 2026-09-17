import { loadYamlSync } from "@/assets/load"
import { Vector2 } from "@/math/vector2"
import { TileMap } from "./tileMap"
import { TileMeta } from "./tileMeta"

/**
 * The authored shape of a tile map: a legend mapping symbols to terrain specs, an
 * optional marker table for spawns/entities that are not terrain, and the ASCII
 * layout itself. Both the cell and marker specs are game-defined raw data (a
 * string union, or a rich record) — the loader stays agnostic and hands them back
 * to the caller's `cell`/marker code untouched.
 *
 * @module
 */

/**
 * Authored YAML/document shape of a tile map.
 *
 * @typeParam TCellSpec - Game-defined terrain spec carried per legend symbol.
 * @typeParam TMarkerSpec - Game-defined spawn spec carried per marker symbol.
 */
export interface TileMapDocument<TCellSpec = unknown, TMarkerSpec = unknown> {
  /** How many world cells one tile spans on a side. Defaults to 1. */
  tileSize?: number
  /** Symbol → terrain spec. A symbol absent here (and present in `markers`, or blank) leaves the grid cell at the fallback value. */
  legend: Record<string, TCellSpec>
  /** Symbol → spawn spec. These symbols are not terrain: the loader emits a TileMarker for each occurrence and leaves the underlying grid cell at the fallback (so a goomba glyph reads as empty floor, not a wall). */
  markers?: Record<string, TMarkerSpec>
  /** The grid. Rows are newline-separated; ragged rows are padded with the fallback cell. */
  layout: string
}

/** How a marker's tile coordinate maps to a world position. */
export enum TileAnchor {
  /** Top-left corner of the tile. */
  Corner = "corner",
  /** Centre of the tile — the usual choice for items and free-standing entities. */
  Center = "center",
  /** Bottom-centre of the tile — where a thing standing on the tile's floor sits. */
  Foot = "foot",
}

/**
 * A scanned-out marker occurrence with its world position.
 *
 * @typeParam TMarkerSpec - Game-defined spawn spec carried per marker symbol.
 */
export interface TileMarker<TMarkerSpec = unknown> {
  /** Legend symbol that produced this marker. */
  symbol: string
  /** Spec from `document.markers` for `symbol`. */
  spec: TMarkerSpec
  /** Tile coordinates in the layout. */
  column: number
  /** Tile coordinates in the layout. */
  row: number
  /** World position, in cells, derived from the tile coordinate, the tile size, and the requested anchor. */
  position: Vector2
}

/**
 * Result of building a tile map from a {@link TileMapDocument}.
 *
 * @typeParam TCell - Grid cell type.
 * @typeParam TMarkerSpec - Game-defined spawn spec carried per marker symbol.
 */
export interface TileMapData<TCell, TMarkerSpec = unknown> {
  /** Terrain grid. */
  tileMap: TileMap<TCell>
  /** Scanned-out markers with world positions. */
  markers: TileMarker<TMarkerSpec>[]
  /** A side-table the caller can populate from the legend/markers (e.g. block payloads). Empty unless `cell`/marker code writes to it via the build hook. */
  meta: TileMeta<unknown>
  /** Tile span of one tile, in cells. */
  tileSize: number
  /** Dimensions in tiles. */
  width: number
  /** Dimensions in tiles. */
  height: number
}

/**
 * Build-time callbacks and overrides for {@link buildTileMap}.
 *
 * @typeParam TCell - Grid cell type.
 * @typeParam TCellSpec - Game-defined terrain spec carried per legend symbol.
 */
export interface BuildTileMapOptions<TCell, TCellSpec = unknown> {
  /** Turn a legend spec into the grid cell stored for that symbol. */
  cell(spec: TCellSpec, symbol: string): TCell
  /** The cell every untouched/blank/marker tile holds. */
  fallback: TCell
  /** World-position anchor for markers. Defaults to {@link TileAnchor.Center}. */
  anchor?: TileAnchor
  /** Override which symbols are treated as markers. Defaults to "every symbol present in `document.markers`". */
  isMarker?(symbol: string): boolean
}

/** World-space offset of a marker for a given anchor and tile size. */
function anchorOffset(anchor: TileAnchor, tileSize: number): Vector2 {
  switch (anchor) {
    case TileAnchor.Corner:
      return new Vector2(0, 0)
    case TileAnchor.Foot:
      return new Vector2(tileSize / 2, tileSize)
    default:
      return new Vector2(tileSize / 2, tileSize / 2)
  }
}

/** Split a layout string into rows, trimming leading/trailing blank lines. */
function splitLayout(layout: string): string[] {
  const lines = layout.replace(/\r\n/g, "\n").split("\n")
  while (lines.length > 0 && lines[0] === "") lines.shift()
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()
  return lines
}

/**
 * Build a tile map from an authored document. The terrain grid comes from
 * `TileMap.fromString` over the legend; marker symbols are scanned out of the
 * same layout into world-positioned TileMarkers. This is the shared core both the
 * standalone loader and `TileMapAsset` delegate to.
 *
 * @typeParam TCell - Grid cell type.
 * @typeParam TCellSpec - Game-defined terrain spec carried per legend symbol.
 * @typeParam TMarkerSpec - Game-defined spawn spec carried per marker symbol.
 * @param document - The authored map shape.
 * @param options - Build callbacks and overrides.
 * @returns The built tile map, markers, meta, and dimensions.
 */
export function buildTileMap<TCell, TCellSpec = unknown, TMarkerSpec = unknown>(
  document: TileMapDocument<TCellSpec, TMarkerSpec>,
  options: BuildTileMapOptions<TCell, TCellSpec>,
): TileMapData<TCell, TMarkerSpec> {
  const tileSize = document.tileSize ?? 1
  const anchor = options.anchor ?? TileAnchor.Center
  const markerSpecs = document.markers ?? {}
  const isMarker = options.isMarker ?? ((symbol: string) => symbol in markerSpecs)

  const mapping: Record<string, TCell> = {}
  for (const [symbol, spec] of Object.entries(document.legend)) {
    mapping[symbol] = options.cell(spec, symbol)
  }

  const tileMap = TileMap.fromString<TCell>(document.layout, mapping, options.fallback)

  const offset = anchorOffset(anchor, tileSize)
  const markers: TileMarker<TMarkerSpec>[] = []
  const lines = splitLayout(document.layout)
  for (let row = 0; row < lines.length; row++) {
    const line = lines[row] ?? ""
    for (let column = 0; column < line.length; column++) {
      const symbol = line[column] as string
      if (symbol === " " || !isMarker(symbol)) continue
      markers.push({
        symbol,
        spec: markerSpecs[symbol] as TMarkerSpec,
        column,
        row,
        position: new Vector2(column * tileSize + offset.x, row * tileSize + offset.y),
      })
    }
  }

  return {
    tileMap,
    markers,
    meta: new TileMeta<unknown>(),
    tileSize,
    width: tileMap.width,
    height: tileMap.height,
  }
}

/**
 * Load and build a tile map from a YAML document on disk.
 *
 * @typeParam TCell - Grid cell type.
 * @typeParam TCellSpec - Game-defined terrain spec carried per legend symbol.
 * @typeParam TMarkerSpec - Game-defined spawn spec carried per marker symbol.
 * @param path - Path to the YAML file.
 * @param options - Build callbacks and overrides.
 * @returns The built tile map, markers, meta, and dimensions.
 */
export function loadTileMap<TCell, TCellSpec = unknown, TMarkerSpec = unknown>(
  path: string,
  options: BuildTileMapOptions<TCell, TCellSpec>,
): TileMapData<TCell, TMarkerSpec> {
  const document = loadYamlSync<TileMapDocument<TCellSpec, TMarkerSpec>>(path)
  return buildTileMap(document, options)
}
