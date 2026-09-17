/**
 * Microbenchmark for renderMesh: spins a ~2k-triangle mesh at a 200×60 viewport
 * and reports milliseconds per frame. Anchor for comparison: the grid raycaster
 * shades a comparable scene in ~1.19 ms. A stable number across frames also
 * confirms the no-per-frame-allocation discipline held (no GC sawtooth).
 *
 * Run with `bun run examples/teapot/scripts/bench-mesh.ts`.
 */
import {
  Camera3D,
  Color,
  InMemoryCanvas,
  LambertMeshShader,
  Matrix4,
  PerspectiveProjector3D,
  renderMesh,
  SubpixelTarget,
  triangleCount,
  Vector3,
  type Viewport3D,
} from "@ahokinson/rune"
import { loadTeapot } from "../geometry/load"

const COLUMNS = 200
const ROWS = 60
const FRAMES = 600

const target = new SubpixelTarget(COLUMNS, ROWS)
const canvas = new InMemoryCanvas(COLUMNS, ROWS)
const camera = new Camera3D({
  position: new Vector3(0, 0, 2.4),
  forward: new Vector3(0, 0, -1),
  up: new Vector3(0, -1, 0),
  projector: new PerspectiveProjector3D({ fieldOfView: Math.PI / 3, near: 0.05 }),
})
const viewport: Viewport3D = { centerX: target.width / 2, centerY: target.height / 2, radius: 50, aspectY: 1 }
const shader = new LambertMeshShader({ color: { r: 200, g: 160, b: 120 } })
const mesh = loadTeapot()
const model = new Matrix4()
const rotation = new Vector3(0, 0, 0)
const clear = Color.fromBytes(8, 10, 14)

function frame(angle: number): void {
  target.clear(clear)
  rotation.set(0.4, angle, 0)
  model.composeInto(Vector3.zero, rotation, Vector3.one)
  renderMesh({ canvas, camera, viewport, target, mesh, model, shader })
}

// Warm up the JIT.
for (let i = 0; i < 60; i++) frame(i * 0.02)

const start = performance.now()
for (let i = 0; i < FRAMES; i++) frame(i * 0.02)
const elapsed = performance.now() - start

const perFrame = elapsed / FRAMES
console.log(`mesh: ${triangleCount(mesh)} tris at ${COLUMNS}×${ROWS}`)
console.log(`frames: ${FRAMES}`)
console.log(`total: ${elapsed.toFixed(1)} ms`)
console.log(`per frame: ${perFrame.toFixed(3)} ms  (${(1000 / perFrame).toFixed(0)} fps)`)
