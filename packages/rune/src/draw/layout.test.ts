import { describe, expect, it } from "bun:test"
import { Anchor, flowColumn, flowExtent, flowRow, resolveAnchor } from "@/draw/layout"

describe("resolveAnchor", () => {
  const W = 80
  const H = 24

  it("pins each corner to the right cell", () => {
    expect(resolveAnchor(W, H, { anchor: Anchor.TopLeft, width: 10, height: 4 })).toMatchObject({ x: 0, y: 0 })
    expect(resolveAnchor(W, H, { anchor: Anchor.TopRight, width: 10, height: 4 })).toMatchObject({ x: 70, y: 0 })
    expect(resolveAnchor(W, H, { anchor: Anchor.BottomLeft, width: 10, height: 4 })).toMatchObject({ x: 0, y: 20 })
    expect(resolveAnchor(W, H, { anchor: Anchor.BottomRight, width: 10, height: 4 })).toMatchObject({ x: 70, y: 20 })
  })

  it("centres the Center anchor in both axes", () => {
    const r = resolveAnchor(W, H, { anchor: Anchor.Center, width: 20, height: 6 })
    expect(r).toMatchObject({ x: 30, y: 9 })
  })

  it("centres the cross axis for edge anchors", () => {
    expect(resolveAnchor(W, H, { anchor: Anchor.Top, width: 20, height: 6 })).toMatchObject({ x: 30, y: 0 })
    expect(resolveAnchor(W, H, { anchor: Anchor.Bottom, width: 20, height: 6 })).toMatchObject({ x: 30, y: 18 })
    expect(resolveAnchor(W, H, { anchor: Anchor.Left, width: 20, height: 6 })).toMatchObject({ x: 0, y: 9 })
    expect(resolveAnchor(W, H, { anchor: Anchor.Right, width: 20, height: 6 })).toMatchObject({ x: 60, y: 9 })
  })

  it("insets from the hugged edge by the margin", () => {
    expect(resolveAnchor(W, H, { anchor: Anchor.TopLeft, width: 10, height: 4, marginX: 2, marginY: 1 })).toMatchObject(
      {
        x: 2,
        y: 1,
      },
    )
    expect(
      resolveAnchor(W, H, { anchor: Anchor.BottomRight, width: 10, height: 4, marginX: 2, marginY: 1 }),
    ).toMatchObject({ x: 68, y: 19 })
  })

  it("ignores the margin on a centred axis", () => {
    // Top anchor centres X, so marginX must not shift it.
    expect(resolveAnchor(W, H, { anchor: Anchor.Top, width: 20, height: 6, marginX: 5, marginY: 1 })).toMatchObject({
      x: 30,
      y: 1,
    })
  })

  it("clamps a box larger than the canvas to the origin", () => {
    const r = resolveAnchor(W, H, { anchor: Anchor.BottomRight, width: 200, height: 100 })
    expect(r.x).toBe(0)
    expect(r.y).toBe(0)
  })
})

describe("flow", () => {
  it("offsets a row by size + gap", () => {
    expect(flowRow([4, 6, 2], 3)).toEqual([0, 7, 16])
  })

  it("offsets a column the same way", () => {
    expect(flowColumn([1, 1, 1], 0)).toEqual([0, 1, 2])
  })

  it("reports the total extent including inter-item gaps", () => {
    expect(flowExtent([4, 6, 2], 3)).toBe(18) // 12 sizes + 2 gaps * 3
    expect(flowExtent([], 3)).toBe(0)
    expect(flowExtent([5], 3)).toBe(5)
  })
})
