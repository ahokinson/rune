/**
 * Per-(x,y) depth buffer for the 3D geometry pass. Depth convention here is
 * LARGER = NEARER the camera, matching SphereProjection's ScreenPoint.depth
 * (front hemisphere ~1, limb ~0) and the generic Camera3D projectors below.
 *
 * This is deliberately distinct from the raycaster ColumnDepthBuffer (smaller =
 * nearer) — hence the explicit writeIfNearer / testNearer names, so the two
 * conventions can't be confused at a call site.
 *
 * @module
 */

/**
 * Per-pixel depth buffer using the LARGER = NEARER convention.
 *
 * Used by the 3D geometry pass to resolve visibility between surfaces,
 * billboards, and markers drawn into the same frame.
 */
export class GridDepthBuffer {
  private _width = 0
  private _height = 0
  private values = new Float32Array(0)

  /**
   * Create a new buffer, optionally pre-sized.
   *
   * @param width - Initial width in cells (default 0; call {@link resize} later).
   * @param height - Initial height in cells (default 0).
   */
  constructor(width = 0, height = 0) {
    this.resize(width, height)
  }

  /** Buffer width in cells. */
  get width(): number {
    return this._width
  }

  /** Buffer height in cells. */
  get height(): number {
    return this._height
  }

  /**
   * Reallocates the backing store only when the size actually changes, so it can
   * be called every frame with the canvas dimensions cheaply.
   */
  resize(width: number, height: number): void {
    const w = Math.max(0, Math.floor(width))
    const h = Math.max(0, Math.floor(height))
    if (w === this._width && h === this._height) return
    this._width = w
    this._height = h
    this.values = new Float32Array(w * h)
    this.clear()
  }

  /** Fill the buffer with `value` (default -Infinity, meaning "nothing nearer"). */
  clear(value = Number.NEGATIVE_INFINITY): void {
    this.values.fill(value)
  }

  /**
   * Read the depth at (x, y). Out-of-bounds reads return -Infinity.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @returns Stored depth, or -Infinity if (x, y) is outside the buffer.
   */
  get(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
      return Number.NEGATIVE_INFINITY
    }
    return this.values[y * this._width + x] ?? Number.NEGATIVE_INFINITY
  }

  /**
   * Would a fragment at `depth` be visible — i.e. at or in front of what's stored?
   * Uses >= so co-planar geometry (a marker sitting on the surface that wrote this
   * cell) is not self-occluded. Off-bounds reads are -Infinity, so any candidate
   * outside the buffer is considered visible.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @param depth - Candidate depth (LARGER = NEARER).
   * @returns `true` if the fragment passes the depth test.
   */
  testNearer(x: number, y: number, depth: number): boolean {
    if (x < 0 || y < 0 || x >= this._width || y >= this._height) return true
    const current = this.values[y * this._width + x] ?? Number.NEGATIVE_INFINITY
    return depth >= current
  }

  /**
   * Write `depth` if it is strictly nearer (larger) than what's stored.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @param depth - Candidate depth (LARGER = NEARER).
   * @returns `true` if the depth won the test and was written.
   */
  writeIfNearer(x: number, y: number, depth: number): boolean {
    if (x < 0 || y < 0 || x >= this._width || y >= this._height) return false
    const index = y * this._width + x
    const current = this.values[index] ?? Number.NEGATIVE_INFINITY
    if (depth > current) {
      this.values[index] = depth
      return true
    }
    return false
  }
}
