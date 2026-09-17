import type { Vector2 } from "./vector2"

/**
 * Axis-aligned rectangle in 2D with half-open containment (right/bottom edges
 * excluded), matching screen/pixel conventions.
 *
 * @module
 */

/**
 * Axis-aligned rectangle. `contains` and `intersects` use half-open intervals
 * on the right/bottom edges so adjacent rectangles don't overlap.
 *
 * @example
 * ```ts
 * const r = new Rectangle(0, 0, 10, 10)
 * r.contains(new Vector2(5, 5))  // true
 * r.contains(new Vector2(10, 5)) // false (right edge excluded)
 * r.intersects(new Rectangle(5, 5, 10, 10))  // true
 * ```
 */
export class Rectangle {
  /** X coordinate of the top-left corner. */
  x: number
  /** Y coordinate of the top-left corner. */
  y: number
  /** Width. */
  width: number
  /** Height. */
  height: number

  /**
   * @param x - Top-left X (default 0).
   * @param y - Top-left Y (default 0).
   * @param width - Width (default 0).
   * @param height - Height (default 0).
   */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  /** Left edge X (`x`). */
  get left(): number {
    return this.x
  }

  /** Right edge X (`x + width`). */
  get right(): number {
    return this.x + this.width
  }

  /** Top edge Y (`y`). */
  get top(): number {
    return this.y
  }

  /** Bottom edge Y (`y + height`). */
  get bottom(): number {
    return this.y + this.height
  }

  /** Center X (`x + width / 2`). */
  get centerX(): number {
    return this.x + this.width / 2
  }

  /** Center Y (`y + height / 2`). */
  get centerY(): number {
    return this.y + this.height / 2
  }

  /** Return a copy of this rectangle. */
  clone(): Rectangle {
    return new Rectangle(this.x, this.y, this.width, this.height)
  }

  /**
   * Point-in-rectangle test (half-open: right/bottom edges excluded).
   *
   * @param point - Point to test.
   * @returns `true` if `point` lies inside.
   */
  contains(point: Vector2): boolean {
    return point.x >= this.x && point.x < this.x + this.width && point.y >= this.y && point.y < this.y + this.height
  }

  /**
   * Axis-aligned overlap test with `other`.
   *
   * @param other - Rectangle to test against.
   * @returns `true` if the rectangles overlap.
   */
  intersects(other: Rectangle): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    )
  }

  /**
   * Return a new rectangle expanded by `amount` on every side.
   *
   * @param amount - Units to add to each edge.
   * @returns A new inflated {@link Rectangle}.
   */
  inflate(amount: number): Rectangle {
    return new Rectangle(this.x - amount, this.y - amount, this.width + amount * 2, this.height + amount * 2)
  }
}
