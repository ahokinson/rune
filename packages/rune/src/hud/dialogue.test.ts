import { describe, expect, it } from "bun:test"
import { Dialogue, wrapText } from "@/hud/dialogue"

describe("Dialogue", () => {
  it("reveals the current page over time at the configured rate", () => {
    const dialogue = new Dialogue({ pages: ["hello", "world"], charactersPerSecond: 10 })
    expect(dialogue.visibleText).toBe("")
    dialogue.advance(300) // 3 chars at 10/s
    expect(dialogue.visibleText).toBe("hel")
    expect(dialogue.isPageComplete).toBe(false)
    dialogue.advance(1000) // clamps to full page
    expect(dialogue.visibleText).toBe("hello")
    expect(dialogue.isPageComplete).toBe(true)
  })

  it("skips to the full page and advances through pages", () => {
    const dialogue = new Dialogue({ pages: ["one", "two"] })
    dialogue.skip()
    expect(dialogue.visibleText).toBe("one")
    expect(dialogue.next()).toBe(true)
    expect(dialogue.pageIndex).toBe(1)
    expect(dialogue.visibleText).toBe("") // reveal restarts
    dialogue.skip()
    expect(dialogue.next()).toBe(false) // no more pages
    expect(dialogue.isFinished).toBe(true)
  })

  it("does not reveal past the end once finished", () => {
    const dialogue = new Dialogue({ pages: ["x"] })
    dialogue.skip()
    dialogue.next()
    dialogue.advance(1000)
    expect(dialogue.visibleText).toBe("")
    expect(dialogue.isFinished).toBe(true)
  })
})

describe("wrapText", () => {
  it("wraps on spaces within the width", () => {
    expect(wrapText("the quick brown fox", 9)).toEqual(["the quick", "brown fox"])
  })

  it("hard-splits a word longer than the width", () => {
    expect(wrapText("supercalifragilistic", 5)).toEqual(["super", "calif", "ragil", "istic"])
  })

  it("returns a single empty line for empty text", () => {
    expect(wrapText("", 10)).toEqual([""])
  })
})
