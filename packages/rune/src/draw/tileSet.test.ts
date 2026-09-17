import { describe, expect, it } from "bun:test"
import { Color } from "@/draw/color"
import { Sprite } from "@/draw/sprite"
import { animatedTile, fillTile, TileSet } from "@/draw/tileSet"
import { TileMap } from "@/world/tileMap"

function sprite(character: string): Sprite {
  const result = new Sprite(1, 1)
  result.setCell(0, 0, character, Color.WHITE)
  return result
}

describe("fillTile", () => {
  it("fills every cell with the character and colour", () => {
    const tile = fillTile(3, "█", Color.RED)
    expect(tile.width).toBe(3)
    expect(tile.height).toBe(3)
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        expect(tile.cellAt(x, y)?.character).toBe("█")
      }
    }
  })
})

describe("TileSet", () => {
  it("resolves a static sprite", () => {
    const ground = sprite("X")
    const tileSet = new TileSet<string>().define("ground", { appearance: ground, solid: true })
    const context = { tileMap: new TileMap<string>(1, 1, "ground"), column: 0, row: 0 }
    expect(tileSet.appearanceFor("ground", context)).toBe(ground)
    expect(tileSet.isSolid("ground")).toBe(true)
    expect(tileSet.isSolid("empty")).toBe(false)
    expect(tileSet.isSolid(undefined)).toBe(false)
    expect(tileSet.appearanceFor("empty", context)).toBeNull()
  })

  it("advances animated tiles on update", () => {
    const animation = animatedTile([sprite("a"), sprite("b")], 100, true)
    const tileSet = new TileSet<string>().define("coin", { appearance: animation })
    const context = { tileMap: new TileMap<string>(1, 1, "coin"), column: 0, row: 0 }
    expect(tileSet.appearanceFor("coin", context)?.cellAt(0, 0)?.character).toBe("a")
    tileSet.update(100)
    expect(tileSet.appearanceFor("coin", context)?.cellAt(0, 0)?.character).toBe("b")
  })

  it("chooses neighbour-aware appearances from context", () => {
    const tileMap = new TileMap<string>(1, 2, "pipe")
    const capped = sprite("T")
    const body = sprite("|")
    const tileSet = new TileSet<string>().define("pipe", {
      appearance: (context) => (context.row === 0 ? capped : body),
      solid: true,
    })
    expect(tileSet.appearanceFor("pipe", { tileMap, column: 0, row: 0 })).toBe(capped)
    expect(tileSet.appearanceFor("pipe", { tileMap, column: 0, row: 1 })).toBe(body)
  })
})
