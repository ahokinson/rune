import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { Anchor } from "@/draw/layout"
import { drawControlLegend, drawLabeledPanel, drawModal } from "@/draw/widgets"

const INK = Color.fromBytes(200, 200, 200)
const DIM = Color.fromBytes(80, 80, 80)
const PANEL = Color.fromBytes(8, 8, 8)
const FRAME = Color.fromBytes(60, 60, 60)

// Read a horizontal run of glyphs back as a string.
function readRow(canvas: InMemoryCanvas, x: number, y: number, length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) out += canvas.cellAt(x + i, y)?.character ?? ""
  return out
}

describe("drawControlLegend", () => {
  it("anchors to the bottom-left and prints keys then labels", () => {
    const canvas = new InMemoryCanvas(80, 24)
    const rect = drawControlLegend(canvas, {
      controls: [
        { keys: "Space", label: "jump" },
        { keys: "←/→", label: "move" },
      ],
      keyColor: INK,
      labelColor: DIM,
      panel: PANEL,
      frame: FRAME,
    })
    // height 3, pinned to the bottom with marginY 0.
    expect(rect.height).toBe(3)
    expect(rect.bottom).toBe(24)
    expect(rect.x).toBe(1) // default marginX
    // Content row sits one below the top border.
    const row = readRow(canvas, rect.x + 2, rect.y + 1, 24)
    expect(row.startsWith("Space jump")).toBe(true)
    expect(row).toContain("move")
  })

  it("colours keys and labels distinctly", () => {
    const canvas = new InMemoryCanvas(80, 24)
    const rect = drawControlLegend(canvas, {
      controls: [{ keys: "A", label: "act" }],
      keyColor: INK,
      labelColor: DIM,
      panel: PANEL,
      frame: FRAME,
    })
    const key = canvas.cellAt(rect.x + 2, rect.y + 1)
    const label = canvas.cellAt(rect.x + 4, rect.y + 1)
    expect(key?.character).toBe("A")
    expect(key?.foreground.red).toBeCloseTo(INK.red, 5)
    expect(label?.character).toBe("a")
    expect(label?.foreground.red).toBeCloseTo(DIM.red, 5)
  })
})

describe("drawLabeledPanel", () => {
  it("sizes to the widest of title and lines and prints each line", () => {
    const canvas = new InMemoryCanvas(80, 24)
    const rect = drawLabeledPanel(canvas, {
      title: "stats",
      lines: ["score 100", "a longer status line"],
      titleColor: INK,
      lineColor: DIM,
      panel: PANEL,
      frame: FRAME,
    })
    expect(rect.height).toBe(4) // 2 lines + 2 border rows
    // Longest line is 20 chars → inner 20, width 24.
    expect(rect.width).toBe(24)
    expect(readRow(canvas, rect.x + 2, rect.y + 1, 9)).toBe("score 100")
    expect(readRow(canvas, rect.x + 2, rect.y + 2, 20)).toBe("a longer status line")
  })

  it("honours a non-default anchor", () => {
    const canvas = new InMemoryCanvas(80, 24)
    const rect = drawLabeledPanel(canvas, {
      anchor: Anchor.TopRight,
      lines: ["hi"],
      lineColor: DIM,
      panel: PANEL,
      frame: FRAME,
    })
    expect(rect.right).toBe(canvas.width - 1) // marginX 1 from the right edge
    expect(rect.y).toBe(0)
  })
})

describe("drawModal", () => {
  it("centres a title-and-detail box", () => {
    const canvas = new InMemoryCanvas(80, 24)
    const rect = drawModal(canvas, {
      title: "Game Over",
      detail: "press R to retry",
      titleColor: INK,
      panel: PANEL,
      frame: FRAME,
    })
    expect(rect.height).toBe(4)
    // Roughly centred.
    expect(rect.centerX).toBeCloseTo(40, 0)
    expect(rect.centerY).toBeCloseTo(12, 0)
    expect(readRow(canvas, rect.x + 2, rect.y + 1, 9)).toBe("Game Over")
    expect(readRow(canvas, rect.x + 2, rect.y + 2, 16)).toBe("press R to retry")
  })

  it("uses a shorter box without detail", () => {
    const canvas = new InMemoryCanvas(80, 24)
    const rect = drawModal(canvas, { title: "Loading…", titleColor: INK, panel: PANEL, frame: FRAME })
    expect(rect.height).toBe(3)
  })
})
