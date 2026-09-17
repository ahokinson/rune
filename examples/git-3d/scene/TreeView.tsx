import {
  Camera3D,
  type CanvasSurface,
  Color,
  OrbitControl,
  Particles3D,
  PerspectiveProjector3D,
  Scene,
  Scene3D,
  SceneRenderer,
  useActions,
  useApplication,
  useFixedUpdate,
  useSceneEntities,
  Vector3,
  type Viewport3D,
  WorldView3D,
} from "@ahokinson/rune"
import { createSignal, type JSX, onMount } from "solid-js"
import { gourceBindings } from "../actions"
import { NotAGitRepositoryError, streamCommits } from "../git/log"
import { AuthorPalette } from "../palette"
import { Grove } from "./Grove"
import { Hud, type HudModel } from "./Hud"
import { Replay } from "./Replay"
import { Tree, type TreeNode } from "./Tree"

const CLEAR_COLOR = Color.fromBytes(10, 12, 20)
const FIELD_OF_VIEW = Math.PI / 3
// Resting tilt: look at the tree from a touch below the crown so it towers (up is −y).
const REST_PITCH = -0.12

// Frame the whole tree as it grows, clamped so a giant tree still fits.
const MIN_DISTANCE = 14
const MAX_DISTANCE = 120
const FRAME_EASE = 0.045

// Pollen sparks that drift up off a blossom when a commit lands on it.
const POLLEN_PER_FILE = 4
const MAX_POLLEN_FILES = 16
const POLLEN_LIFETIME_MS = 1100

class TreeWorldView extends WorldView3D {
  protected override viewportFor(canvas: CanvasSurface): Viewport3D {
    // Cell-space equivalent of the renderMesh viewport (y squashed 0.5 because a
    // cell holds two vertical subpixels) so the pollen projects onto the same tree.
    const radius = Math.min(canvas.width, canvas.height * 2) * 0.5
    return { centerX: canvas.width / 2, centerY: canvas.height / 2, radius, aspectY: 0.5 }
  }
}

const pollenStyle = {
  draw(canvas: CanvasSurface, x: number, y: number, _depth: number, life: number, color: Color): void {
    const glyph = life < 0.4 ? "✦" : life < 0.75 ? "·" : "˙"
    canvas.setCell(x, y, glyph, color)
  },
}

export function TreeView(): JSX.Element {
  return (
    <Scene name="git-3d">
      <TreeInner />
    </Scene>
  )
}

function TreeInner(): JSX.Element {
  const app = useApplication()
  const controls = useActions(gourceBindings)

  const tree = new Tree()
  const palette = new AuthorPalette()

  const camera = new Camera3D({
    position: new Vector3(0, -10, 28),
    forward: new Vector3(0, 0, -1),
    up: new Vector3(0, -1, 0),
    projector: new PerspectiveProjector3D({ fieldOfView: FIELD_OF_VIEW, near: 0.05 }),
  })
  const world = new Scene3D({ camera, subpixel: true, clearColor: CLEAR_COLOR })
  const grove = new Grove(tree)
  world.add(grove)

  // Pollen rides above the canopy (drawn after it), drifting gently up then out.
  const pollen = new Particles3D({
    style: pollenStyle,
    lifetimeMilliseconds: POLLEN_LIFETIME_MS,
    maximumParticles: 512,
    drift: new Vector3(0, 3, 0),
    zIndex: 10,
  })
  world.add(pollen)
  const view = new TreeWorldView({ world })

  const orbit = new OrbitControl({
    yawSensitivity: 0.012,
    pitchSensitivity: 0.012,
    restPitch: REST_PITCH,
    minPitch: -1.2,
    maxPitch: 0.6,
    spinPerSecond: 0.14,
    resumeDelayTicks: 48,
    tiltResumeEase: 0.04,
  })

  const leafScratch = new Vector3()
  // Puff pollen up off each blossom a commit touched.
  function pollenBurst(author: string, touched: TreeNode[]): void {
    const color = palette.colorFor(author)
    const count = Math.min(touched.length, MAX_POLLEN_FILES)
    for (let i = 0; i < count; i++) {
      const node = touched[i]!
      node.leafInto(leafScratch)
      pollen.origin.copyFrom(leafScratch)
      pollen.color = color
      for (let s = 0; s < POLLEN_PER_FILE; s++) {
        pollen.velocity.set((Math.random() - 0.5) * 3, -2 - Math.random() * 2, (Math.random() - 0.5) * 3)
        pollen.emit(1)
      }
    }
  }

  const replay = new Replay(tree, { onCommit: pollenBurst, onReset: () => {} })
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  const hud = new Hud(buildHudModel)

  function buildHudModel(): HudModel {
    const status = replay.status
    const commit = status.commit
    return {
      loading: loading(),
      error: error(),
      date: commit ? new Date(status.timestamp * 1000).toISOString().slice(0, 10) : "",
      hash: commit?.hash ?? "",
      subject: commit?.subject ?? "",
      author: commit?.author ?? "—",
      authorColor: commit ? palette.colorFor(commit.author) : Color.fromBytes(150, 200, 230),
      index: status.index,
      total: status.total,
      fileCount: tree.fileCount,
      speedLabel: status.speedLabel,
      paused: status.paused,
    }
  }

  // Eased framing: orbit a sphere around the tree's growing centroid at a distance
  // that keeps the whole crown in view.
  const center = new Vector3(0, -4, 0)
  const targetCenter = new Vector3()
  let framedDistance = 28

  function updateCamera(): void {
    const radius = tree.bounds(targetCenter)
    Vector3.lerpInto(center, center, targetCenter, FRAME_EASE)
    const wanted = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, (radius / Math.tan(FIELD_OF_VIEW / 2)) * 1.25))
    framedDistance += (wanted - framedDistance) * FRAME_EASE

    const cosPitch = Math.cos(orbit.pitch)
    const sinPitch = Math.sin(orbit.pitch)
    camera.position.set(
      center.x + framedDistance * cosPitch * Math.sin(orbit.yaw),
      center.y + framedDistance * sinPitch,
      center.z + framedDistance * cosPitch * Math.cos(orbit.yaw),
    )
    camera.forward.set(center.x - camera.position.x, center.y - camera.position.y, center.z - camera.position.z)
  }

  useFixedUpdate((deltaMilliseconds) => {
    const deltaSeconds = deltaMilliseconds / 1000
    // Discrete view/replay toggles: read in the fixed step, where the engine
    // delivers each press to exactly one tick.
    if (controls.wasPressed("togglePause")) replay.paused = !replay.paused
    if (controls.wasPressed("faster")) replay.faster()
    if (controls.wasPressed("slower")) replay.slower()
    if (controls.wasPressed("restart")) replay.restart()
    if (controls.wasPressed("toggleShadows")) grove.shadowsEnabled = !grove.shadowsEnabled
    if (controls.wasPressed("reframe")) {
      orbit.yaw = 0
      orbit.pitch = REST_PITCH
    }
    orbit.update(app.mouse, deltaMilliseconds, false)
    replay.update(deltaSeconds)
    tree.relayout()
    tree.step(deltaSeconds)
    updateCamera()
  })

  useSceneEntities(() => [view, hud])

  onMount(() => {
    streamCommits(undefined, {
      onCommit: (commit) => {
        replay.append(commit)
        if (loading()) setLoading(false)
      },
    })
      .then(() => setLoading(false))
      .catch((cause) => {
        const message =
          cause instanceof NotAGitRepositoryError
            ? "run git-3d from inside a git repository"
            : String(cause?.message ?? cause)
        setError(message)
        setLoading(false)
      })
  })

  return <SceneRenderer clearColor={CLEAR_COLOR} />
}
