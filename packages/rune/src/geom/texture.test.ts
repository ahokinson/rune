import { describe, expect, it } from "bun:test"
import { equirectTexel } from "@/geom/texture"

const W = 1024
const H = 512

describe("equirectTexel", () => {
  it("places azimuth -pi at column 0 and wraps azimuth +pi back to it", () => {
    expect(equirectTexel(0, -Math.PI, W, H).x).toBe(0)
    expect(equirectTexel(0, Math.PI, W, H).x).toBe(0)
  })

  it("places azimuth 0 at the horizontal centre", () => {
    expect(equirectTexel(0, 0, W, H).x).toBe(W / 2)
  })

  it("wraps azimuths beyond +/- pi", () => {
    expect(equirectTexel(0, Math.PI * 3, W, H).x).toBe(0)
  })

  it("puts the +pole at row 0 and clamps the -pole to the last row", () => {
    expect(equirectTexel(Math.PI / 2, 0, W, H).y).toBe(0)
    expect(equirectTexel(-Math.PI / 2, 0, W, H).y).toBe(H - 1)
  })

  it("clamps elevations past the poles instead of wrapping", () => {
    expect(equirectTexel(Math.PI, 0, W, H).y).toBe(0)
    expect(equirectTexel(-Math.PI, 0, W, H).y).toBe(H - 1)
  })
})
