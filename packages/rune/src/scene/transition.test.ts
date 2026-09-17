import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { Easing } from "@/math/easing"
import { drawTransition, SceneTransition, TransitionKind, TransitionPhase } from "@/scene/transition"

const RED = Color.fromBytes(255, 0, 0)

// Count cells whose background matches `color`.
function countFilled(canvas: InMemoryCanvas, color: Color): number {
  let count = 0
  const target = Math.round(color.red * 255)
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (canvas.cellAt(x, y)?.background.red === target / 255) count++
    }
  }
  return count
}

describe("drawTransition", () => {
  it("draws nothing at coverage 0 and fills everything at coverage 1", () => {
    const canvas = new InMemoryCanvas(16, 16)
    drawTransition(canvas, { coverage: 0, color: RED })
    expect(countFilled(canvas, RED)).toBe(0)
    drawTransition(canvas, { coverage: 1, color: RED })
    expect(countFilled(canvas, RED)).toBe(16 * 16)
  })

  it("covers roughly half the cells at coverage 0.5 (dither fade)", () => {
    const canvas = new InMemoryCanvas(16, 16)
    drawTransition(canvas, { kind: TransitionKind.Fade, coverage: 0.5, color: RED })
    const filled = countFilled(canvas, RED)
    expect(filled).toBeGreaterThan(16 * 16 * 0.4)
    expect(filled).toBeLessThan(16 * 16 * 0.6)
  })

  it("sweeps a solid bar from the left for WipeLeft", () => {
    const canvas = new InMemoryCanvas(10, 4)
    drawTransition(canvas, { kind: TransitionKind.WipeLeft, coverage: 0.5, color: RED })
    // Left 5 columns filled, right 5 clear.
    expect(canvas.cellAt(0, 0)?.background.red).toBe(1)
    expect(canvas.cellAt(4, 0)?.background.red).toBe(1)
    expect(canvas.cellAt(5, 0)?.background.red).toBe(0)
  })
})

describe("SceneTransition", () => {
  it("covers, swaps at the midpoint, then reveals and ends", () => {
    const transition = new SceneTransition({ durationMilliseconds: 100, easing: Easing.linear })
    let swaps = 0
    expect(transition.isActive).toBe(false)

    transition.start(() => swaps++)
    expect(transition.phase).toBe(TransitionPhase.Covering)
    expect(transition.coverage).toBe(0)

    transition.advance(50)
    expect(transition.coverage).toBeCloseTo(0.5, 5)
    expect(swaps).toBe(0)

    // Reach full coverage → swap fires once, phase flips to revealing.
    transition.advance(50)
    expect(swaps).toBe(1)
    expect(transition.phase).toBe(TransitionPhase.Revealing)
    expect(transition.coverage).toBeCloseTo(1, 5)

    transition.advance(50)
    expect(transition.coverage).toBeCloseTo(0.5, 5)

    transition.advance(50)
    expect(transition.phase).toBe(TransitionPhase.Idle)
    expect(transition.isActive).toBe(false)
    expect(swaps).toBe(1) // not fired again
  })

  it("ignores start() while already active", () => {
    const transition = new SceneTransition({ durationMilliseconds: 100 })
    transition.start()
    transition.advance(40)
    transition.start() // ignored
    expect(transition.phase).toBe(TransitionPhase.Covering)
  })
})
