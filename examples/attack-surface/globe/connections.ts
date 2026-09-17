import {
  Angle,
  type CanvasSurface,
  Color,
  greatCircleAngle,
  type Particle3DStyle,
  PointCloud3D,
  type ProjectedPoint,
  slerpInto,
  sphericalToVector3,
  type Vector3,
  type Viewport3D,
} from "@ahokinson/rune"
import { camera3D } from "./projection"

export interface City {
  name: string
  lat: number
  lon: number
}

// The pool of nodes the threat feed draws attacks between.
export const CITIES: City[] = [
  { name: "NYC", lat: 40.7, lon: -74.0 },
  { name: "LON", lat: 51.5, lon: -0.1 },
  { name: "TKY", lat: 35.7, lon: 139.7 },
  { name: "SYD", lat: -33.9, lon: 151.2 },
  { name: "SAO", lat: -23.5, lon: -46.6 },
  { name: "MUM", lat: 19.1, lon: 72.9 },
  { name: "CAI", lat: 30.0, lon: 31.2 },
  { name: "PEK", lat: 39.9, lon: 116.4 },
  { name: "MSK", lat: 55.8, lon: 37.6 },
  { name: "LAX", lat: 34.0, lon: -118.2 },
  { name: "SIN", lat: 1.35, lon: 103.8 },
  { name: "FRA", lat: 50.1, lon: 8.7 },
  { name: "HKG", lat: 22.3, lon: 114.2 },
  { name: "DXB", lat: 25.2, lon: 55.3 },
  { name: "SEL", lat: 37.6, lon: 127.0 },
  { name: "TOR", lat: 43.7, lon: -79.4 },
  { name: "MEX", lat: 19.4, lon: -99.1 },
  { name: "JNB", lat: -26.2, lon: 28.0 },
  { name: "IST", lat: 41.0, lon: 28.9 },
  { name: "DEL", lat: 28.6, lon: 77.2 },
  { name: "CHI", lat: 41.9, lon: -87.6 },
  { name: "AMS", lat: 52.4, lon: 4.9 },
  { name: "BOG", lat: 4.7, lon: -74.1 },
  { name: "LOS", lat: 6.5, lon: 3.4 },
]

// Each city as a static unit direction on the sphere (geographic degrees -> the
// engine's radian theta/phi). Precomputed once; the engine projects them.
export const CITY_VECTORS: Vector3[] = CITIES.map((c) =>
  sphericalToVector3(Angle.fromDegrees(c.lat), Angle.fromDegrees(c.lon)),
)

export type RGB = [number, number, number]

// A single live attack to render: endpoints (indices into CITIES), the hue of
// its attack category, and the tick it spawned plus how many ticks it lives. The
// comet head lerps source -> target across `life`, so it makes exactly one trip
// that finishes as the attack expires; longer arcs read as faster.
export interface ArcSpec {
  src: number
  dst: number
  rgb: RGB
  born: number
  life: number
}

const CITY_DIM = Color.fromBytes(90, 130, 150)

// Colour for one comet cell. `glow` (0 at the trail's tail, 1 at the head) sets
// the overall brightness so the trail fades to black behind the particle; depth
// dims the far side of the globe; the head burns white-hot.
function arcCellColor([r, g, b]: RGB, depth: number, glow: number): Color {
  const depthF = 0.45 + 0.55 * Math.max(0, Math.min(1, depth))
  const bright = glow * depthF
  let cr = r * bright
  let cg = g * bright
  let cb = b * bright
  // White-hot core for the leading edge of the particle.
  const k = Math.max(0, (glow - 0.6) / 0.4) * 0.6
  cr += (255 - cr) * k
  cg += (255 - cg) * k
  cb += (255 - cb) * k
  return Color.fromBytes(cr, cg, cb)
}

function inBounds(canvas: CanvasSurface, x: number, y: number): boolean {
  return x >= 1 && x < canvas.width - 1 && y >= 1 && y < canvas.height - 1
}

// Faint markers for every node so the network reads even with no active attack.
// The engine projects + near-side culls them; the style only paints the glyph.
export function createCityPoints(): PointCloud3D {
  return new PointCloud3D(
    CITY_VECTORS,
    {
      draw(canvas: CanvasSurface, x: number, y: number): void {
        if (inBounds(canvas, x, y)) canvas.setCell(x, y, "◦", CITY_DIM, Color.BLACK)
      },
    },
    { minDepth: 0.1 },
  )
}

// Sample the point a fraction `t` (0 = source, 1 = target) along a bowed
// great-circle arc between two city directions, writing the unit direction into
// `out` and returning its radial altitude (>= 1). Longer arcs bow higher; the
// lift peaks at the midpoint (sin curve). The comet trail emits particles at
// these samples as its head sweeps the arc, so this is the spline the head rides.
export function sampleArc(out: Vector3, a: Vector3, b: Vector3, t: number): number {
  slerpInto(out, a, b, t)
  const liftAmt = 0.15 + 0.35 * (greatCircleAngle(a, b) / Math.PI)
  return 1 + liftAmt * Math.sin(t * Math.PI)
}

// Look of one trail particle. `lifeFraction` runs 0 (just emitted, at the comet
// head) -> 1 (oldest, fading out), so glow = (1 - lifeFraction) gives a sharp
// white-hot head and a soft tail that drains to black — the same falloff and
// glyph ramp the old analytic comet used, now carried by the particle's age.
export function createTrailStyle(): Particle3DStyle {
  return {
    draw(canvas, x, y, depth, lifeFraction, color): void {
      const glow = (1 - lifeFraction) ** 1.5
      if (glow <= 0.04) return
      if (x < 1 || x >= canvas.width - 1 || y < 1 || y >= canvas.height - 1) return
      const rgb: RGB = [color.red * 255, color.green * 255, color.blue * 255]
      const ch = glow > 0.6 ? "●" : glow > 0.22 ? "•" : "·"
      canvas.setCell(x, y, ch, arcCellColor(rgb, depth, glow), Color.BLACK)
    },
  }
}

// Animated targeting reticle that locks onto the most recent attack's target
// city. Four corner brackets snap inward over the first ~8 ticks (acquiring →
// locked), then hold with a gentle breathe; a callout names the target. Culled
// when the city rotates to the globe's far side. `age` is ticks since the lock
// began; `label` is the caller-formatted callout (it knows the city table).
const _ret: ProjectedPoint = { x: 0, y: 0, depth: 0 }
const RETICLE = Color.fromBytes(150, 250, 255)

export function drawTargetReticle(
  canvas: CanvasSurface,
  viewport: Viewport3D,
  cityIndex: number,
  age: number,
  label: string,
): void {
  if (cityIndex < 0) return
  const p = camera3D.projectInto(_ret, CITY_VECTORS[cityIndex]!, 1, viewport)
  if (!p || p.depth <= 0.12 || !inBounds(canvas, p.x, p.y)) return

  const lock = Math.min(1, age / 8)
  const gapX = Math.round(6 - 4 * lock)
  const gapY = Math.max(1, Math.round(gapX * 0.5))
  const x = p.x
  const y = p.y

  const corners = [
    [x - gapX, y - gapY, "⌜"],
    [x + gapX, y - gapY, "⌝"],
    [x - gapX, y + gapY, "⌞"],
    [x + gapX, y + gapY, "⌟"],
  ] as const
  for (const [cx, cy, ch] of corners) {
    if (inBounds(canvas, cx, cy)) canvas.setCell(cx, cy, ch, RETICLE, Color.BLACK)
  }

  // Callout to the right of the reticle, flipping left near the screen edge.
  const rightX = x + gapX + 2
  const lx = rightX + label.length < canvas.width - 1 ? rightX : x - gapX - 1 - label.length
  if (lx >= 1) canvas.drawText(lx, y, label, RETICLE, Color.BLACK)
}

// Endpoint glints for live attacks, drawn after the arcs: the source pulses as the
// comet departs, the target flares as it arrives. Kept here (not as engine
// geometry) because each depends on the per-arc comet head and the tick.
const _src: ProjectedPoint = { x: 0, y: 0, depth: 0 }
const _dst: ProjectedPoint = { x: 0, y: 0, depth: 0 }

export function drawAttackEndpoints(canvas: CanvasSurface, viewport: Viewport3D, arcs: ArcSpec[], tick: number): void {
  for (const arc of arcs) {
    const head = Math.min(1, (tick - arc.born) / arc.life)

    const src = camera3D.projectInto(_src, CITY_VECTORS[arc.src]!, 1, viewport)
    if (src && inBounds(canvas, src.x, src.y) && src.depth > 0.1) {
      const pulse = head < 0.15 ? 1 : 0.4 // brightest just after launch
      canvas.setCell(src.x, src.y, "◆", arcCellColor(arc.rgb, src.depth, 0.35 + 0.45 * pulse), Color.BLACK)
    }

    const dst = camera3D.projectInto(_dst, CITY_VECTORS[arc.dst]!, 1, viewport)
    if (dst && inBounds(canvas, dst.x, dst.y) && dst.depth > 0.1) {
      if (head > 0.85) {
        // Arrival flare: bright twinkling glyph plus a soft cross-halo.
        const glyph = (tick >> 1) % 2 === 0 ? "✦" : "✸"
        canvas.setCell(dst.x, dst.y, glyph, arcCellColor(arc.rgb, 1, 1), Color.BLACK)
        const halo = arcCellColor(arc.rgb, dst.depth, 0.4)
        for (const [hx, hy] of [
          [dst.x - 1, dst.y],
          [dst.x + 1, dst.y],
          [dst.x, dst.y - 1],
          [dst.x, dst.y + 1],
        ] as const) {
          if (inBounds(canvas, hx, hy)) canvas.setCell(hx, hy, "·", halo, Color.BLACK)
        }
      } else {
        canvas.setCell(dst.x, dst.y, "◇", arcCellColor(arc.rgb, dst.depth, 0.35), Color.BLACK)
      }
    }
  }
}
