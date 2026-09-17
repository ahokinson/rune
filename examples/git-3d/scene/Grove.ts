import {
  Color,
  type Draw3DContext,
  Entity3D,
  LitMeshShader,
  Matrix4,
  type Mesh,
  type ProjectedPoint,
  planeMesh,
  Quaternion,
  renderMesh,
  type ShadowCaster,
  ShadowMap,
  Vector3,
  type Viewport3D,
} from "@ahokinson/rune"
import { extensionColor } from "../palette"
import { makeCylinder } from "./cylinder"
import type { Tree, TreeNode } from "./Tree"
import { composeBranch } from "./trunk"

const LIGHT = { x: -0.45, y: -0.9, z: 0.4 }
const GROUND = { r: 16, g: 20, b: 16 }
const BARK = { r: 96, g: 66, b: 44 }
const BARK_DARK = { r: 64, g: 44, b: 30 }

// How many branches/leaves to draw at most, so a huge repo costs a bounded amount
// per frame (the rest are sampled out — the crown still reads).
const BRANCH_BUDGET = 900
const LEAF_BUDGET = 2200
// Branches thinner/shorter than this aren't worth a tube.
const MIN_DRAW_RADIUS = 0.02
const MIN_DRAW_LENGTH = 0.05

interface DrawBranch {
  readonly model: Matrix4
  shade: number // 0..1 bark light/dark mix by depth
}

// Draws the tree: lit branch tubes through the renderMesh rasterizer (shadowed),
// then leaves/blossoms as projected points over the top. The Tree model owns the
// geometry; this owns the look.
export class Grove extends Entity3D {
  shadowsEnabled = true

  private readonly cylinder: Mesh = makeCylinder(7)
  private readonly ground: Mesh = planeMesh({ half: 16, y: 0, tiles: 12 })
  private readonly shader = new LitMeshShader({ light: LIGHT, ambient: 0.35, diffuse: 0.8 })
  private readonly shadowMap = new ShadowMap({
    light: LIGHT,
    focus: { x: 0, y: -7, z: 0 },
    distance: 70,
    extent: 16,
    fieldOfView: 0.4,
    resolution: 1024,
  })

  private readonly viewport: Viewport3D = { centerX: 0, centerY: 0, radius: 1, aspectY: 1 }
  private readonly identity = new Matrix4()
  private readonly scratchRotation = new Quaternion()
  private readonly scratchScale = new Vector3()
  private readonly leafWorld = new Vector3()
  private readonly projected: ProjectedPoint = { x: 0, y: 0, depth: 0 }

  private readonly branches: DrawBranch[] = []
  private readonly casters: ShadowCaster[] = []
  private branchCount = 0

  constructor(private readonly tree: Tree) {
    super()
  }

  override draw(ctx: Draw3DContext): void {
    const target = ctx.target
    if (!target) return
    this.viewport.centerX = target.width / 2
    this.viewport.centerY = target.height / 2
    this.viewport.radius = Math.min(target.width, target.height) * 0.5

    this.rebuildBranches()

    if (this.shadowsEnabled) {
      this.syncCasters()
      this.shadowMap.render(this.casters)
      this.shader.shadowMap = this.shadowMap
    } else {
      this.shader.shadowMap = null
    }

    // Ground, then every branch, all into the shared target; one resolve blits it.
    this.shader.setMaterial(GROUND.r, GROUND.g, GROUND.b, 0)
    renderMesh({
      camera: ctx.camera,
      viewport: this.viewport,
      target,
      mesh: this.ground,
      model: this.identity,
      shader: this.shader,
    })

    for (let i = 0; i < this.branchCount; i++) {
      const branch = this.branches[i]!
      const t = branch.shade
      this.shader.setMaterial(
        BARK.r + (BARK_DARK.r - BARK.r) * t,
        BARK.g + (BARK_DARK.g - BARK.g) * t,
        BARK.b + (BARK_DARK.b - BARK.b) * t,
        0,
      )
      renderMesh({
        camera: ctx.camera,
        viewport: this.viewport,
        target,
        mesh: this.cylinder,
        model: branch.model,
        shader: this.shader,
      })
    }

    target.resolveTo(ctx.canvas)

    this.drawLeaves(ctx)
  }

  private rebuildBranches(): void {
    this.branchCount = 0
    this.collectBranch(this.tree.root)
  }

  private collectBranch(node: TreeNode): void {
    for (const child of node.children) {
      if (!child.isDirectory) continue
      if (child.dying && child.life <= 0) continue
      const length = child.targetLength * child.grown
      if (length > MIN_DRAW_LENGTH && child.radius > MIN_DRAW_RADIUS && this.branchCount < BRANCH_BUDGET) {
        const branch = this.obtainBranch()
        composeBranch(
          branch.model,
          child.base,
          child.dir,
          length,
          child.radius,
          this.scratchRotation,
          this.scratchScale,
        )
        branch.shade = Math.min(1, child.depth / 6)
      }
      this.collectBranch(child)
    }
  }

  private obtainBranch(): DrawBranch {
    let branch = this.branches[this.branchCount]
    if (!branch) {
      branch = { model: new Matrix4(), shade: 0 }
      this.branches[this.branchCount] = branch
    }
    this.branchCount++
    return branch
  }

  private syncCasters(): void {
    for (let i = 0; i < this.branchCount; i++) {
      const existing = this.casters[i]
      if (existing) existing.model = this.branches[i]!.model
      else this.casters[i] = { mesh: this.cylinder, model: this.branches[i]!.model }
    }
    this.casters.length = this.branchCount
  }

  // Leaves/blossoms: projected points coloured by file type, glowing while a
  // commit's heat fades. Drawn over the blitted tree (outermost canopy, so no
  // depth test needed). Sampled down to the budget for big repos.
  private drawLeaves(ctx: Draw3DContext): void {
    let drawn = 0
    let seen = 0
    let stride = 1
    const fileCount = this.tree.fileCount
    if (fileCount > LEAF_BUDGET) stride = Math.ceil(fileCount / LEAF_BUDGET)

    for (const node of this.tree.nodes) {
      if (node.isDirectory) continue
      seen++
      if (stride > 1 && seen % stride !== 0 && node.heat < 0.2) continue
      if (drawn >= LEAF_BUDGET) break
      if (node.grown < 0.05) continue
      node.leafInto(this.leafWorld)
      const p = ctx.camera.projectInto(this.projected, this.leafWorld, 1, ctx.viewport)
      if (!p) continue
      drawn++

      const base = extensionColor(node.path)
      const heat = node.heat
      const life = node.dying ? node.life : 1
      // Blossom: bright pink-white flash when hot, settling to the leaf's hue.
      const r = (base.red + (1 - base.red) * heat) * life
      const g = (base.green + (0.4 - base.green) * heat) * life
      const b = (base.blue + (0.7 - base.blue) * heat) * life
      const glyph = heat > 0.55 ? "❀" : heat > 0.2 ? "✿" : "❉"
      ctx.canvas.setCell(p.x, p.y, glyph, new Color(r, g, b))
    }
  }
}
