import {
  type ActionSnapshot,
  ColliderKind,
  checkerTexture,
  colliderFor,
  cubeMesh,
  type Draw3DContext,
  Entity3D,
  type Fragment,
  LitMeshShader,
  type LitMeshShaderMode,
  Matrix4,
  type Mesh,
  type MeshShader,
  type MouseSnapshot,
  OrbitControl,
  planeMesh,
  RigidBody3D,
  renderMesh,
  ShadowMap,
  type SurfaceColor,
  sphereMesh,
  type Texture,
  torusMesh,
  uvGridTexture,
  Vector3,
  type Viewport3D,
} from "@ahokinson/rune"
import { makeMarbleTexture } from "../../shared/textures"
import type { MeshAction } from "../actions"
import { loadTeapot } from "../geometry/load"

export interface NamedMesh {
  name: string
  mesh: Mesh
  // Which collider shape the physics sim uses for this mesh: the sphere rolls,
  // the cube settles on a face, the curvy meshes rest on their real silhouette.
  collider: ColliderKind
}

// The meshes the viewer cycles through. Built once at module load; the teapot is
// the headline, so it leads.
const MESHES: NamedMesh[] = [
  { name: "Teapot", mesh: loadTeapot(), collider: ColliderKind.Mesh },
  { name: "Cube", mesh: cubeMesh(), collider: ColliderKind.Box },
  { name: "Sphere", mesh: sphereMesh({ radius: 0.6, segments: 28 }), collider: ColliderKind.Sphere },
  { name: "Torus", mesh: torusMesh(), collider: ColliderKind.Mesh },
]

// The shading modes the viewer cycles through with the shader key. Wireframe
// stays a separate toggle (handled in MeshEntity), so it is not listed here.
const SHADER_MODES: readonly LitMeshShaderMode[] = ["lambert", "phong", "toon", "normals"]

// Procedural textures the viewer cycles through. There is no image asset, so each
// is generated once into an RGBA Texture (rune's nearest-neighbour, wrapping
// sampler). `null` is the "flat colour" entry — the shader falls back to the
// material colour. Built once at module load.
interface NamedTexture {
  name: string
  texture: Texture | null
}

// Order the viewer cycles through: flat first (the original look), then patterns.
const TEXTURES: readonly NamedTexture[] = [
  { name: "flat", texture: null },
  { name: "checker", texture: checkerTexture() },
  { name: "uv grid", texture: uvGridTexture() },
  { name: "marble", texture: makeMarbleTexture() },
]

// Radians of auto-spin per second about the Y axis.
const SPIN_PER_SECOND = 0.7
// Horizontal speed handed to a body when physics turns on, so it travels across
// the floor instead of landing in place — enough for the sphere to roll.
const PHYSICS_LAUNCH = 0.9
// Resting tilt about X so the top of the mesh stays visible; drag adjusts it.
const TILT_X = 0.45
// Drag sensitivity: radians of yaw/pitch per cell the cursor moves.
const DRAG_YAW_PER_CELL = 0.02
const DRAG_PITCH_PER_CELL = 0.02
// Pitch is clamped so the mesh nods but never flips past the poles.
const PITCH_LIMIT = 1.4
// Ticks to hold still after releasing a drag before the auto-spin resumes.
const RESUME_DELAY_TICKS = 36
// Per-tick ease used to glide the tilt back to its resting angle once spinning.
const TILT_RESUME_EASE = 0.08

// Direction toward the key light, shared by the surface shader and the shadow
// map so the cast shadow lines up with the highlight.
const LIGHT = { x: -0.4, y: -0.8, z: 0.5 }
// Warm beige headline mesh on a cool neutral floor.
const MESH_COLOR = { r: 205, g: 170, b: 130 }
const FLOOR_COLOR = { r: 120, g: 124, b: 134 }

// Wireframe draws every triangle edge in one flat colour (unlit) so toggling is
// always clearly distinct from the shaded solid — legible as lines on the
// low-poly meshes, a bright shell on the dense teapot.
const WIRE_SHADER: MeshShader = {
  shade(_fragment: Fragment, out: SurfaceColor): void {
    out.r = 110
    out.g = 230
    out.b = 170
  },
}

// The headline mesh as an Entity3D: it draws a spinning, Lambert-shaded mesh and
// its floor through the renderMesh rasterizer into the Scene3D's shared
// SubpixelTarget. It owns the demo's viewer state (current mesh, shader, texture,
// toggles) and its physics/turntable simulation; a sibling Hud entity reads that
// state to draw the overlay. The camera and render target belong to the scene.
export class MeshStage extends Entity3D {
  private readonly shader: LitMeshShader
  private readonly shadowMap: ShadowMap
  private readonly ground: Mesh = planeMesh()
  private readonly identity = new Matrix4()
  private readonly modelMatrix = new Matrix4()
  private readonly turntable = new Vector3(TILT_X, 0, 0)
  private readonly viewport: Viewport3D = { centerX: 0, centerY: 0, radius: 1, aspectY: 1 }

  private meshIndex = 0
  private shaderIndex = 0
  private textureIndex = 0
  private shadowsEnabled = true
  private wireframeEnabled = false
  private pausedState = false
  private physicsEnabled = false

  // Free-body sim: when enabled the mesh drops, bounces off the floor, tumbles,
  // and settles. Seeded from the turntable on toggle so there's no visual jump.
  private readonly body = new RigidBody3D()

  // Click-and-drag turntable: drives the mesh's yaw/pitch and auto-spin. The mesh
  // tilts about X but clamps symmetrically so it can nod past upright either way.
  private readonly orbit = new OrbitControl({
    yawSensitivity: DRAG_YAW_PER_CELL,
    pitchSensitivity: DRAG_PITCH_PER_CELL,
    restPitch: TILT_X,
    minPitch: -PITCH_LIMIT,
    maxPitch: PITCH_LIMIT,
    spinPerSecond: SPIN_PER_SECOND,
    resumeDelayTicks: RESUME_DELAY_TICKS,
    tiltResumeEase: TILT_RESUME_EASE,
  })

  constructor(
    private readonly controls: ActionSnapshot<MeshAction>,
    private readonly mouse: MouseSnapshot,
  ) {
    super()
    this.shader = new LitMeshShader({ light: LIGHT })
    this.shadowMap = new ShadowMap({ light: LIGHT, focus: { x: 0, y: 0.4, z: 0 }, extent: 2.6 })
  }

  // --- State the Hud reads ----------------------------------------------------
  get current(): NamedMesh {
    return MESHES[this.meshIndex]!
  }
  get wireframe(): boolean {
    return this.wireframeEnabled
  }
  get paused(): boolean {
    return this.pausedState
  }
  get look(): string {
    if (this.wireframeEnabled) return "wireframe"
    const shadows = this.shadowsEnabled ? " · shadows" : ""
    return `${SHADER_MODES[this.shaderIndex]} · ${TEXTURES[this.textureIndex]!.name}${shadows}`
  }
  get chips(): string {
    if (this.physicsEnabled) return ` · ${this.current.collider} collider${this.body.resting ? " · settled" : ""}`
    return this.orbit.dragging ? " · orbiting" : ""
  }

  // Apply discrete (edge-triggered) actions. Called from the fixed-step update;
  // the engine delivers each press to exactly one tick, so a toggle fires once
  // however many sub-steps a frame runs.
  private readActions(): void {
    if (this.controls.wasPressed("nextMesh")) this.meshIndex = (this.meshIndex + 1) % MESHES.length
    if (this.controls.wasPressed("prevMesh")) this.meshIndex = (this.meshIndex + MESHES.length - 1) % MESHES.length
    if (this.controls.wasPressed("cycleShader")) this.shaderIndex = (this.shaderIndex + 1) % SHADER_MODES.length
    if (this.controls.wasPressed("cycleTexture")) this.textureIndex = (this.textureIndex + 1) % TEXTURES.length
    if (this.controls.wasPressed("toggleShadows")) this.shadowsEnabled = !this.shadowsEnabled
    if (this.controls.wasPressed("toggleWireframe")) this.wireframeEnabled = !this.wireframeEnabled
    if (this.controls.wasPressed("togglePause")) this.pausedState = !this.pausedState
    if (this.controls.wasPressed("togglePhysics")) {
      this.physicsEnabled = !this.physicsEnabled
      if (this.physicsEnabled) this.dropCurrentMesh()
    }
    // Re-drop when the mesh changes mid-sim so the new shape falls in fresh.
    if (this.physicsEnabled && (this.controls.wasPressed("nextMesh") || this.controls.wasPressed("prevMesh"))) {
      this.dropCurrentMesh()
    }
  }

  // Seed the rigid body from the current mesh and turntable pose so it drops in
  // from exactly where the spinning mesh was, inheriting its spin as tumble.
  private dropCurrentMesh(): void {
    const named = MESHES[this.meshIndex]!
    const collider = colliderFor(named.mesh, named.collider)
    this.body.setCollider(collider)
    this.body.wake()
    this.body.position.set(0, 0, 0)
    this.body.orientation.setFromEuler(this.orbit.pitch, this.orbit.yaw, 0)
    this.body.velocity.set(PHYSICS_LAUNCH, 0, 0)
    this.body.angularVelocity.set(SPIN_PER_SECOND * 0.5, SPIN_PER_SECOND, SPIN_PER_SECOND * 0.25)
  }

  override update(deltaMilliseconds: number): void {
    this.readActions()
    if (this.physicsEnabled) this.body.step(deltaMilliseconds / 1000)
    else this.orbit.update(this.mouse, deltaMilliseconds, this.pausedState)
  }

  override draw(ctx: Draw3DContext): void {
    const target = ctx.target
    if (!target) return
    const viewport = this.viewport
    viewport.centerX = target.width / 2
    viewport.centerY = target.height / 2
    viewport.radius = Math.min(target.width, target.height) * 0.5

    // Keep the shader's view position in step with the scene camera so highlights
    // track as the camera (or projector) changes.
    this.shader.viewX = ctx.camera.position.x
    this.shader.viewY = ctx.camera.position.y
    this.shader.viewZ = ctx.camera.position.z

    if (this.physicsEnabled) {
      this.modelMatrix.composeQuaternionInto(this.body.position, this.body.orientation, Vector3.one)
    } else {
      this.turntable.set(this.orbit.pitch, this.orbit.yaw, 0)
      this.modelMatrix.composeInto(Vector3.zero, this.turntable, Vector3.one)
    }

    const current = MESHES[this.meshIndex]!

    if (this.wireframeEnabled) {
      // Wireframe is an x-ray inspection mode: just the mesh shell, no stage.
      renderMesh({
        canvas: ctx.canvas,
        camera: ctx.camera,
        viewport,
        target,
        mesh: current.mesh,
        model: this.modelMatrix,
        shader: WIRE_SHADER,
        wireframe: true,
      })
      return
    }

    // Depth pass from the light: only the spinning mesh casts. Skipped (and the
    // shader's shadow lookup nulled) when shadows are off.
    if (this.shadowsEnabled) {
      this.shadowMap.render([{ mesh: current.mesh, model: this.modelMatrix }])
    }
    this.shader.mode = SHADER_MODES[this.shaderIndex]!
    this.shader.shadowMap = this.shadowsEnabled ? this.shadowMap : null

    // Mesh first (no canvas → no resolve), then the floor with the canvas so the
    // shared target — mesh + floor + shadows, depth-tested together — blits once.
    this.shader.texture = TEXTURES[this.textureIndex]!.texture
    this.shader.setMaterial(MESH_COLOR.r, MESH_COLOR.g, MESH_COLOR.b)
    renderMesh({
      camera: ctx.camera,
      viewport,
      target,
      mesh: current.mesh,
      model: this.modelMatrix,
      shader: this.shader,
    })
    this.shader.texture = null
    this.shader.setMaterial(FLOOR_COLOR.r, FLOOR_COLOR.g, FLOOR_COLOR.b)
    renderMesh({
      canvas: ctx.canvas,
      camera: ctx.camera,
      viewport,
      target,
      mesh: this.ground,
      model: this.identity,
      shader: this.shader,
    })
  }
}
