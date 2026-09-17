import { describe, expect, it } from "bun:test"
import type { Mesh } from "@/draw/mesh/rasterizer"
import { lathe, type MeshPart, mergeParts, reverseWinding, sweepTube, triangleCount } from "@/geom/meshBuilder"
import { cubeMesh, planeMesh, sphereMesh, torusMesh } from "@/geom/solids"
import { catmullRom, sampleSpline } from "@/geom/spline"

function normalsAreUnit(mesh: Mesh): boolean {
  const n = mesh.normals!
  for (let i = 0; i < n.length; i += 3) {
    const length = Math.hypot(n[i]!, n[i + 1]!, n[i + 2]!)
    if (Math.abs(length - 1) > 1e-3) return false
  }
  return true
}

function uvsInRange(mesh: Mesh): boolean {
  const uv = mesh.uvs!
  for (let i = 0; i < uv.length; i++) {
    if (uv[i]! < -1e-6 || uv[i]! > 1 + 1e-6) return false
  }
  return true
}

describe("solids", () => {
  it("cubeMesh builds six independent quads with unit face normals", () => {
    const cube = cubeMesh()
    expect(cube.positions.length).toBe(6 * 4 * 3)
    expect(cube.indices.length).toBe(6 * 6)
    expect(triangleCount(cube)).toBe(12)
    expect(normalsAreUnit(cube)).toBe(true)
    // Default unit cube spans [-0.5, 0.5].
    for (const p of cube.positions) expect(Math.abs(p)).toBeLessThanOrEqual(0.5 + 1e-6)
  })

  it("cubeMesh scales positions by size", () => {
    const cube = cubeMesh(2)
    let max = 0
    for (const p of cube.positions) max = Math.max(max, Math.abs(p))
    expect(max).toBeCloseTo(1, 6)
  })

  it("sphereMesh has unit normals, on-radius positions, and 0..1 uvs", () => {
    const sphere = sphereMesh({ radius: 2, segments: 16 })
    expect(normalsAreUnit(sphere)).toBe(true)
    expect(uvsInRange(sphere)).toBe(true)
    const pos = sphere.positions
    for (let i = 0; i < pos.length; i += 3) {
      expect(Math.hypot(pos[i]!, pos[i + 1]!, pos[i + 2]!)).toBeCloseTo(2, 4)
    }
  })

  it("torusMesh has unit normals and tiled uvs", () => {
    const torus = torusMesh()
    expect(normalsAreUnit(torus)).toBe(true)
    expect(uvsInRange(torus)).toBe(true)
  })

  it("planeMesh is a single quad facing screen-up", () => {
    const plane = planeMesh({ half: 3, y: 0, tiles: 4 })
    expect(plane.positions.length).toBe(4 * 3)
    expect(triangleCount(plane)).toBe(2)
    // Every normal points along -y (the engine up hint).
    const n = plane.normals!
    for (let i = 0; i < n.length; i += 3) {
      expect(n[i]).toBe(0)
      expect(n[i + 1]).toBe(-1)
      expect(n[i + 2]).toBe(0)
    }
  })
})

describe("spline", () => {
  it("catmullRom returns the bracketing knots at the span ends", () => {
    expect(catmullRom(0, 1, 2, 3, 0)).toBeCloseTo(1, 10)
    expect(catmullRom(0, 1, 2, 3, 1)).toBeCloseTo(2, 10)
  })

  it("sampleSpline passes through the first and last knot", () => {
    const knots = [
      [0, 0],
      [1, 2],
      [3, 1],
      [4, 4],
    ]
    const sampled = sampleSpline(knots, 6)
    expect(sampled[0]).toEqual([0, 0])
    const last = sampled[sampled.length - 1]!
    expect(last[0]).toBeCloseTo(4, 6)
    expect(last[1]).toBeCloseTo(4, 6)
  })
})

describe("meshBuilder", () => {
  it("mergeParts offsets each part's indices by the running vertex count", () => {
    const a: MeshPart = {
      positions: [0, 0, 0, 1, 0, 0],
      normals: [0, 1, 0, 0, 1, 0],
      uvs: [0, 0, 1, 0],
      indices: [0, 1],
    }
    const b: MeshPart = {
      positions: [2, 0, 0, 3, 0, 0],
      normals: [0, 1, 0, 0, 1, 0],
      uvs: [0, 0, 1, 0],
      indices: [0, 1],
    }
    const merged = mergeParts([a, b])
    expect(Array.from(merged.indices)).toEqual([0, 1, 2, 3])
    expect(merged.positions.length).toBe(4 * 3)
  })

  it("reverseWinding swaps the 2nd and 3rd index of every triangle", () => {
    const mesh: Mesh = {
      positions: new Float32Array(9),
      indices: new Uint32Array([0, 1, 2, 3, 4, 5]),
      normals: new Float32Array(9),
      uvs: new Float32Array(6),
    }
    reverseWinding(mesh)
    expect(Array.from(mesh.indices)).toEqual([0, 2, 1, 3, 5, 4])
  })

  it("lathe and sweepTube emit parts with consistent vertex/normal/uv lengths", () => {
    const profile = [
      [0.1, 0],
      [0.4, 0.5],
      [0.2, 1],
    ]
    const revolved = lathe(profile, 12, 4, 0)
    expect(revolved.positions.length).toBe(revolved.normals.length)
    expect(revolved.positions.length / 3).toBe(revolved.uvs.length / 2)
    expect(revolved.indices.length).toBeGreaterThan(0)

    const path = [
      [0, 0, 0],
      [0, 1, 0],
      [0.5, 2, 0],
    ]
    const tube = sweepTube(path, () => 0.2, 6, 8)
    expect(tube.positions.length).toBe(tube.normals.length)
    expect(tube.positions.length / 3).toBe(tube.uvs.length / 2)
    // The tube merges into a valid mesh.
    expect(triangleCount(mergeParts([tube]))).toBeGreaterThan(0)
  })
})
