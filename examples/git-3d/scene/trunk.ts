import type { Matrix4, Quaternion, Vector3 } from "@ahokinson/rune"

// Geometry + placement for the tree's woody parts. One unit cylinder is reused
// for every branch (trunk to twig), oriented along its growth direction and
// scaled to its length/thickness by a per-branch model matrix.

// Compose the model matrix for a branch: a cylinder from `base` running `length`
// along `dir` with cross-section `radius`. `rotation`/`scale` are caller-owned
// scratch so the draw loop allocates nothing.
export function composeBranch(
  model: Matrix4,
  base: Vector3,
  dir: Vector3,
  length: number,
  radius: number,
  rotation: Quaternion,
  scale: Vector3,
): Matrix4 {
  rotation.setFromDirection(dir)
  scale.set(radius, length, radius)
  return model.composeQuaternionInto(base, rotation, scale)
}
