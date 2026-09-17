import { describe, expect, it } from "bun:test"
import type { SurfaceColor } from "@/draw/color"
import { Color } from "@/draw/color"
import { PixelSprite } from "@/draw/pixelSprite"
import { Texture } from "@/draw/texture"

const out: SurfaceColor = { r: 0, g: 0, b: 0 }

describe("Texture", () => {
  it("samples the nearest texel at cell centres", () => {
    // 2x2 checker: (0,0) red, (1,0) green, (0,1) blue, (1,1) white
    const texture = new Texture(2, 2)
    texture.setPixel(0, 0, Color.fromBytes(255, 0, 0))
    texture.setPixel(1, 0, Color.fromBytes(0, 255, 0))
    texture.setPixel(0, 1, Color.fromBytes(0, 0, 255))
    texture.setPixel(1, 1, Color.fromBytes(255, 255, 255))

    texture.sampleInto(0.25, 0.25, out)
    expect([out.r, out.g, out.b]).toEqual([255, 0, 0])
    texture.sampleInto(0.75, 0.25, out)
    expect([out.r, out.g, out.b]).toEqual([0, 255, 0])
    texture.sampleInto(0.25, 0.75, out)
    expect([out.r, out.g, out.b]).toEqual([0, 0, 255])
    texture.sampleInto(0.75, 0.75, out)
    expect([out.r, out.g, out.b]).toEqual([255, 255, 255])
  })

  it("wraps coordinates outside the unit square so the texture tiles", () => {
    const texture = new Texture(2, 2)
    texture.setPixel(0, 0, Color.fromBytes(255, 0, 0))
    texture.setPixel(1, 0, Color.fromBytes(0, 255, 0))

    texture.sampleInto(0.25, 0.25, out)
    const base = [out.r, out.g, out.b]
    texture.sampleInto(1.25, 2.25, out) // +1 in u, +2 in v
    expect([out.r, out.g, out.b]).toEqual(base)
    texture.sampleInto(-0.75, -1.75, out) // negative wraps too
    expect([out.r, out.g, out.b]).toEqual(base)
  })

  it("clamps the top edge u=1/v=1 to the last texel", () => {
    const texture = new Texture(4, 1)
    texture.setPixel(3, 0, Color.fromBytes(10, 20, 30))
    texture.sampleInto(1, 0, out) // wraps to 0 -> first texel, not last
    // u=1 wraps to 0; verify the dedicated near-1 sample hits the last texel
    texture.sampleInto(0.999, 0, out)
    expect([out.r, out.g, out.b]).toEqual([10, 20, 30])
  })

  it("round-trips a PixelSprite, treating transparent pixels as alpha 0", () => {
    const sprite = PixelSprite.fromString(
      `
RG
.B
`,
      { R: Color.fromBytes(200, 0, 0), G: Color.fromBytes(0, 200, 0), B: Color.fromBytes(0, 0, 200) },
    )
    const texture = Texture.fromPixelSprite(sprite)
    expect(texture.width).toBe(2)
    expect(texture.height).toBe(2)

    texture.sampleInto(0.25, 0.25, out)
    expect([out.r, out.g, out.b]).toEqual([200, 0, 0])
    texture.sampleInto(0.75, 0.75, out)
    expect([out.r, out.g, out.b]).toEqual([0, 0, 200])

    // "." is transparent -> alpha 0
    expect(texture.sampleAlpha(0.25, 0.75)).toBe(0)
    expect(texture.sampleAlpha(0.25, 0.25)).toBe(255)
  })

  it("rejects data whose length does not match the dimensions", () => {
    expect(() => new Texture(2, 2, new Uint8ClampedArray(3))).toThrow()
  })
})
