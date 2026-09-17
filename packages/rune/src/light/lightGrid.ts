import type { Color, SurfaceColor } from "@/draw/color"
import type { CellPredicate } from "@/physics/grid"
import { computeFieldOfView } from "./shadowcast"

/**
 * A baked per-cell light buffer: point lights accumulate coloured intensity into
 * a grid that renderers sample per cell to tint walls/floors/sprites. Each light
 * falls off linearly to zero at its radius. Pass an `isBlocking` predicate to
 * `addLight` and the light is occluded by walls via shadowcasting (it only lits
 * cells it can actually see) — leave it out for the cheaper, wall-ignoring bake.
 * Values accumulate in 0–255 byte space so they add directly onto the raycaster's
 * `SurfaceColor` out-params.
 *
 * @module
 */

/** A coloured point light source. */
export interface LightSource {
  /** Origin X in cell units. */
  x: number
  /** Origin Y in cell units. */
  y: number
  /** Light colour. */
  color: Color
  /** Maximum reach in cells; intensity falls off linearly to zero here. */
  radius: number
  /** Scales the light's contribution; defaults to 1. */
  intensity?: number
}

/** Baked grid of accumulated coloured light intensity. */
export class LightGrid {
  /** Grid width in cells. */
  readonly width: number
  /** Grid height in cells. */
  readonly height: number
  /** Interleaved r,g,b per cell. */
  readonly data: Float32Array

  /**
   * @param width - Grid width in cells.
   * @param height - Grid height in cells.
   */
  constructor(width: number, height: number) {
    this.width = Math.max(0, Math.floor(width))
    this.height = Math.max(0, Math.floor(height))
    this.data = new Float32Array(this.width * this.height * 3)
  }

  /** Zero every cell. */
  clear(): void {
    this.data.fill(0)
  }

  private deposit(column: number, row: number, distance: number, source: LightSource): void {
    if (column < 0 || row < 0 || column >= this.width || row >= this.height) return
    if (distance >= source.radius) return
    const falloff = (1 - distance / source.radius) * (source.intensity ?? 1)
    if (falloff <= 0) return
    const bytes = source.color.toBytes()
    const offset = (row * this.width + column) * 3
    this.data[offset]! += bytes.red * falloff
    this.data[offset + 1]! += bytes.green * falloff
    this.data[offset + 2]! += bytes.blue * falloff
  }

  /**
   * Accumulate one light. With `isBlocking`, shadowcasting restricts the light to
   * cells visible from its origin (walls cast shadows); without it, every cell in
   * the radius box is lit by straight-line distance falloff.
   *
   * @param source - Light to add.
   * @param isBlocking - Optional opacity predicate for shadowcasting.
   * @returns `this` for chaining.
   */
  addLight(source: LightSource, isBlocking?: CellPredicate): this {
    if (source.radius <= 0) return this
    if (isBlocking) {
      const originX = Math.floor(source.x)
      const originY = Math.floor(source.y)
      computeFieldOfView({
        originX,
        originY,
        radius: Math.ceil(source.radius),
        isBlocking,
        reveal: (column, row) => {
          const dx = column + 0.5 - source.x
          const dy = row + 0.5 - source.y
          this.deposit(column, row, Math.sqrt(dx * dx + dy * dy), source)
        },
      })
      return this
    }
    const minX = Math.max(0, Math.floor(source.x - source.radius))
    const maxX = Math.min(this.width - 1, Math.ceil(source.x + source.radius))
    const minY = Math.max(0, Math.floor(source.y - source.radius))
    const maxY = Math.min(this.height - 1, Math.ceil(source.y + source.radius))
    for (let row = minY; row <= maxY; row++) {
      for (let column = minX; column <= maxX; column++) {
        const dx = column + 0.5 - source.x
        const dy = row + 0.5 - source.y
        this.deposit(column, row, Math.sqrt(dx * dx + dy * dy), source)
      }
    }
    return this
  }

  /**
   * Write the accumulated light at a cell into `out` (0–255), replacing it.
   *
   * @param column - Cell column.
   * @param row - Cell row.
   * @param out - Target to overwrite.
   */
  sampleInto(column: number, row: number, out: SurfaceColor): void {
    if (column < 0 || row < 0 || column >= this.width || row >= this.height) {
      out.r = 0
      out.g = 0
      out.b = 0
      return
    }
    const offset = (row * this.width + column) * 3
    out.r = this.data[offset]!
    out.g = this.data[offset + 1]!
    out.b = this.data[offset + 2]!
  }

  /**
   * Add the accumulated light at a cell onto `out`, clamped to 255 — the form the
   * raycaster uses to tint an already-shaded surface byte colour.
   *
   * @param column - Cell column.
   * @param row - Cell row.
   * @param out - Surface colour to add light onto (mutated).
   */
  addInto(column: number, row: number, out: SurfaceColor): void {
    if (column < 0 || row < 0 || column >= this.width || row >= this.height) return
    const offset = (row * this.width + column) * 3
    out.r = Math.min(255, out.r + this.data[offset]!) | 0
    out.g = Math.min(255, out.g + this.data[offset + 1]!) | 0
    out.b = Math.min(255, out.b + this.data[offset + 2]!) | 0
  }
}
