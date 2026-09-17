import { Noise3D } from "@ahokinson/rune"

// A drifting cloud field over the globe, built on rune's value-noise fbm. The
// field is sampled at the surface point's 3D position (from the engine's
// theta/phi) rather than a 2D lon/lat grid, so it's seamless over the whole
// sphere — no wrap seam at the antimeridian, no pinch at the poles. Clouds drift
// zonally by slowly advancing the sample longitude with the frame tick, on top
// of the planet's own spin. render.ts blends the returned coverage additively
// toward the cloud tint, so land and ocean still read through it.
const field = new Noise3D(0xc10d)

const FREQUENCY = 2.6 // spatial scale of cloud cells (higher = smaller puffs)
// Zonal wind, radians/tick. NEGATIVE so the field advects east — the same sense
// as the globe's prograde spin (sphereProjection adds +rotation to phi), so the
// clouds drift with the surface rather than against it. |DRIFT| is well under
// SPIN_SPEED (0.008), so they advect a touch slower than the solid ground and
// read as a gentle weather drift over the continents.
const DRIFT = -0.0011
const COVERAGE = 0.5 // fbm below this is clear sky
const SOFTNESS = 0.24 // soft-edge width above the threshold before full coverage

// Cloud coverage in [0, 1] at a geographic point (radians) for the given frame.
// 0 = clear, 1 = thick. theta is elevation (+π/2 at the +y pole), phi azimuth.
export function cloudAt(theta: number, phi: number, tick: number): number {
  // Advance longitude with time so the puffs glide west→east, then place the
  // sample on the unit sphere (y is the pole axis, matching equirectTexel).
  const lon = phi + tick * DRIFT
  const cosTheta = Math.cos(theta)
  const x = cosTheta * Math.cos(lon)
  const y = Math.sin(theta)
  const z = cosTheta * Math.sin(lon)

  const density = field.fbm(x * FREQUENCY, y * FREQUENCY, z * FREQUENCY, 4)
  const coverage = (density - COVERAGE) / SOFTNESS
  return coverage <= 0 ? 0 : coverage >= 1 ? 1 : coverage
}
