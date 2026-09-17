import { describe, expect, it } from "bun:test"
import { Vector2 } from "@/math/vector2"

describe("Vector2", () => {
  it("constructs with default zero values", () => {
    const point = new Vector2()
    expect(point.x).toBe(0)
    expect(point.y).toBe(0)
  })

  it("adds and subtracts immutably", () => {
    const a = new Vector2(1, 2)
    const b = new Vector2(3, 4)
    const sum = a.add(b)
    expect(sum.x).toBe(4)
    expect(sum.y).toBe(6)
    expect(a.x).toBe(1)
    const diff = b.subtract(a)
    expect(diff.x).toBe(2)
    expect(diff.y).toBe(2)
  })

  it("scales in place when asked", () => {
    const point = new Vector2(2, 3)
    point.scaleInPlace(4)
    expect(point.x).toBe(8)
    expect(point.y).toBe(12)
  })

  it("computes length and normalises", () => {
    const point = new Vector2(3, 4)
    expect(point.length()).toBe(5)
    const unit = point.normalize()
    expect(unit.x).toBeCloseTo(0.6, 10)
    expect(unit.y).toBeCloseTo(0.8, 10)
  })

  it("normalising a zero vector returns zero", () => {
    const point = new Vector2(0, 0)
    const unit = point.normalize()
    expect(unit.x).toBe(0)
    expect(unit.y).toBe(0)
  })

  it("computes dot product", () => {
    const a = new Vector2(1, 2)
    const b = new Vector2(3, 4)
    expect(a.dot(b)).toBe(11)
  })

  it("lerps between two vectors", () => {
    const a = new Vector2(0, 0)
    const b = new Vector2(10, 20)
    const halfway = a.lerp(b, 0.5)
    expect(halfway.x).toBe(5)
    expect(halfway.y).toBe(10)
  })

  it("equals returns true for identical components", () => {
    expect(new Vector2(1, 2).equals(new Vector2(1, 2))).toBe(true)
    expect(new Vector2(1, 2).equals(new Vector2(2, 1))).toBe(false)
  })

  it("vector2 factory mirrors the constructor", () => {
    const point = new Vector2(3, 4)
    expect(point).toBeInstanceOf(Vector2)
    expect(point.x).toBe(3)
    expect(point.y).toBe(4)
  })

  it("fromAngle constructs a unit vector at the given angle by default", () => {
    const east = Vector2.fromAngle(0)
    expect(east.x).toBeCloseTo(1, 10)
    expect(east.y).toBeCloseTo(0, 10)
    const south = Vector2.fromAngle(Math.PI / 2)
    expect(south.x).toBeCloseTo(0, 10)
    expect(south.y).toBeCloseTo(1, 10)
  })

  it("fromAngle scales by the given magnitude", () => {
    const scaled = Vector2.fromAngle(0, 5)
    expect(scaled.x).toBeCloseTo(5, 10)
    expect(scaled.y).toBeCloseTo(0, 10)
  })

  it("rotate rotates a vector by the given angle without mutating", () => {
    const east = new Vector2(1, 0)
    const south = east.rotate(Math.PI / 2)
    expect(south.x).toBeCloseTo(0, 10)
    expect(south.y).toBeCloseTo(1, 10)
    expect(east.x).toBe(1)
    expect(east.y).toBe(0)
  })

  it("rotate preserves magnitude", () => {
    const point = new Vector2(3, 4)
    const rotated = point.rotate(1.234)
    expect(rotated.length()).toBeCloseTo(point.length(), 10)
  })
})
