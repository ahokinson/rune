import { describe, expect, it } from "bun:test"
import { CollisionLayer } from "@/physics/layers"

describe("CollisionLayer", () => {
  it("bit returns powers of two", () => {
    expect(CollisionLayer.bit(0)).toBe(1)
    expect(CollisionLayer.bit(1)).toBe(2)
    expect(CollisionLayer.bit(2)).toBe(4)
    expect(CollisionLayer.bit(31)).toBe(0x80000000)
  })

  it("bit throws for out-of-range indices", () => {
    expect(() => CollisionLayer.bit(-1)).toThrow()
    expect(() => CollisionLayer.bit(32)).toThrow()
  })

  it("mask ors multiple layers", () => {
    const player = CollisionLayer.bit(0)
    const enemy = CollisionLayer.bit(1)
    const pickup = CollisionLayer.bit(2)
    expect(CollisionLayer.mask(player, pickup)).toBe(0b101)
    expect(CollisionLayer.mask(enemy)).toBe(0b010)
    expect(CollisionLayer.mask()).toBe(0)
  })

  it("matches returns true when layer is in mask", () => {
    const player = CollisionLayer.bit(0)
    const enemy = CollisionLayer.bit(1)
    const mask = CollisionLayer.mask(enemy)
    expect(CollisionLayer.matches(player, mask)).toBe(false)
    expect(CollisionLayer.matches(enemy, mask)).toBe(true)
  })

  it("none and all are sensible defaults", () => {
    const layer = CollisionLayer.bit(5)
    expect(CollisionLayer.matches(layer, CollisionLayer.none)).toBe(false)
    expect(CollisionLayer.matches(layer, CollisionLayer.all)).toBe(true)
  })
})
