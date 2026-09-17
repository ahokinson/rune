/**
 * Catmull–Rom splines: smooth interpolation through a set of knots, used both as
 * a scalar easing primitive and to densify control points into a polyline that
 * procedural mesh builders (lathe, sweep) revolve or sweep.
 *
 * @module
 */

/**
 * Catmull–Rom interpolation of one scalar lane between p1 and p2. p0 and p3 are
 * the neighbouring knots that set the tangents, t runs 0..1 across the p1→p2
 * span.
 *
 * @param p0 - Neighbouring knot before p1 (sets the incoming tangent).
 * @param p1 - Start of the span.
 * @param p2 - End of the span.
 * @param p3 - Neighbouring knot after p2 (sets the outgoing tangent).
 * @param t - Interpolation factor 0..1 across the p1→p2 span.
 * @returns Interpolated scalar.
 */
export function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
}

/**
 * Sample a Catmull–Rom spline through `knots` (each an array of the same number
 * of lanes/dimensions) into a dense polyline of `samplesPerSegment` points per
 * span. End knots are duplicated so the curve passes through the first and last
 * knot. Works in any dimension — pass 2D [radius, height] profiles to {@link
 * lathe} or 3D [x, y, z] paths to {@link sweepTube}.
 *
 * @param knots - Control points, each an array of the same dimensionality.
 * @param samplesPerSegment - Points to sample per span between consecutive knots.
 * @returns Dense polyline as an array of points (same dimensionality as `knots`).
 */
export function sampleSpline(knots: number[][], samplesPerSegment: number): number[][] {
  const out: number[][] = []
  const n = knots.length
  for (let i = 0; i < n - 1; i++) {
    const p0 = knots[Math.max(0, i - 1)]!
    const p1 = knots[i]!
    const p2 = knots[i + 1]!
    const p3 = knots[Math.min(n - 1, i + 2)]!
    const steps = i === n - 2 ? samplesPerSegment : samplesPerSegment - 1
    for (let s = 0; s <= steps; s++) {
      const t = s / samplesPerSegment
      const point: number[] = []
      for (let d = 0; d < p1.length; d++) point.push(catmullRom(p0[d]!, p1[d]!, p2[d]!, p3[d]!, t))
      out.push(point)
    }
  }
  return out
}
