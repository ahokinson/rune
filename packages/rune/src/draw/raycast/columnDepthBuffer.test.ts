import { describe, expect, it } from "bun:test"
import { ColumnDepthBuffer } from "@/draw/raycast/columnDepthBuffer"

describe("ColumnDepthBuffer", () => {
  it("initialises to positive infinity", () => {
    const buffer = new ColumnDepthBuffer(4)
    for (let column = 0; column < 4; column++) {
      expect(buffer.get(column)).toBe(Number.POSITIVE_INFINITY)
    }
  })

  it("clear fills with the chosen value", () => {
    const buffer = new ColumnDepthBuffer(3)
    buffer.clear(5)
    expect(buffer.get(0)).toBe(5)
    expect(buffer.get(2)).toBe(5)
  })

  it("set and get roundtrip per column", () => {
    const buffer = new ColumnDepthBuffer(3)
    buffer.set(1, 7.5)
    expect(buffer.get(1)).toBe(7.5)
    expect(buffer.get(0)).toBe(Number.POSITIVE_INFINITY)
  })

  it("out-of-range get returns positive infinity", () => {
    const buffer = new ColumnDepthBuffer(3)
    expect(buffer.get(-1)).toBe(Number.POSITIVE_INFINITY)
    expect(buffer.get(3)).toBe(Number.POSITIVE_INFINITY)
  })

  it("writeIfCloser only writes when depth is smaller", () => {
    const buffer = new ColumnDepthBuffer(2)
    expect(buffer.writeIfCloser(0, 10)).toBe(true)
    expect(buffer.get(0)).toBe(10)
    expect(buffer.writeIfCloser(0, 8)).toBe(true)
    expect(buffer.get(0)).toBe(8)
    expect(buffer.writeIfCloser(0, 12)).toBe(false)
    expect(buffer.get(0)).toBe(8)
  })

  describe("2D mode (rowCount > 0)", () => {
    it("initialises cells to positive infinity", () => {
      const buffer = new ColumnDepthBuffer(3, 4)
      for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 4; row++) {
          expect(buffer.getCell(col, row)).toBe(Number.POSITIVE_INFINITY)
        }
      }
    })

    it("setCell and getCell roundtrip", () => {
      const buffer = new ColumnDepthBuffer(3, 4)
      buffer.setCell(1, 2, 5.5)
      expect(buffer.getCell(1, 2)).toBe(5.5)
      expect(buffer.getCell(0, 2)).toBe(Number.POSITIVE_INFINITY)
      expect(buffer.getCell(1, 0)).toBe(Number.POSITIVE_INFINITY)
    })

    it("getCell returns infinity for out-of-range access", () => {
      const buffer = new ColumnDepthBuffer(3, 4)
      expect(buffer.getCell(-1, 0)).toBe(Number.POSITIVE_INFINITY)
      expect(buffer.getCell(3, 0)).toBe(Number.POSITIVE_INFINITY)
      expect(buffer.getCell(0, -1)).toBe(Number.POSITIVE_INFINITY)
      expect(buffer.getCell(0, 4)).toBe(Number.POSITIVE_INFINITY)
    })

    it("setCell is no-op when rowCount is 0", () => {
      const buffer = new ColumnDepthBuffer(3)
      buffer.setCell(1, 2, 5.5)
      expect(buffer.getCell(1, 2)).toBe(Number.POSITIVE_INFINITY)
    })

    it("clear resets both column and cell data", () => {
      const buffer = new ColumnDepthBuffer(3, 4)
      buffer.set(1, 10)
      buffer.setCell(1, 2, 5.5)
      buffer.clear()
      expect(buffer.get(1)).toBe(Number.POSITIVE_INFINITY)
      expect(buffer.getCell(1, 2)).toBe(Number.POSITIVE_INFINITY)
    })

    it("clear with custom value resets both column and cell data", () => {
      const buffer = new ColumnDepthBuffer(3, 4)
      buffer.set(1, 10)
      buffer.setCell(1, 2, 5.5)
      buffer.clear(99)
      expect(buffer.get(1)).toBe(99)
      expect(buffer.getCell(1, 2)).toBe(99)
    })

    it("column data and cell data are independent", () => {
      const buffer = new ColumnDepthBuffer(3, 4)
      buffer.set(1, 7)
      buffer.setCell(1, 2, 3)
      expect(buffer.get(1)).toBe(7)
      expect(buffer.getCell(1, 2)).toBe(3)
    })
  })
})
