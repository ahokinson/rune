/**
 * A {@link SurfaceShader} that paints raycast walls/floors/ceilings from
 * {@link Texture} lookups instead of hand-written procedural code.
 *
 * @module
 */

import type { SurfaceColor } from "../color"
import type { Texture } from "../texture"
import type { FlatSample, SurfaceShader, WallSample } from "./grid"

/** Picks the texture for a surface, or `null` to fall back to `background`. */
export type WallTextureLookup = (sample: WallSample) => Texture | null
/** Picks the texture for a floor or ceiling surface, or `null` to fall back to `background`. */
export type FlatTextureLookup = (sample: FlatSample) => Texture | null

export interface TextureSurfaceShaderOptions {
  /** Texture for a wall column at the given sample, or `null` for none. */
  wallTexture: WallTextureLookup
  floorTexture?: FlatTextureLookup
  ceilingTexture?: FlatTextureLookup
  /** Colour used where a lookup returns `null`. Defaults to black. */
  background?: SurfaceColor
  /**
   * Optional post-pass applied to every pixel after the texture sample — the
   * place for distance fog, side darkening, or baked lighting. `out` is the
   * sampled colour to modify in place.
   */
  shade?: (out: SurfaceColor, distance: number, isSide: boolean) => void
}

/**
 * A {@link SurfaceShader} that paints walls/floors/ceilings from {@link Texture}
 * lookups instead of hand-written procedural code. Wall texels use the sample's
 * `u`/`v`; floor and ceiling texels use the fractional world position so a
 * texture tiles once per world cell. Supply `shade` to add fog/lighting.
 */
export class TextureSurfaceShader implements SurfaceShader {
  private readonly wallTexture: WallTextureLookup
  private readonly floorTexture: FlatTextureLookup | null
  private readonly ceilingTexture: FlatTextureLookup | null
  private readonly backgroundR: number
  private readonly backgroundG: number
  private readonly backgroundB: number
  private readonly shade: ((out: SurfaceColor, distance: number, isSide: boolean) => void) | null

  /**
   * @param options - Shader parameters; see {@link TextureSurfaceShaderOptions}.
   */
  constructor(options: TextureSurfaceShaderOptions) {
    this.wallTexture = options.wallTexture
    this.floorTexture = options.floorTexture ?? null
    this.ceilingTexture = options.ceilingTexture ?? null
    this.backgroundR = options.background?.r ?? 0
    this.backgroundG = options.background?.g ?? 0
    this.backgroundB = options.background?.b ?? 0
    this.shade = options.shade ?? null
  }

  private fallback(out: SurfaceColor): void {
    out.r = this.backgroundR
    out.g = this.backgroundG
    out.b = this.backgroundB
  }

  wallPixel(sample: WallSample, out: SurfaceColor): void {
    const texture = this.wallTexture(sample)
    if (texture) texture.sampleInto(sample.u, sample.v, out)
    else this.fallback(out)
    this.shade?.(out, sample.distance, sample.isSide)
  }

  floorPixel(sample: FlatSample, out: SurfaceColor): void {
    const texture = this.floorTexture ? this.floorTexture(sample) : null
    if (texture) texture.sampleInto(sample.worldX, sample.worldY, out)
    else this.fallback(out)
    this.shade?.(out, sample.distance, false)
  }

  ceilingPixel(sample: FlatSample, out: SurfaceColor): void {
    const texture = this.ceilingTexture ? this.ceilingTexture(sample) : null
    if (texture) texture.sampleInto(sample.worldX, sample.worldY, out)
    else this.fallback(out)
    this.shade?.(out, sample.distance, false)
  }
}
