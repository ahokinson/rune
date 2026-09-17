/**
 * Bitmask collision layers: a 32-bit layer value and a matching 32-bit mask,
 * with helpers to build and test them. Used by trigger volumes and broad-phase
 * filters to cheaply decide which bodies interact.
 *
 * @module
 */

/** A 32-bit collision layer (a single bit by convention). */
export type CollisionLayer = number
/** A 32-bit mask OR-ing any number of {@link CollisionLayer}s. */
export type LayerMask = number

/** Helpers for building and testing {@link CollisionLayer}s and {@link LayerMask}s. */
export const CollisionLayer = {
  /** Empty layer — matches nothing. */
  none: 0 as CollisionLayer,
  /** All-bits layer — matches every layer. */
  all: 0xffffffff as CollisionLayer,

  /**
   * Build a single-bit layer from a bit `index`.
   *
   * @param index - Bit position in `[0, 32)`.
   * @returns The layer with only bit `index` set.
   */
  bit(index: number): CollisionLayer {
    if (index < 0 || index >= 32) {
      throw new Error(`CollisionLayer.bit: index ${index} out of range [0, 32)`)
    }
    return (1 << index) >>> 0
  },

  /**
   * OR several layers into a single mask.
   *
   * @param layers - Layers to combine.
   * @returns The union mask.
   */
  mask(...layers: CollisionLayer[]): LayerMask {
    let result = 0
    for (const layer of layers) result |= layer
    return result >>> 0
  },

  /**
   * Test whether `layer` intersects `mask` (i.e. any shared bit is set).
   *
   * @param layer - Layer to test.
   * @param mask - Mask to test against.
   * @returns `true` if `layer & mask` is non-zero.
   */
  matches(layer: CollisionLayer, mask: LayerMask): boolean {
    return (layer & mask) !== 0
  },
}
