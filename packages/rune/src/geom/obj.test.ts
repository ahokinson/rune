import { describe, expect, it } from "bun:test"
import { normalizeMesh, parseObj } from "@/geom/obj"

// A minimal cube OBJ with positions, normals, and uvs and quad faces (to exercise
// fan triangulation and a/b/c face refs).
const CUBE_OBJ = `
# unit cube
v -1 -1 -1
v  1 -1 -1
v  1  1 -1
v -1  1 -1
v -1 -1  1
v  1 -1  1
v  1  1  1
v -1  1  1
vt 0 0
vt 1 0
vt 1 1
vt 0 1
vn 0 0 -1
vn 0 0 1
f 1/1/1 2/2/1 3/3/1 4/4/1
f 5/1/2 6/2/2 7/3/2 8/4/2
`

describe("parseObj", () => {
  it("parses positions, uvs, normals and fan-triangulates quads", () => {
    const mesh = parseObj(CUBE_OBJ)
    // Two quads → four triangles → 12 indices.
    expect(mesh.indices.length).toBe(12)
    expect(mesh.normals).toBeDefined()
    expect(mesh.uvs).toBeDefined()
    // 8 face-vertices with distinct position/uv/normal triples.
    expect(mesh.positions.length).toBe(8 * 3)

    // First triangle of the back face uses the -z normal.
    const i0 = mesh.indices[0]!
    expect(mesh.normals![i0 * 3 + 2]).toBe(-1)
  })

  it("reuses identical vertex references via the cache", () => {
    // A shared edge: the second triangle reuses vertices from the first.
    const obj = "v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3\nf 1 3 4\n"
    const mesh = parseObj(obj)
    expect(mesh.indices.length).toBe(6)
    // Four unique positions, no duplication despite two faces.
    expect(mesh.positions.length).toBe(4 * 3)
    // No normals/uvs present, so they stay undefined (flat-shaded fallback).
    expect(mesh.normals).toBeUndefined()
    expect(mesh.uvs).toBeUndefined()
  })

  it("normalizeMesh recentres, scales, and remaps axes", () => {
    const mesh = parseObj(CUBE_OBJ)
    normalizeMesh(mesh, { size: 1, axisMap: (x, y, z) => [x, z, -y] })
    let minX = Infinity
    let maxX = -Infinity
    for (let i = 0; i < mesh.positions.length; i += 3) {
      minX = Math.min(minX, mesh.positions[i]!)
      maxX = Math.max(maxX, mesh.positions[i]!)
    }
    // Largest extent is exactly `size`, centred on the origin.
    expect(maxX - minX).toBeCloseTo(1, 6)
    expect(minX).toBeCloseTo(-0.5, 6)
  })
})
