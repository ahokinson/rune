import { describe, expect, it } from "bun:test"
import { Camera } from "@/draw/camera"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { Sprite } from "@/draw/sprite"
import { TileSet } from "@/draw/tileSet"
import { Rectangle } from "@/math/rectangle"
import { Vector2 } from "@/math/vector2"
import { TileLayer } from "@/scene/tileLayer"
import { TileMap } from "@/world/tileMap"

function groundSprite(): Sprite {
  const sprite = new Sprite(1, 1)
  sprite.setCell(0, 0, "X", Color.WHITE)
  return sprite
}

function makeLayer(): TileLayer<string> {
  const tileMap = new TileMap<string>(4, 4, "empty")
  tileMap.set(1, 2, "ground")
  const tileSet = new TileSet<string>().define("ground", { appearance: groundSprite(), solid: true })
  return new TileLayer<string>({ tileMap, tileSet, tileSize: 1 })
}

describe("TileLayer", () => {
  it("draws defined cells and skips the rest, culled to the view", () => {
    const layer = makeLayer()
    const canvas = new InMemoryCanvas(4, 4)
    const camera = new Camera(new Vector2(0, 0))
    layer.draw(canvas, camera)
    expect(canvas.cellAt(1, 2)?.character).toBe("X")
    // An empty cell stays blank.
    expect(canvas.cellAt(0, 0)?.character).toBe(" ")
  })

  it("lifts a bumped tile and settles it back", () => {
    const layer = makeLayer()
    const camera = new Camera(new Vector2(0, 0))

    layer.bump(1, 2)
    layer.update(160) // quadraticOut yoyo reaches peak at the half-cycle
    const lifted = new InMemoryCanvas(4, 4)
    layer.draw(lifted, camera)
    expect(lifted.cellAt(1, 1)?.character).toBe("X") // moved up one row
    expect(lifted.cellAt(1, 2)?.character).toBe(" ")

    layer.update(160) // back down and complete
    const settled = new InMemoryCanvas(4, 4)
    layer.draw(settled, camera)
    expect(settled.cellAt(1, 2)?.character).toBe("X")
  })

  it("reports solid tiles near a box", () => {
    const layer = makeLayer()
    const near = layer.collidersNear(new Rectangle(1, 2, 1, 1), 0.1)
    expect(near).toHaveLength(1)
    expect(near[0]).toMatchObject({ x: 1, y: 2, width: 1, height: 1 })
    const far = layer.collidersNear(new Rectangle(3, 3, 0.5, 0.5), 0.1)
    expect(far).toHaveLength(0)
  })
})
