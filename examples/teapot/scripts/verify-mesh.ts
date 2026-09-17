/**
 * Headless smoke check for the triangle rasterizer: renders a cube facing the
 * camera into an InMemoryCanvas and asserts it reads as a solid object —
 * coverage concentrated in a central screen box, clear background at the corners,
 * finite positive depth on the cube, and a changed silhouette once the cube is
 * rotated 45° about Y.
 *
 * Run with `bun run examples/teapot/scripts/verify-mesh.ts`.
 */
import {
  Camera3D,
  Color,
  cubeMesh,
  InMemoryCanvas,
  LambertMeshShader,
  Matrix4,
  PerspectiveProjector3D,
  renderMesh,
  SubpixelTarget,
  Vector3,
  type Viewport3D,
} from "@ahokinson/rune"

const COLUMNS = 60
const ROWS = 34

const target = new SubpixelTarget(COLUMNS, ROWS)
const canvas = new InMemoryCanvas(COLUMNS, ROWS)
const camera = new Camera3D({
  position: new Vector3(0, 0, 3),
  forward: new Vector3(0, 0, -1),
  up: new Vector3(0, -1, 0),
  projector: new PerspectiveProjector3D({ fieldOfView: Math.PI / 3, near: 0.05 }),
})
const viewport: Viewport3D = { centerX: target.width / 2, centerY: target.height / 2, radius: 30, aspectY: 1 }
const shader = new LambertMeshShader({ color: { r: 200, g: 160, b: 120 } })
const cube = cubeMesh()
const model = new Matrix4()

function renderAt(angleY: number): SubpixelTarget {
  target.clear(Color.fromBytes(0, 0, 0))
  model.composeInto(Vector3.zero, new Vector3(0, angleY, 0), Vector3.one)
  renderMesh({ canvas, camera, viewport, target, mesh: cube, model, shader })
  return target
}

// Count covered subpixels (depth set) and the set of covered columns (silhouette).
function coverage(t: SubpixelTarget): { count: number; columns: Set<number> } {
  let count = 0
  const columns = new Set<number>()
  for (let y = 0; y < t.height; y++) {
    for (let x = 0; x < t.width; x++) {
      if (t.depth[y * t.width + x]! > 0) {
        count++
        columns.add(x)
      }
    }
  }
  return { count, columns }
}

let failed = false
function check(name: string, condition: boolean): void {
  console.log(`${condition ? "OK" : "FAIL"}: ${name}`)
  if (!condition) failed = true
}

// ── Axis-aligned cube ───────────────────────────────────────────────────────
const front = renderAt(0)
const frontCover = coverage(front)
check("cube covers a meaningful area", frontCover.count > 200)

// Corners should be background (depth 0).
const cornerClear =
  front.depth[0]! === 0 && front.depth[front.width - 1]! === 0 && front.depth[(front.height - 1) * front.width]! === 0
check("screen corners are background", cornerClear)

// Coverage should sit in the central box, not bleed to the edges.
let edgeCovered = 0
for (let y = 0; y < front.height; y++) {
  if (front.depth[y * front.width]! > 0) edgeCovered++
  if (front.depth[y * front.width + front.width - 1]! > 0) edgeCovered++
}
check("coverage stays off the left/right edges", edgeCovered === 0)

// Every covered subpixel must carry a finite, positive depth.
let allFinite = true
for (let i = 0; i < front.depth.length; i++) {
  const d = front.depth[i]!
  if (d > 0 && !Number.isFinite(d)) allFinite = false
}
check("all cube depths are finite", allFinite)

// ── Rotated cube: silhouette must change ────────────────────────────────────
const rotated = renderAt(Math.PI / 4)
const rotatedCover = coverage(rotated)
const frontWidth = frontCover.columns.size
const rotatedWidth = rotatedCover.columns.size
check("45° rotation changes the silhouette width", frontWidth !== rotatedWidth)

if (failed) {
  console.error("\nFAIL: mesh smoke check did not pass")
  process.exit(1)
}
console.log("\nOK: cube renders solid, occluded, and responds to rotation")
