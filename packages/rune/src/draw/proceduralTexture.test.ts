import { describe, expect, it } from "bun:test"
import { checkerTexture, uvGridTexture } from "@/draw/proceduralTexture"

describe("proceduralTexture", () => {
  it("checkerTexture fills an opaque RGBA buffer of the requested size", () => {
    const texture = checkerTexture(32, 4)
    expect(texture.width).toBe(32)
    expect(texture.height).toBe(32)
    expect(texture.data.length).toBe(32 * 32 * 4)
    // Every pixel is opaque.
    for (let i = 3; i < texture.data.length; i += 4) expect(texture.data[i]).toBe(255)
  })

  it("checkerTexture alternates tone between adjacent cells", () => {
    const texture = checkerTexture(8, 8) // one cell per pixel
    const lum = (x: number, y: number) => texture.data[(y * 8 + x) * 4]!
    expect(lum(0, 0)).not.toBe(lum(1, 0))
  })

  it("uvGridTexture draws light grid lines on the cell borders", () => {
    const texture = uvGridTexture(16, 8)
    const at = (x: number, y: number) => texture.data[(y * 16 + x) * 4]!
    // x % gridPx === 0 is a grid line (bright); an interior pixel is darker.
    expect(at(0, 0)).toBe(245)
    expect(at(3, 3)).toBeLessThan(245)
  })
})
