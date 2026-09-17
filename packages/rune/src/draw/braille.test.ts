import { describe, expect, it } from "bun:test"
import { BRAILLE_BITS, brailleGlyph, rasterizeBrailleCell } from "@/draw/braille"

describe("braille", () => {
  it("renders the empty and full glyphs", () => {
    expect(brailleGlyph(0)).toBe("⠀")
    expect(brailleGlyph(0xff)).toBe("⣿")
  })

  it("the 2x4 bit layout has 8 unique bits covering 0..255", () => {
    const bits = BRAILLE_BITS.flat()
    expect(bits.length).toBe(8)
    expect(new Set(bits).size).toBe(8)
    expect(bits.reduce((a, b) => a | b, 0)).toBe(0xff)
  })

  it("rasterizes a fully-lit cell to the full mask", () => {
    expect(rasterizeBrailleCell(0, 0, () => true)).toBe(0xff)
  })

  it("rasterizes an unlit cell to zero", () => {
    expect(rasterizeBrailleCell(0, 0, () => false)).toBe(0)
  })

  it("samples 8 sub-pixels inside the cell bounds", () => {
    const samples: Array<[number, number]> = []
    rasterizeBrailleCell(3, 5, (x, y) => {
      samples.push([x, y])
      return false
    })
    expect(samples.length).toBe(8)
    for (const [x, y] of samples) {
      expect(x).toBeGreaterThan(3)
      expect(x).toBeLessThan(4)
      expect(y).toBeGreaterThan(5)
      expect(y).toBeLessThan(6)
    }
  })
})
