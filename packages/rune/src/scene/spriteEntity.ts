/**
 * Simplest renderable: an {@link Entity2D} that draws a single {@link Sprite} at
 * its position. `size` defaults to the sprite's dimensions (for collision bounds).
 *
 * @module
 */

import type { Camera } from "@/draw/camera"
import type { Canvas } from "@/draw/canvas"
import { drawSprite, type Sprite } from "@/draw/sprite"
import { Vector2 } from "@/math/vector2"
import { Entity2D, type Entity2DOptions } from "./entity2d"

/** Options for constructing a {@link SpriteEntity}. */
export interface SpriteEntityOptions extends Entity2DOptions {
  /** Sprite to draw. */
  sprite: Sprite
}

/**
 * The simplest renderable: an {@link Entity2D} that draws a single {@link Sprite}
 * at its position.
 *
 * `size` defaults to the sprite's dimensions (for collision bounds). Extend it
 * and override `update()` to give the sprite behaviour.
 */
export class SpriteEntity extends Entity2D {
  /** Sprite drawn at this entity's position. */
  sprite: Sprite

  /**
   * @param options - Construction options. `size` defaults to the sprite's
   *   dimensions.
   */
  constructor(options: SpriteEntityOptions) {
    super({
      ...options,
      size: options.size ?? new Vector2(options.sprite.width, options.sprite.height),
    })
    this.sprite = options.sprite
  }

  /**
   * Draw the sprite at this entity's position.
   *
   * @param canvas - Target canvas.
   * @param camera - Active camera.
   */
  override draw(canvas: Canvas, camera: Camera): void {
    drawSprite(canvas, this.sprite, this.position.x, this.position.y, camera)
  }
}
