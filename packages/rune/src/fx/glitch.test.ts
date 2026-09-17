import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { GlitchEffect, GlitchKind } from "@/fx/glitch"

describe("GlitchEffect", () => {
  it("is inert while idle", () => {
    const g = new GlitchEffect({ width: 80, height: 40, random: () => 0 })
    expect(g.brightness()).toBe(1)
    expect(g.rowOffset(5)).toBe(0)
    const canvas = new InMemoryCanvas(80, 40)
    g.postPass(canvas, 0)
    expect(canvas.cellAt(2, 2)!.character).toBe(" ")
  })

  it("fires a tear after the cooldown and offsets only the torn rows", () => {
    const g = new GlitchEffect({
      width: 80,
      height: 40,
      kinds: [GlitchKind.Tear],
      cooldownTicks: [1, 2],
      random: () => 0,
    })
    g.update(0) // cooldown 1 -> 0 -> spawn tear (row 0, height 1, dx 1)
    expect(g.rowOffset(0)).toBe(1)
    expect(g.rowOffset(5)).toBe(0)
    expect(g.brightness()).toBe(1) // tear leaves brightness alone
  })

  it("fires a flicker that dims brightness, then expires", () => {
    const g = new GlitchEffect({
      width: 80,
      height: 40,
      kinds: [GlitchKind.Flicker],
      cooldownTicks: [1, 2],
      random: () => 0,
    })
    g.update(0) // spawn flicker (duration 2, fMul 0.5)
    expect(g.brightness()).toBeCloseTo(0.5)
    g.update(1)
    expect(g.brightness()).toBeCloseTo(0.5)
    g.update(2) // 2 - 0 >= duration 2 -> expires
    expect(g.brightness()).toBe(1)
  })

  it("paints corrupt blocks in postPass", () => {
    const g = new GlitchEffect({
      width: 80,
      height: 40,
      kinds: [GlitchKind.Corrupt],
      cooldownTicks: [1, 2],
      random: () => 0,
    })
    g.update(0) // spawn corrupt patch at (0,0) size 6x2
    const canvas = new InMemoryCanvas(80, 40)
    g.postPass(canvas, 0)
    // drawCorrupt skips x<1/y<1, so (0,0) stays blank but (1,1)..(5,1) are filled.
    expect(canvas.cellAt(0, 0)!.character).toBe(" ")
    expect(canvas.cellAt(1, 1)!.character).not.toBe(" ")
    expect(canvas.cellAt(5, 1)!.character).not.toBe(" ")
  })
})
