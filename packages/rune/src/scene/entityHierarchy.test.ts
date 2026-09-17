import { describe, expect, it } from "bun:test"
import { AnimatedSprite } from "@/draw/animatedSprite"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { Sprite } from "@/draw/sprite"
import { Vector2 } from "@/math/vector2"
import { AnimatedSpriteEntity } from "@/scene/animatedSpriteEntity"
import { Entity2D } from "@/scene/entity2d"
import { Scene } from "@/scene/scene"
import { SpriteEntity } from "@/scene/spriteEntity"

function solidSprite(character: string): Sprite {
  const sprite = new Sprite(1, 1)
  sprite.setCell(0, 0, character, Color.WHITE)
  return sprite
}

function nonBlankCells(canvas: InMemoryCanvas): number {
  let count = 0
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const cell = canvas.cellAt(x, y)
      if (cell && cell.character !== " ") count++
    }
  }
  return count
}

describe("Entity2D transform hierarchy", () => {
  it("composes a child's world position through translation and scale", () => {
    const parent = new Entity2D({ position: new Vector2(10, 5), scale: new Vector2(2, 2) })
    const child = new Entity2D({ position: new Vector2(2, 3) })
    parent.add(child)

    const world = child.worldPosition
    expect(world.x).toBeCloseTo(14)
    expect(world.y).toBeCloseTo(11)
    expect(child.worldScale.x).toBeCloseTo(2)
    expect(child.parent).toBe(parent)
  })

  it("updates the whole subtree from a single scene tick", () => {
    const scene = new Scene("hierarchy")
    let parentTicks = 0
    let childTicks = 0
    const parent = new (class extends Entity2D {
      override update(): void {
        parentTicks++
      }
    })()
    const child = new (class extends Entity2D {
      override update(): void {
        childTicks++
      }
    })()
    parent.add(child)
    scene.add(parent)

    scene.update(16)
    expect(parentTicks).toBe(1)
    expect(childTicks).toBe(1)
  })

  it("attaches and detaches children with the scene lifecycle", () => {
    const scene = new Scene("hierarchy", { autoPrune: true })
    const parent = new Entity2D()
    const child = new Entity2D()
    parent.add(child)
    scene.add(parent)

    // Both bound to the scene by the recursive attach.
    expect(child.scene).toBe(scene)

    child.markForRemoval()
    scene.update(16)
    expect(child.scene).toBeNull()
    expect(parent.children.length).toBe(0)
  })
})

describe("SpriteEntity", () => {
  it("defaults its size to the sprite dimensions", () => {
    const entity = new SpriteEntity({ sprite: new Sprite(3, 4) })
    expect(entity.size.x).toBe(3)
    expect(entity.size.y).toBe(4)
  })

  it("draws its sprite and its children into the canvas", () => {
    const scene = new Scene("sprites")
    const parent = new SpriteEntity({ sprite: solidSprite("A"), position: new Vector2(1, 1) })
    parent.add(new SpriteEntity({ sprite: solidSprite("B"), position: new Vector2(2, 2) }))
    scene.add(parent)

    const canvas = new InMemoryCanvas(8, 8)
    scene.draw(canvas)
    // Parent + child each draw one glyph.
    expect(nonBlankCells(canvas)).toBe(2)
  })
})

describe("AnimatedSpriteEntity", () => {
  it("advances its animation on update", () => {
    const frames = [solidSprite("A"), solidSprite("B")]
    const animation = new AnimatedSprite({
      clips: { walk: { frames, frameDuration: 100, loop: true } },
      initial: "walk",
    })
    const entity = new AnimatedSpriteEntity({ animation })
    expect(entity.animation.currentFrame()).toBe(frames[0]!)
    entity.update(100)
    expect(entity.animation.currentFrame()).toBe(frames[1]!)
  })
})
