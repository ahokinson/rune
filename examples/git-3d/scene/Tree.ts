import { Vector3 } from "@ahokinson/rune"

// The live repository as a growing tree. Directories are branches (trunk → limb →
// twig); files are leaves on their directory's branch tip. Commits grow branches
// and bloom blossoms; deletions drop leaves. Geometry is deterministic from the
// hierarchy — recomputed only when the file set changes — so the tree grows in
// place instead of jittering, while growth/heat/life animate every tick.

// Engine up is −y, so the trunk climbs along −y and branches reach skyward.
const UP = new Vector3(0, -1, 0)
const GOLDEN = 2.399963 // golden angle, spirals child branches around the parent

// Branch length by depth (trunk longest), and thickness by how much subtree it
// carries (cross-section ∝ √files, like a real tree) so the trunk reads thick and
// twigs thin — thickness = how much code hangs off this branch.
const TRUNK_LENGTH = 8
const LENGTH_DECAY = 0.86
const MIN_LENGTH = 1.3
const RADIUS_K = 0.17
const MIN_RADIUS = 0.05
// How far children tilt off their parent (radians, ~41°), and a gentle skyward
// bias so the crown lifts without collapsing the branches back onto the trunk.
const BRANCH_SPREAD = 0.72
const UP_BIAS = 0.2
// Radius of the leaf cluster bloomed around a branch tip.
const LEAF_SPREAD = 1.2

const GROWTH_EASE_PER_SECOND = 3.5
const HEAT_DECAY_PER_SECOND = 1.2
const FADE_PER_SECOND = 1.6

export class TreeNode {
  readonly children: TreeNode[] = []

  // Branch geometry (directories), assigned by relayout from the hierarchy.
  readonly dir = new Vector3(0, -1, 0)
  targetLength = 0
  radius = 0
  subtreeFiles = 0
  depth = 0

  // Leaf placement (files): offset of the leaf from its parent branch tip.
  readonly leafOffset = new Vector3()

  // Animated. `grown` extends a branch / blooms a leaf 0→1; `heat` flashes on a
  // commit and decays; `life` fades a deleted node out before it's pruned.
  grown = 0
  heat = 0
  life = 1
  dying = false

  // Per-frame world positions, refreshed by propagate().
  readonly base = new Vector3()
  readonly tip = new Vector3()

  constructor(
    readonly path: string,
    readonly name: string,
    readonly isDirectory: boolean,
    readonly parent: TreeNode | null,
  ) {}

  // World position of a leaf, lifted out from the tip as it blooms.
  leafInto(out: Vector3): Vector3 {
    const t = this.parent ? this.parent.tip : this.base
    return out.set(
      t.x + this.leafOffset.x * this.grown,
      t.y + this.leafOffset.y * this.grown,
      t.z + this.leafOffset.z * this.grown,
    )
  }
}

// Scratch vectors reused across the structure-time layout walk.
const ref = new Vector3()
const side = new Vector3()
const up2 = new Vector3()

export class Tree {
  readonly root = new TreeNode("", "", true, null)
  private readonly byPath = new Map<string, TreeNode>()
  private structureDirty = true

  reset(): void {
    this.root.children.length = 0
    this.root.grown = 1
    this.byPath.clear()
    this.structureDirty = true
  }

  get nodes(): IterableIterator<TreeNode> {
    return this.byPath.values()
  }

  get fileCount(): number {
    let count = 0
    for (const node of this.byPath.values()) if (!node.isDirectory && !node.dying) count++
    return count
  }

  ensurePath(path: string): TreeNode {
    const existing = this.byPath.get(path)
    if (existing) {
      existing.dying = false
      existing.life = 1
      return existing
    }
    const segments = path.split("/").filter((segment) => segment.length > 0)
    let parent = this.root
    let prefix = ""
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!
      prefix = prefix.length === 0 ? segment : `${prefix}/${segment}`
      const isLeaf = i === segments.length - 1
      let node = this.byPath.get(prefix)
      if (!node) {
        node = new TreeNode(prefix, segment, !isLeaf, parent)
        parent.children.push(node)
        this.byPath.set(prefix, node)
        this.structureDirty = true
      } else {
        node.dying = false
        node.life = 1
      }
      parent = node
    }
    return parent
  }

  // A commit touched this file: bloom/flash it and return it for the burst.
  touch(path: string): TreeNode {
    const node = this.ensurePath(path)
    node.heat = 1
    return node
  }

  kill(path: string): void {
    const node = this.byPath.get(path)
    if (!node || node.isDirectory) return
    node.dying = true
  }

  step(deltaSeconds: number): void {
    if (deltaSeconds <= 0) return
    this.root.grown = 1
    const growthEase = 1 - 1 / (1 + GROWTH_EASE_PER_SECOND * deltaSeconds)
    const heatDecay = Math.max(0, 1 - HEAT_DECAY_PER_SECOND * deltaSeconds)
    for (const node of this.byPath.values()) {
      const target = node.dying ? 0 : 1
      node.grown += (target - node.grown) * growthEase
      node.heat *= heatDecay
      if (node.dying) node.life = Math.max(0, node.life - FADE_PER_SECOND * deltaSeconds)
    }
    this.pruneDead()
    this.propagate()
  }

  // Recompute branch directions/lengths/leaf offsets if the file set changed.
  relayout(): void {
    if (!this.structureDirty) return
    this.countFiles(this.root)
    this.root.dir.copyFrom(UP)
    this.root.targetLength = TRUNK_LENGTH
    this.root.radius = Math.max(MIN_RADIUS, RADIUS_K * Math.sqrt(this.root.subtreeFiles + 1))
    this.root.depth = 0
    this.assignChildren(this.root)
    this.structureDirty = false
    this.propagate()
  }

  private countFiles(node: TreeNode): number {
    if (!node.isDirectory) {
      node.subtreeFiles = 1
      return node.dying && node.life <= 0 ? 0 : 1
    }
    let total = 0
    for (const child of node.children) total += this.countFiles(child)
    node.subtreeFiles = total
    return total
  }

  // Lay out a directory's children: branch directions for sub-directories, leaf
  // offsets for files, all relative to this branch.
  private assignChildren(node: TreeNode): void {
    frame(node.dir)
    const dirs: TreeNode[] = []
    const files: TreeNode[] = []
    for (const child of node.children) (child.isDirectory ? dirs : files).push(child)

    for (let i = 0; i < dirs.length; i++) {
      const child = dirs[i]!
      branchDir(child.dir, node.dir, node.depth + i)
      child.depth = node.depth + 1
      child.targetLength = Math.max(MIN_LENGTH, TRUNK_LENGTH * LENGTH_DECAY ** child.depth)
      child.radius = Math.max(MIN_RADIUS, RADIUS_K * Math.sqrt(child.subtreeFiles + 1))
      this.assignChildren(child)
    }

    // Leaves bloom in a cluster around the tip, pushed a little past it.
    for (let i = 0; i < files.length; i++) {
      const leaf = files[i]!
      spiralPoint(leaf.leafOffset, i, files.length)
      leaf.leafOffset.scaleInPlace(LEAF_SPREAD)
      // Push the cluster out past the tip so foliage caps the branch instead of
      // filling the interior.
      leaf.leafOffset.x += node.dir.x * LEAF_SPREAD * 0.9
      leaf.leafOffset.y += node.dir.y * LEAF_SPREAD * 0.9
      leaf.leafOffset.z += node.dir.z * LEAF_SPREAD * 0.9
    }
  }

  // Walk parent→child, placing each branch's world base/tip from current growth.
  private propagate(): void {
    this.root.base.set(0, 0, 0)
    this.place(this.root)
  }

  private place(node: TreeNode): void {
    const length = node.targetLength * node.grown
    node.tip.set(
      node.base.x + node.dir.x * length,
      node.base.y + node.dir.y * length,
      node.base.z + node.dir.z * length,
    )
    for (const child of node.children) {
      if (!child.isDirectory) continue
      child.base.copyFrom(node.tip)
      this.place(child)
    }
  }

  private pruneDead(): void {
    const removed: TreeNode[] = []
    for (const node of this.byPath.values()) {
      if (!node.isDirectory && node.dying && node.life <= 0) removed.push(node)
    }
    for (const node of removed) this.detach(node)
  }

  private detach(node: TreeNode): void {
    const parent = node.parent
    this.byPath.delete(node.path)
    this.structureDirty = true
    if (!parent) return
    const index = parent.children.indexOf(node)
    if (index !== -1) parent.children.splice(index, 1)
    if (parent !== this.root && parent.isDirectory && parent.children.length === 0) {
      this.detach(parent)
    }
  }

  // Centroid + radius of the live crown, for the camera to frame the whole tree.
  bounds(out: Vector3): number {
    let count = 0
    let cx = 0
    let cy = 0
    let cz = 0
    for (const node of this.byPath.values()) {
      const p = node.isDirectory ? node.tip : leafScratch(node)
      cx += p.x
      cy += p.y
      cz += p.z
      count++
    }
    if (count === 0) {
      out.set(0, -TRUNK_LENGTH / 2, 0)
      return TRUNK_LENGTH
    }
    out.set(cx / count, cy / count, cz / count)
    let radius = 2
    for (const node of this.byPath.values()) {
      const p = node.isDirectory ? node.tip : leafScratch(node)
      radius = Math.max(radius, out.distanceTo(p))
    }
    return radius
  }
}

const leafTmp = new Vector3()
function leafScratch(node: TreeNode): Vector3 {
  return node.leafInto(leafTmp)
}

// Build an orthonormal side/up2 pair perpendicular to `dir` (into module scratch).
function frame(dir: Vector3): void {
  ref.set(Math.abs(dir.z) < 0.9 ? 0 : 1, 0, Math.abs(dir.z) < 0.9 ? 1 : 0)
  side.set(ref.y * dir.z - ref.z * dir.y, ref.z * dir.x - ref.x * dir.z, ref.x * dir.y - ref.y * dir.x)
  const sl = side.length() || 1
  side.scaleInPlace(1 / sl)
  up2.set(dir.y * side.z - dir.z * side.y, dir.z * side.x - dir.x * side.z, dir.x * side.y - dir.y * side.x)
}

// Direction of a child off `parentDir`: tilted out by BRANCH_SPREAD, spun around
// the parent by the golden angle (from `seed`), then biased skyward. Requires
// frame(parentDir) called first.
function branchDir(out: Vector3, parentDir: Vector3, seed: number): void {
  const phi = seed * GOLDEN
  const cosS = Math.cos(BRANCH_SPREAD)
  const sinS = Math.sin(BRANCH_SPREAD)
  const cp = Math.cos(phi)
  const sp = Math.sin(phi)
  out.set(
    parentDir.x * cosS + (side.x * cp + up2.x * sp) * sinS + UP.x * UP_BIAS,
    parentDir.y * cosS + (side.y * cp + up2.y * sp) * sinS + UP.y * UP_BIAS,
    parentDir.z * cosS + (side.z * cp + up2.z * sp) * sinS + UP.z * UP_BIAS,
  )
  const l = out.length() || 1
  out.scaleInPlace(1 / l)
}

// Deterministic point on the unit sphere by index (golden spiral), into `out`.
function spiralPoint(out: Vector3, i: number, count: number): void {
  const y = count <= 1 ? 0.4 : (i + 0.5) / count - 0.5 // bias up a touch
  const r = Math.sqrt(Math.max(0, 1 - y * y))
  const phi = i * GOLDEN
  out.set(r * Math.cos(phi), y - 0.3, r * Math.sin(phi))
}
