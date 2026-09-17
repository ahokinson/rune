import { describe, expect, it } from "bun:test"
import { TileMeta } from "@/world/tileMeta"

describe("TileMeta", () => {
  it("stores and reads values by cell", () => {
    const meta = new TileMeta<string>()
    meta.set(2, 3, "coin")
    expect(meta.get(2, 3)).toBe("coin")
    expect(meta.has(2, 3)).toBe(true)
    expect(meta.get(0, 0)).toBeUndefined()
    expect(meta.has(0, 0)).toBe(false)
  })

  it("distinguishes cells that share digits", () => {
    const meta = new TileMeta<number>()
    meta.set(1, 12, 1)
    meta.set(11, 2, 2)
    expect(meta.get(1, 12)).toBe(1)
    expect(meta.get(11, 2)).toBe(2)
  })

  it("overwrites, deletes, and tracks size", () => {
    const meta = new TileMeta<number>()
    meta.set(5, 5, 1)
    meta.set(5, 5, 2)
    expect(meta.get(5, 5)).toBe(2)
    expect(meta.size).toBe(1)
    expect(meta.delete(5, 5)).toBe(true)
    expect(meta.delete(5, 5)).toBe(false)
    expect(meta.size).toBe(0)
  })

  it("iterates each entry with its coordinates", () => {
    const meta = new TileMeta<string>()
    meta.set(1, 2, "a")
    meta.set(3, 4, "b")
    const seen: Array<[string, number, number]> = []
    meta.forEach((value, column, row) => {
      seen.push([value, column, row])
    })
    expect(seen).toContainEqual(["a", 1, 2])
    expect(seen).toContainEqual(["b", 3, 4])
    expect(seen).toHaveLength(2)
  })
})
