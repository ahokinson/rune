import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { SaveStore } from "@/core/save"

describe("SaveStore", () => {
  let directory: string
  let store: SaveStore

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "rune-save-"))
    store = new SaveStore({ directory })
  })

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
  })

  it("round-trips a snapshot through save/load", async () => {
    const state = { level: 3, name: "hero", inventory: ["sword", "potion"], flags: { boss: true } }
    await store.save("slot1", state)
    expect(await store.load("slot1")).toEqual(state)
  })

  it("returns null and false for a missing slot", async () => {
    expect(await store.load("nope")).toBeNull()
    expect(await store.has("nope")).toBe(false)
  })

  it("reports has() and lists slot names alphabetically", async () => {
    await store.save("beta", { a: 1 })
    await store.save("alpha", { a: 2 })
    expect(await store.has("alpha")).toBe(true)
    expect(await store.list()).toEqual(["alpha", "beta"])
  })

  it("overwrites an existing slot and deletes one", async () => {
    await store.save("s", { v: 1 })
    await store.save("s", { v: 2 })
    expect(await store.load<{ v: number }>("s")).toEqual({ v: 2 })
    await store.delete("s")
    expect(await store.has("s")).toBe(false)
  })

  it("lists nothing for a directory that does not exist yet", async () => {
    const fresh = new SaveStore({ directory: join(directory, "child") })
    expect(await fresh.list()).toEqual([])
  })
})
