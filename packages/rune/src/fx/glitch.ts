import type { Canvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import type { ScreenEffect } from "./screen"

/**
 * Transient CRT/retro glitch kinds the {@link GlitchEffect} can fire.
 */
export enum GlitchKind {
  /** Horizontal row tear — a strip of rows shifts sideways. */
  Tear = "tear",
  /** Block of static noise. */
  Static = "static",
  /** Whole-frame brightness flicker. */
  Flicker = "flicker",
  /** Localized chromatic-aberration patch. */
  Chroma = "chroma",
  /** Block of randomly coloured corrupted glyphs. */
  Corrupt = "corrupt",
}

const ALL_KINDS: GlitchKind[] = [
  GlitchKind.Tear,
  GlitchKind.Static,
  GlitchKind.Flicker,
  GlitchKind.Chroma,
  GlitchKind.Corrupt,
]

// Per-kind glitch duration range in ticks [min, max].
const DURATION: Record<GlitchKind, [number, number]> = {
  [GlitchKind.Tear]: [4, 10],
  [GlitchKind.Static]: [3, 6],
  [GlitchKind.Flicker]: [2, 5],
  [GlitchKind.Chroma]: [3, 7],
  [GlitchKind.Corrupt]: [3, 6],
}

const STATIC_CHARS = "░▒▓█▄▀▐▌"
const CHROMA_CHARS = "▀▄▌▐░▒"
const CORRUPT_CHARS = "▓░▀▄█╬╫╠═║┼■"
const CORRUPT_COLORS: [number, number, number][] = [
  [170, 250, 255],
  [255, 45, 45],
  [255, 140, 0],
  [0, 225, 255],
  [170, 80, 255],
  [255, 0, 110],
  [80, 140, 255],
  [40, 255, 130],
]

interface GlitchState {
  kind: GlitchKind
  start: number
  duration: number
  // tear
  tearRow: number
  tearHeight: number
  tearDeltaX: number
  // static / chroma / corrupt patch
  patchX: number
  patchY: number
  patchWidth: number
  patchHeight: number
  // flicker brightness multiplier
  flickerMultiplier: number
}

/** Options for constructing a {@link GlitchEffect}. */
export interface GlitchEffectOptions {
  /** Canvas width in cells. */
  width: number
  /** Canvas height in cells. */
  height: number
  /** Which glitch kinds may fire. Default: all. */
  kinds?: GlitchKind[]
  /** Idle gap between glitches in ticks [min, max). Default [100, 400). */
  cooldownTicks?: [number, number]
  /** Injectable Random for deterministic tests. Default Math.random. */
  random?: () => number
}

/**
 * A CRT/retro glitch as a {@link ScreenEffect}: it idles for a random cooldown,
 * fires one transient glitch (tear, static, flicker, chroma aberration or block
 * corruption) for a few ticks, then idles again. `rowOffset`/`brightness` feed a
 * {@link FilterCanvas} so tears and flicker warp the live frame; `postPass`
 * paints the noisy kinds on top after the frame is drawn.
 */
export class GlitchEffect implements ScreenEffect {
  private width: number
  private height: number
  private readonly kinds: GlitchKind[]
  private readonly cooldownTicks: [number, number]
  private readonly random: () => number
  private state: GlitchState | null = null
  private cooldown: number

  /**
   * @param options - Glitch configuration.
   */
  constructor(options: GlitchEffectOptions) {
    this.width = options.width
    this.height = options.height
    this.kinds = options.kinds ?? ALL_KINDS
    this.cooldownTicks = options.cooldownTicks ?? [100, 400]
    this.random = options.random ?? Math.random
    this.cooldown = this.nextCooldown()
  }

  /**
   * Update the canvas size after a resize.
   *
   * @param width - New width in cells.
   * @param height - New height in cells.
   */
  resize(width: number, height: number): void {
    this.width = width
    this.height = height
  }

  private nextCooldown(): number {
    const [lo, hi] = this.cooldownTicks
    return lo + Math.floor(this.random() * (hi - lo))
  }

  private randInt(n: number): number {
    return Math.floor(this.random() * n)
  }

  /**
   * Advance the glitch timeline one tick: expire a running glitch or count down
   * the cooldown toward the next one.
   *
   * @param tick - Current tick number.
   */
  update(tick: number): void {
    if (this.state) {
      if (tick - this.state.start >= this.state.duration) {
        this.state = null
        this.cooldown = this.nextCooldown()
      }
    } else if (--this.cooldown <= 0) {
      this.state = this.spawn(tick)
    }
  }

  private spawn(tick: number): GlitchState {
    const kind = this.kinds[this.randInt(this.kinds.length)]!
    const [durMin, durMax] = DURATION[kind]
    const s: GlitchState = {
      kind,
      start: tick,
      duration: durMin + this.randInt(durMax - durMin + 1),
      tearRow: 0,
      tearHeight: 0,
      tearDeltaX: 0,
      patchX: 0,
      patchY: 0,
      patchWidth: 0,
      patchHeight: 0,
      flickerMultiplier: 1,
    }
    const w = this.width
    const h = this.height
    switch (kind) {
      case GlitchKind.Tear:
        s.tearRow = this.randInt(h)
        s.tearHeight = 1 + this.randInt(3)
        s.tearDeltaX = (1 + this.randInt(3)) * (this.random() < 0.5 ? 1 : -1)
        break
      case GlitchKind.Static:
        s.patchWidth = 8 + this.randInt(13)
        s.patchHeight = 4 + this.randInt(7)
        s.patchX = this.randInt(Math.max(1, w - s.patchWidth))
        s.patchY = this.randInt(Math.max(1, h - s.patchHeight))
        break
      case GlitchKind.Flicker:
        s.flickerMultiplier = this.random() < 0.5 ? 0.5 + this.random() * 0.2 : 1.3 + this.random() * 0.3
        break
      case GlitchKind.Chroma:
        s.patchWidth = 10 + this.randInt(20)
        s.patchHeight = 3 + this.randInt(5)
        s.patchX = this.randInt(Math.max(1, w - s.patchWidth))
        s.patchY = this.randInt(Math.max(1, h - s.patchHeight))
        break
      case GlitchKind.Corrupt:
        s.patchWidth = 6 + this.randInt(10)
        s.patchHeight = 2 + this.randInt(4)
        s.patchX = this.randInt(Math.max(1, w - s.patchWidth))
        s.patchY = this.randInt(Math.max(1, h - s.patchHeight))
        break
    }
    return s
  }

  /**
   * Horizontal row offset for the tear glitch.
   *
   * @param y - Row index.
   * @returns Cells to shift row `y` (0 outside a tear).
   */
  rowOffset(y: number): number {
    const s = this.state
    if (s?.kind !== GlitchKind.Tear) return 0
    return y >= s.tearRow && y < s.tearRow + s.tearHeight ? s.tearDeltaX : 0
  }

  /**
   * Brightness multiplier for the flicker glitch.
   *
   * @returns Multiplier (1.0 when not flickering).
   */
  brightness(): number {
    const s = this.state
    if (s?.kind !== GlitchKind.Flicker) return 1
    return s.flickerMultiplier
  }

  /**
   * Paint the noisy glitch kinds (static, chroma, corrupt) onto `canvas`.
   *
   * @param canvas - Target canvas.
   * @param tick - Current tick number.
   */
  postPass(canvas: Canvas, tick: number): void {
    const s = this.state
    if (!s) return
    switch (s.kind) {
      case GlitchKind.Static:
        this.drawStatic(canvas, s, tick)
        break
      case GlitchKind.Chroma:
        this.drawChroma(canvas, s)
        break
      case GlitchKind.Corrupt:
        this.drawCorrupt(canvas, s, tick)
        break
    }
  }

  private drawStatic(canvas: Canvas, s: GlitchState, tick: number): void {
    const seed = s.start + tick
    for (let y = s.patchY; y < s.patchY + s.patchHeight && y < canvas.height; y++) {
      for (let x = s.patchX; x < s.patchX + s.patchWidth && x < canvas.width; x++) {
        if (x < 1 || y < 1) continue
        const hsh = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + seed * 45.164))
        if (hsh > 0.55) continue
        const ci = Math.abs(Math.sin(x * 4.898 + y * 7.23 + seed * 2.164) * STATIC_CHARS.length) | 0
        const b = 0.4 + 0.6 * Math.abs(Math.sin(x * 3.456 + y * 9.87 + seed * 1.37))
        canvas.setCell(
          x,
          y,
          STATIC_CHARS[ci % STATIC_CHARS.length]!,
          Color.fromBytes(170 * b, 250 * b, 255 * b),
          Color.BLACK,
        )
      }
    }
  }

  private drawChroma(canvas: Canvas, s: GlitchState): void {
    for (let y = s.patchY; y < s.patchY + s.patchHeight && y < canvas.height; y++) {
      for (let x = s.patchX; x < s.patchX + s.patchWidth && x < canvas.width; x++) {
        if (x < 2 || y < 1 || x >= canvas.width - 2 || y >= canvas.height - 1) continue
        const hsh = Math.abs(Math.sin(x * 17.31 + y * 53.97))
        if (hsh > 0.55) continue
        const ci = (x + y * 3) % CHROMA_CHARS.length
        const isRed = (x + y) % 2 === 0
        const col = isRed ? Color.fromBytes(220, 40, 40) : Color.fromBytes(40, 80, 220)
        const dx = isRed ? -1 : 1
        canvas.setCell(x + dx, y, CHROMA_CHARS[ci]!, col, Color.BLACK)
      }
    }
  }

  private drawCorrupt(canvas: Canvas, s: GlitchState, tick: number): void {
    const seed = s.start + tick
    for (let y = s.patchY; y < s.patchY + s.patchHeight && y < canvas.height; y++) {
      for (let x = s.patchX; x < s.patchX + s.patchWidth && x < canvas.width; x++) {
        if (x < 1 || y < 1 || x >= canvas.width - 1 || y >= canvas.height - 1) continue
        const ci = Math.abs(Math.sin(x * 7.13 + y * 13.37 + seed * 3.71) * CORRUPT_CHARS.length) | 0
        const c = CORRUPT_COLORS[(x + y * 5 + seed) % CORRUPT_COLORS.length]!
        canvas.setCell(x, y, CORRUPT_CHARS[ci % CORRUPT_CHARS.length]!, Color.fromBytes(c[0], c[1], c[2]), Color.BLACK)
      }
    }
  }
}
