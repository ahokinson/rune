import { lathe, type Mesh, mergeParts, sweepTube } from "@ahokinson/rune"

// A self-contained Utah-style teapot built from curve-driven surfaces — no
// external asset. The body and lid are surfaces of revolution lathed from an
// authored Catmull–Rom profile; the spout and handle are tubes swept along
// Catmull–Rom paths. All parts carry smooth analytic normals and uvs and merge
// into one indexed {@link Mesh}. (The classic Newell teapot ships as a 306-point
// Bézier-patch dataset; that data isn't retrievable here, so the silhouette is
// hand-authored to read as the same iconic pot.)

// Build the teapot. `quality` scales tessellation (segments around the body and
// samples along each curve).
export function makeTeapot(quality = 1): Mesh {
  const radial = Math.max(12, Math.round(28 * quality))
  const profileSamples = Math.max(4, Math.round(8 * quality))

  // Body silhouette (radius, height) from the bottom centre up to the neck. The
  // duplicated centre point caps the base; the bulge peaks near y = -0.05.
  const body = lathe(
    [
      [0.0, -0.42],
      [0.16, -0.42],
      [0.34, -0.4],
      [0.5, -0.16],
      [0.52, 0.02],
      [0.42, 0.2],
      [0.3, 0.28],
      [0.3, 0.3],
    ],
    radial,
    profileSamples,
    0,
  )

  // Lid: a low dome with a knob, lathed from its own profile sitting on the neck.
  const lid = lathe(
    [
      [0.3, 0.3],
      [0.26, 0.34],
      [0.12, 0.4],
      [0.06, 0.44],
      [0.1, 0.5],
      [0.06, 0.54],
      [0.0, 0.55],
    ],
    radial,
    Math.max(3, Math.round(profileSamples * 0.75)),
    0.7,
  )

  // Spout: a tube curving out and up from the body's +x side, tapering to the tip.
  const spout = sweepTube(
    [
      [0.32, -0.08, 0],
      [0.5, -0.04, 0],
      [0.62, 0.08, 0],
      [0.72, 0.22, 0],
    ],
    (t) => 0.13 - 0.09 * t,
    Math.max(6, Math.round(10 * quality)),
    Math.max(8, radial >> 1),
  )

  // Handle: a tube arching off the -x side, top anchor down to bottom anchor.
  const handle = sweepTube(
    [
      [-0.3, 0.22, 0],
      [-0.52, 0.16, 0],
      [-0.58, -0.02, 0],
      [-0.5, -0.2, 0],
      [-0.28, -0.24, 0],
    ],
    () => 0.05,
    Math.max(8, Math.round(12 * quality)),
    Math.max(8, radial >> 1),
  )

  return mergeParts([body, lid, spout, handle])
}
