import {
  type CanvasSurface,
  Color,
  drawBox,
  lambert,
  type SurfaceCellResult,
  type SurfaceSample,
  type SurfaceSampler,
  type Viewport3D,
} from "@ahokinson/rune"
import { cloudAt } from "./clouds"
import { sampleLand } from "./landmask"
import { ASPECT_Y, LIGHT, LIGHT_PLANE_X, LIGHT_PLANE_Y } from "./projection"
import {
  ATMO,
  ATMO_DIM,
  CLOUD,
  FRAME_DIM,
  LAND_DIM,
  LAND_HOT,
  LAND_LIT,
  LAND_MID,
  OCEAN_DIM,
  OCEAN_LIT,
  SWEEP,
} from "./theme"

const BLACK = Color.BLACK

type RGB = [number, number, number]

// Blend two RGB tuples by t (0..1).
function lerp3(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// Blend an RGB tuple toward another by t (0..1) and pack it into a Color.
function mix(a: RGB, b: RGB, t: number): Color {
  const [r, g, bl] = lerp3(a, b, t)
  return Color.fromBytes(r, g, bl)
}

// Each cell renders as a braille glyph (rune's BRAILLE_BITS) packing a 2x4
// sub-pixel grid, giving 2x horizontal and 4x vertical resolution over plain
// cells. Each of the 8 dots independently samples the high-res land mask, so the
// dot pattern traces the actual coastline shape through the cell. Lighting only
// drives the cell colour (braille carries one colour per glyph).
// Sparse pattern that gives the ocean a faint stipple so the sphere's disc still
// reads, without competing with the solid landmasses.
const OCEAN_STIPPLE = [
  [1, 0],
  [0, 0],
  [0, 1],
  [0, 0],
]

// Phosphor scan sweep: a bright band travels down through the globe and wraps,
// briefly energising the surface it crosses. SWEEP_TRAIL is its height in rows;
// SWEEP_SPEED is rows/frame; SWEEP_GAP pauses it after it leaves the disc.
const SWEEP_SPEED = 0.3
const SWEEP_TRAIL = 7
const SWEEP_GAP = 26

// A sub-pixel dot lights as cloud once coverage passes this, so wisps stipple in
// over open ocean (land already fills its dots from the coastline mask).
const CLOUD_DOT = 0.45

// The globe surface as an engine SurfaceSampler: the engine's SurfaceMesh3D walks
// the disc and runs the 2x4 braille sub-pixel grid per cell, calling these hooks
// so all the land-mask sampling, lighting, sweep and colour logic stays here. The
// engine owns the per-cell inverse projection, braille packing, canvas write and
// depth write. Call `beginFrame` once per frame before World3D.draw.
export interface GlobeSurfaceSampler extends SurfaceSampler {
  beginFrame(tick: number, viewport: Viewport3D): void
}

export function createGlobeSurfaceSampler(): GlobeSurfaceSampler {
  // Per-frame sweep + tick state.
  let sweepHead = 0
  let frameTick = 0
  // Per-cell sweep strength + sub-pixel accumulators (reset in beginCell).
  let sweep = 0
  let bits = 0
  let bSum = 0
  let nzSum = 0
  let n = 0
  let landN = 0
  let cloudSum = 0

  return {
    beginFrame(tick: number, viewport: Viewport3D): void {
      frameTick = tick
      const rY = Math.ceil(viewport.radius * viewport.aspectY)
      const y0 = Math.floor(viewport.centerY - rY) - 1
      const y1 = Math.ceil(viewport.centerY + rY) + 1
      const sweepRange = y1 - y0 + SWEEP_GAP
      sweepHead = y0 + ((tick * SWEEP_SPEED) % sweepRange)
    },

    beginCell(_cx: number, cy: number): void {
      // How strongly the sweep is energising this row (1 at the head, fading up).
      const sd = sweepHead - cy
      sweep = sd >= 0 && sd < SWEEP_TRAIL ? 1 - sd / SWEEP_TRAIL : 0
      bits = 0
      bSum = 0
      nzSum = 0
      n = 0
      landN = 0
      cloudSum = 0
    },

    subpixel(sample: SurfaceSample, row: number, col: number, bit: number): void {
      const nz = sample.normal.z
      const limb = Math.min(1, nz / 0.35)
      const light = lambert(sample.normal, LIGHT) * (0.55 + 0.45 * limb)
      n++
      bSum += light
      nzSum += nz

      const cloud = cloudAt(sample.theta, sample.phi, frameTick)
      cloudSum += cloud

      if (sampleLand(sample.theta, sample.phi)) {
        landN++
        bits |= bit // land: dot follows the coastline shape
      } else if ((OCEAN_STIPPLE[row]![col]! && light > 0.35) || sweep > 0.55 || cloud > CLOUD_DOT) {
        bits |= bit // ocean: faint stipple, solid under the sweep, wisps where clouds drift
      }
    },

    finishCell(out: SurfaceCellResult): boolean {
      if (bits === 0) return false

      const avg = bSum / n
      const lit = avg + sweep * 0.8
      // Cells near the disc edge (small nz) glow toward the atmosphere tint —
      // limb-brightening. Ocean takes more of it than land so continents stay
      // crisp while the rim reads as a lit blue halo.
      const rim = 1 - Math.min(1, nzSum / n / 0.45)

      // The sweep override stays a flat phosphor flash — clouds don't tint it.
      if (sweep > 0.85) {
        out.bits = bits
        out.fg = SWEEP
        out.bg = BLACK
        return true
      }

      let rgb: RGB
      if (landN > 0) {
        const base = lit > 0.85 ? LAND_HOT : lit > 0.6 ? LAND_LIT : lit > 0.4 ? LAND_MID : LAND_DIM
        rgb = lerp3(base, ATMO, rim * 0.35)
      } else {
        const base = sweep > 0.3 ? LAND_DIM : avg > 0.5 ? OCEAN_LIT : OCEAN_DIM
        rgb = lerp3(base, ATMO, rim * 0.7)
      }

      // Additive clouds: blend the surface colour toward the cloud tint by the
      // cell's coverage, scaled by day-side light so lit clouds glow brightest
      // and the night side keeps only a faint haze. Land and ocean read through.
      const cloud = cloudSum / n
      if (cloud > 0) {
        const day = 0.25 + 0.75 * Math.min(1, avg / 0.6)
        rgb = lerp3(rgb, CLOUD, Math.min(1, cloud * day))
      }

      out.bits = bits
      out.fg = Color.fromBytes(rgb[0], rgb[1], rgb[2])
      out.bg = BLACK
      return true
    },
  }
}

// Atmospheric halo: a blue glow hugging the disc, brightest on the limb the
// light grazes (a lit crescent, like air scattering around a lit sphere) and
// fading to a faint rim on the dark side. A slow breathe keeps it alive. This
// directional shading ties the halo to the globe's lighting so it reads as 3D
// rather than a flat ring.
export function drawAtmosphere(
  canvas: CanvasSurface,
  centerX: number,
  centerY: number,
  radius: number,
  tick: number,
): void {
  const outerRadius = radius * 1.32
  const breathe = 0.92 + 0.08 * Math.sin(tick * 0.05)
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - centerX
      const dy = (y - centerY) / ASPECT_Y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= radius || dist >= outerRadius) continue

      // 1 at the rim, 0 at the outer edge; squared for a tighter, brighter ring.
      const t = (dist - radius) / (outerRadius - radius)
      const radial = (1 - t) * (1 - t)

      // Outward direction at this cell vs. the light's screen-plane direction:
      // bright lit crescent where they align, faint floor on the dark limb.
      const lightDot = (dx / dist) * LIGHT_PLANE_X + (dy / dist) * LIGHT_PLANE_Y
      const dir = 0.18 + 0.82 * Math.max(0, lightDot)

      const intensity = radial * dir * breathe
      if (intensity < 0.06) continue

      const ch = intensity > 0.5 ? "▒" : "░"
      // Tone toward the bright atmosphere at the rim, then fade toward black
      // outward so the halo dissolves into the background.
      const toned = lerp3(ATMO_DIM, ATMO, intensity)
      canvas.setCell(x, y, ch, mix([0, 0, 0], toned, 0.3 + 0.7 * intensity), BLACK)
    }
  }
}

export function drawBorderBox(canvas: CanvasSurface, width: number, height: number): void {
  drawBox(canvas, 0, 0, width, height, "single", FRAME_DIM, BLACK)

  canvas.setCell(0, 1, "├", FRAME_DIM, BLACK)
  canvas.setCell(width - 1, 1, "┤", FRAME_DIM, BLACK)
  canvas.setCell(0, height - 2, "├", FRAME_DIM, BLACK)
  canvas.setCell(width - 1, height - 2, "┤", FRAME_DIM, BLACK)

  canvas.setCell(1, 1, "─", FRAME_DIM, BLACK)
  canvas.setCell(width - 2, 1, "─", FRAME_DIM, BLACK)
}
