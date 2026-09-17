import { describe, expect, it } from "bun:test"
import { Blackboard } from "@/ai/blackboard"

interface Memory {
  targetSeen: boolean
  lastKnownX: number
}

describe("Blackboard", () => {
  it("stores and reads typed values", () => {
    const board = new Blackboard<Memory>()
    board.set("targetSeen", true)
    board.set("lastKnownX", 42)
    expect(board.get("targetSeen")).toBe(true)
    expect(board.get("lastKnownX")).toBe(42)
  })

  it("returns undefined for unset keys", () => {
    const board = new Blackboard<Memory>()
    expect(board.get("targetSeen")).toBeUndefined()
    expect(board.has("targetSeen")).toBe(false)
  })

  it("getOr falls back when unset", () => {
    const board = new Blackboard<Memory>()
    expect(board.getOr("lastKnownX", -1)).toBe(-1)
    board.set("lastKnownX", 7)
    expect(board.getOr("lastKnownX", -1)).toBe(7)
  })

  it("deletes and clears", () => {
    const board = new Blackboard<Memory>()
    board.set("targetSeen", true)
    expect(board.delete("targetSeen")).toBe(true)
    expect(board.has("targetSeen")).toBe(false)
    board.set("lastKnownX", 1)
    board.clear()
    expect(board.has("lastKnownX")).toBe(false)
  })
})
