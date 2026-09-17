import { describe, expect, it } from "bun:test"
import { Random } from "@/math/random"

describe("Random", () => {
  it("produces deterministic sequences for the same seed", () => {
    const a = new Random(42)
    const b = new Random(42)
    const sequenceA = Array.from({ length: 5 }, () => a.next())
    const sequenceB = Array.from({ length: 5 }, () => b.next())
    expect(sequenceA).toEqual(sequenceB)
  })

  it("produces different sequences for different seeds", () => {
    const a = new Random(1)
    const b = new Random(2)
    expect(a.next()).not.toBe(b.next())
  })

  it("integer respects bounds inclusively", () => {
    const random = new Random(123)
    for (let i = 0; i < 100; i++) {
      const value = random.integer(0, 9)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(9)
    }
  })

  it("float respects bounds", () => {
    const random = new Random(7)
    for (let i = 0; i < 100; i++) {
      const value = random.float(2, 5)
      expect(value).toBeGreaterThanOrEqual(2)
      expect(value).toBeLessThan(5)
    }
  })

  it("pick returns an element from the array", () => {
    const random = new Random(99)
    const options = ["a", "b", "c", "d"]
    for (let i = 0; i < 20; i++) {
      expect(options).toContain(random.pick(options))
    }
  })

  it("chance produces both true and false over many trials", () => {
    const random = new Random(0xdeadbeef)
    let trues = 0
    let falses = 0
    for (let i = 0; i < 1000; i++) {
      if (random.chance(0.5)) trues++
      else falses++
    }
    expect(trues).toBeGreaterThan(400)
    expect(falses).toBeGreaterThan(400)
  })
})
