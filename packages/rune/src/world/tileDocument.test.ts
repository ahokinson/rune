import { describe, expect, it } from "bun:test"
import { buildTileMap, TileAnchor, type TileMapDocument } from "@/world/tileDocument"

interface CellSpec {
  kind: string
  solid: boolean
}

const DOCUMENT: TileMapDocument<CellSpec, string> = {
  tileSize: 3,
  legend: {
    X: { kind: "ground", solid: true },
    B: { kind: "brick", solid: true },
  },
  markers: {
    S: "player",
    g: "enemy",
  },
  layout: ["XBX", "S g", "XXX"].join("\n"),
}

describe("buildTileMap", () => {
  it("maps legend symbols to cells and fills the rest with the fallback", () => {
    const data = buildTileMap<string, CellSpec, string>(DOCUMENT, {
      cell: (spec) => spec.kind,
      fallback: "empty",
    })
    expect(data.width).toBe(3)
    expect(data.height).toBe(3)
    expect(data.tileMap.get(0, 0)).toBe("ground")
    expect(data.tileMap.get(1, 0)).toBe("brick")
    // Marker tiles and blanks fall back to empty floor.
    expect(data.tileMap.get(0, 1)).toBe("empty")
    expect(data.tileMap.get(1, 1)).toBe("empty")
  })

  it("extracts markers with their specs and tile coordinates", () => {
    const data = buildTileMap<string, CellSpec, string>(DOCUMENT, {
      cell: (spec) => spec.kind,
      fallback: "empty",
    })
    const symbols = data.markers.map((marker) => marker.symbol).sort()
    expect(symbols).toEqual(["S", "g"])
    const player = data.markers.find((marker) => marker.symbol === "S")!
    expect(player.spec).toBe("player")
    expect(player.column).toBe(0)
    expect(player.row).toBe(1)
  })

  it("anchors marker world positions by tile size", () => {
    const center = buildTileMap<string, CellSpec, string>(DOCUMENT, {
      cell: (spec) => spec.kind,
      fallback: "empty",
      anchor: TileAnchor.Center,
    })
    const foot = buildTileMap<string, CellSpec, string>(DOCUMENT, {
      cell: (spec) => spec.kind,
      fallback: "empty",
      anchor: TileAnchor.Foot,
    })
    const corner = buildTileMap<string, CellSpec, string>(DOCUMENT, {
      cell: (spec) => spec.kind,
      fallback: "empty",
      anchor: TileAnchor.Corner,
    })
    const playerOf = (data: typeof center) => data.markers.find((marker) => marker.symbol === "S")!
    // tile (0,1), tileSize 3.
    expect(playerOf(center).position.x).toBe(1.5)
    expect(playerOf(center).position.y).toBe(4.5)
    expect(playerOf(foot).position.x).toBe(1.5)
    expect(playerOf(foot).position.y).toBe(6)
    expect(playerOf(corner).position.x).toBe(0)
    expect(playerOf(corner).position.y).toBe(3)
  })

  it("defaults tile size to one", () => {
    const data = buildTileMap<string, CellSpec, string>(
      { legend: { X: { kind: "ground", solid: true } }, layout: "X" },
      { cell: (spec) => spec.kind, fallback: "empty" },
    )
    expect(data.tileSize).toBe(1)
  })
})
