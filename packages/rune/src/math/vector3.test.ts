import { describe, expect, it } from "bun:test"
import { Vector3 } from "@/math/vector3"

describe("Vector3", () => {
  it("constructs with default zero values", () => {
    const point = new Vector3()
    expect(point.x).toBe(0)
    expect(point.y).toBe(0)
    expect(point.z).toBe(0)
  })

  it("adds and subtracts immutably", () => {
    const a = new Vector3(1, 2, 3)
    const b = new Vector3(4, 5, 6)
    const sum = a.add(b)
    expect(sum.x).toBe(5)
    expect(sum.y).toBe(7)
    expect(sum.z).toBe(9)
    expect(a.x).toBe(1)
    const diff = b.subtract(a)
    expect(diff.x).toBe(3)
    expect(diff.y).toBe(3)
    expect(diff.z).toBe(3)
  })

  it("scales in place", () => {
    const point = new Vector3(1, 2, 3)
    point.scaleInPlace(2)
    expect(point.x).toBe(2)
    expect(point.y).toBe(4)
    expect(point.z).toBe(6)
  })

  it("computes length and normalises", () => {
    const point = new Vector3(2, 3, 6)
    expect(point.length()).toBe(7)
    const unit = point.normalize()
    expect(unit.length()).toBeCloseTo(1, 10)
  })

  it("normalising a zero vector returns zero", () => {
    const unit = new Vector3(0, 0, 0).normalize()
    expect(unit.x).toBe(0)
    expect(unit.y).toBe(0)
    expect(unit.z).toBe(0)
  })

  it("computes dot product", () => {
    const a = new Vector3(1, 2, 3)
    const b = new Vector3(4, 5, 6)
    expect(a.dot(b)).toBe(32)
  })

  it("computes cross product following right-hand rule", () => {
    const right = new Vector3(1, 0, 0)
    const up = new Vector3(0, 1, 0)
    const forward = right.cross(up)
    expect(forward.x).toBe(0)
    expect(forward.y).toBe(0)
    expect(forward.z).toBe(1)
  })

  it("lerps between two vectors", () => {
    const a = new Vector3(0, 0, 0)
    const b = new Vector3(10, 20, 30)
    const halfway = a.lerp(b, 0.5)
    expect(halfway.x).toBe(5)
    expect(halfway.y).toBe(10)
    expect(halfway.z).toBe(15)
  })

  it("equals returns true for identical components", () => {
    expect(new Vector3(1, 2, 3).equals(new Vector3(1, 2, 3))).toBe(true)
    expect(new Vector3(1, 2, 3).equals(new Vector3(1, 2, 4))).toBe(false)
  })

  it("vector3 factory mirrors the constructor", () => {
    const point = new Vector3(3, 4, 5)
    expect(point).toBeInstanceOf(Vector3)
    expect(point.x).toBe(3)
    expect(point.y).toBe(4)
    expect(point.z).toBe(5)
  })

  it("distanceTo computes Euclidean distance", () => {
    const a = new Vector3(0, 0, 0)
    const b = new Vector3(2, 3, 6)
    expect(a.distanceTo(b)).toBe(7)
  })
})
