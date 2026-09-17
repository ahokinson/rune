/**
 * Built-in {@link MeshShader} implementations: a simple Lambert shader and a
 * richer lit shader with four switchable modes, texture sampling, shadow-map
 * lookup, and emissive glow.
 *
 * @module
 */

import type { SurfaceColor } from "../color"
import type { Texture } from "../texture"
import type { Fragment, MeshShader } from "./rasterizer"
import type { ShadowMap } from "./shadowMap"

/** Options for {@link LambertMeshShader}. */
export interface LambertMeshShaderOptions {
  /** Base RGB (0–255); ignored where `texture` is set. Defaults to mid grey. */
  color?: SurfaceColor
  /**
   * Direction toward the light (world space); normalised on construction.
   * Defaults to an upper-front key light.
   */
  light?: { x: number; y: number; z: number }
  /** Ambient intensity (0–1). Default 0.34. */
  ambient?: number
  /** Diffuse intensity (0–1). Default 0.66. */
  diffuse?: number
  /** Optional texture sampled by the fragment's uv; replaces `color` when set. */
  texture?: Texture
}

/**
 * A trivial default {@link MeshShader}: Lambert diffuse from a single directional
 * light times a base colour or texture sample. Richer looks belong in the game.
 */
export class LambertMeshShader implements MeshShader {
  private baseR: number
  private baseG: number
  private baseB: number
  private lx: number
  private ly: number
  private lz: number
  private ambient: number
  private diffuse: number
  private texture: Texture | null

  /**
   * @param options - Shader parameters; see {@link LambertMeshShaderOptions}.
   */
  constructor(options: LambertMeshShaderOptions = {}) {
    this.baseR = options.color?.r ?? 180
    this.baseG = options.color?.g ?? 180
    this.baseB = options.color?.b ?? 180
    const light = options.light ?? { x: -0.4, y: -0.8, z: 0.45 }
    const ll = Math.hypot(light.x, light.y, light.z) || 1
    this.lx = light.x / ll
    this.ly = light.y / ll
    this.lz = light.z / ll
    this.ambient = options.ambient ?? 0.34
    this.diffuse = options.diffuse ?? 0.66
    this.texture = options.texture ?? null
  }

  shade(fragmentInput: Fragment, out: SurfaceColor): void {
    let nx = fragmentInput.normalX
    let ny = fragmentInput.normalY
    let nz = fragmentInput.normalZ
    const nl = Math.hypot(nx, ny, nz) || 1
    nx /= nl
    ny /= nl
    nz /= nl
    const ndotl = nx * this.lx + ny * this.ly + nz * this.lz
    const intensity = this.ambient + (ndotl > 0 ? ndotl : 0) * this.diffuse

    let r = this.baseR
    let g = this.baseG
    let b = this.baseB
    if (this.texture) {
      this.texture.sampleInto(fragmentInput.u, fragmentInput.v, out)
      r = out.r
      g = out.g
      b = out.b
    }
    out.r = r * intensity
    out.g = g * intensity
    out.b = b * intensity
  }
}

/** Shading mode selected by {@link LitMeshShader.mode}: `lambert`, `phong`, `toon`, or `normals`. */
export type LitMeshShaderMode = "lambert" | "phong" | "toon" | "normals"

/** Options for {@link LitMeshShader}. */
export interface LitMeshShaderOptions {
  /** Direction toward the key light (world space); normalised on construction. */
  light: { x: number; y: number; z: number }
  /** Ambient intensity (0–1). Default 0.3. */
  ambient?: number
  /** Diffuse intensity (0–1). Default 0.7. */
  diffuse?: number
  /** Blinn-Phong specular exponent (phong mode only). Default 24. */
  shininess?: number
  /** Blinn-Phong specular strength (phong mode only). Default 0.7. */
  specular?: number
}

/** Quantise a 0–1 term into `steps` hard bands for the toon look. */
function band(value: number, steps: number): number {
  return Math.round(value * steps) / steps
}

/**
 * One directional light with four switchable modes (Lambert diffuse, Blinn-Phong
 * specular, toon bands, normal debug), optional texture, optional shadow-map
 * lookup, and per-draw emissive glow. Material + mode are mutated before each
 * renderMesh call so a single instance shades multiple meshes. Math is inlined
 * (no per-fragment allocation) to match {@link LambertMeshShader}.
 */
export class LitMeshShader implements MeshShader {
  /** Per-draw state — set these before each renderMesh call. */
  mode: LitMeshShaderMode = "lambert"
  /** Base colour red (0–255). */
  baseR = 180
  /** Base colour green (0–255). */
  baseG = 180
  /** Base colour blue (0–255). */
  baseB = 180
  /** Emissive glow added to every shaded fragment (0–1). */
  emissive = 0
  /** Optional texture sampled by the fragment's uv; replaces the base colour when set. */
  texture: Texture | null = null
  /** Optional shadow map for cast/self-shadow lookups. */
  shadowMap: ShadowMap | null = null
  /** Camera position in world space, for the specular view direction (phong mode). */
  viewX = 0
  /** Camera world Y for the specular view direction (phong mode). */
  viewY = 0
  /** Camera world Z for the specular view direction (phong mode). */
  viewZ = 0

  private lx = 0
  private ly = 0
  private lz = 1
  private readonly ambient: number
  private readonly diffuse: number
  private readonly shininess: number
  private readonly specular: number

  /**
   * @param options - Shader parameters; see {@link LitMeshShaderOptions}.
   */
  constructor(options: LitMeshShaderOptions) {
    this.setLight(options.light.x, options.light.y, options.light.z)
    this.ambient = options.ambient ?? 0.3
    this.diffuse = options.diffuse ?? 0.7
    this.shininess = options.shininess ?? 24
    this.specular = options.specular ?? 0.7
  }

  /**
   * Set the key-light direction (world space); normalised internally.
   *
   * @param x - Light direction X.
   * @param y - Light direction Y.
   * @param z - Light direction Z.
   */
  setLight(x: number, y: number, z: number): void {
    const l = Math.hypot(x, y, z) || 1
    this.lx = x / l
    this.ly = y / l
    this.lz = z / l
  }

  /**
   * Set the base colour and emissive glow for the next draw.
   *
   * @param r - Base red (0–255).
   * @param g - Base green (0–255).
   * @param b - Base blue (0–255).
   * @param emissive - Emissive glow (0–1); default 0.
   */
  setMaterial(r: number, g: number, b: number, emissive = 0): void {
    this.baseR = r
    this.baseG = g
    this.baseB = b
    this.emissive = emissive
  }

  shade(fragment: Fragment, out: SurfaceColor): void {
    let nx = fragment.normalX
    let ny = fragment.normalY
    let nz = fragment.normalZ
    const nl = Math.hypot(nx, ny, nz) || 1
    nx /= nl
    ny /= nl
    nz /= nl

    if (this.mode === "normals") {
      out.r = (nx * 0.5 + 0.5) * 255
      out.g = (ny * 0.5 + 0.5) * 255
      out.b = (nz * 0.5 + 0.5) * 255
      return
    }

    let r = this.baseR
    let g = this.baseG
    let b = this.baseB
    if (this.texture) {
      this.texture.sampleInto(fragment.u, fragment.v, out)
      r = out.r
      g = out.g
      b = out.b
    }

    const ndotl = Math.max(0, nx * this.lx + ny * this.ly + nz * this.lz)
    const lit = this.shadowMap ? this.shadowMap.shadowAt(fragment.worldX, fragment.worldY, fragment.worldZ, ndotl) : 1
    const direct = ndotl * lit

    let intensity: number
    let spec = 0
    if (this.mode === "toon") {
      intensity = this.ambient + band(direct, 3) * this.diffuse
    } else {
      intensity = this.ambient + direct * this.diffuse
      if (this.mode === "phong" && direct > 0) {
        let vx = this.viewX - fragment.worldX
        let vy = this.viewY - fragment.worldY
        let vz = this.viewZ - fragment.worldZ
        const vlen = Math.hypot(vx, vy, vz) || 1
        vx /= vlen
        vy /= vlen
        vz /= vlen
        let hx = this.lx + vx
        let hy = this.ly + vy
        let hz = this.lz + vz
        const hlen = Math.hypot(hx, hy, hz) || 1
        hx /= hlen
        hy /= hlen
        hz /= hlen
        const ndoth = Math.max(0, nx * hx + ny * hy + nz * hz)
        spec = lit * this.specular * ndoth ** this.shininess
      }
    }

    const glow = this.emissive * 190
    const highlight = spec * 255
    out.r = r * intensity + glow + highlight
    out.g = g * intensity + glow + highlight
    out.b = b * intensity + glow + highlight
  }
}
