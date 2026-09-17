import type { Mesh } from "@ahokinson/rune"

// A capless cylinder along +Y spanning y ∈ [0, 1] with radius 1 in xz, `sides`
// facets and radial (smooth) side normals. Specific to the tree: branches plug
// into each other so the ends are never seen, and the base-anchored unit shape
// is what the per-branch instancing transforms (scale = thickness × length,
// position = branch base) expect — so it lives here rather than in the engine's
// general solids. uvs run (around, along).
export function makeCylinder(sides = 7): Mesh {
  const cols = Math.max(3, sides)
  const rings = 2 // base + tip
  const vertexCount = rings * (cols + 1)
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)

  let v = 0
  for (let r = 0; r < rings; r++) {
    const y = r // 0 then 1
    for (let c = 0; c <= cols; c++) {
      const a = (c / cols) * Math.PI * 2
      const nx = Math.cos(a)
      const nz = Math.sin(a)
      const p = v * 3
      positions[p] = nx
      positions[p + 1] = y
      positions[p + 2] = nz
      normals[p] = nx
      normals[p + 1] = 0
      normals[p + 2] = nz
      uvs[v * 2] = c / cols
      uvs[v * 2 + 1] = y
      v++
    }
  }

  const indices = new Uint32Array(cols * 6)
  let i = 0
  for (let c = 0; c < cols; c++) {
    const a = c
    const b = a + cols + 1
    // Outward-facing winding under the example camera (looks down −z, up −y).
    indices[i++] = a
    indices[i++] = a + 1
    indices[i++] = b
    indices[i++] = a + 1
    indices[i++] = b + 1
    indices[i++] = b
  }

  return { positions, indices, normals, uvs }
}
