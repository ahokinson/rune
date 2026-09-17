/**
 * AnimatedSprite-backed 2D entity: the engine advances the animation each fixed
 * update and draws the current frame at the entity's position.
 *
 * @module
 */

import type { AnimatedSprite } from "@/draw/animatedSprite"
import type { Camera } from "@/draw/camera"
import type { Canvas } from "@/draw/canvas"
import { drawSprite, type Sprite } from "@/draw/sprite"
import { Vector2 } from "@/math/vector2"
import { Entity2D, type Entity2DOptions } from "./entity2d"

/** Options for constructing an {@link AnimatedSpriteEntity}. */
export interface AnimatedSpriteEntityOptions extends Entity2DOptions {
  /** Animation driving the rendered frames. */
  animation: AnimatedSprite<Sprite>
}

/**
 * An {@link Entity2D} backed by an {@link AnimatedSprite}.
 *
 * Extend it and call `animation.play(name)` from `update()` to switch clips.
 *
 * @example
 * ```ts
 * const hero = new AnimatedSpriteEntity({
 *   animation: sprite,
 *   position: new Vector2(10, 10),
 * })
 * hero.animation.play("idle")
 * ```
 */
export class AnimatedSpriteEntity extends Entity2D {
  /** Animation driving the rendered frames. */
  readonly animation: AnimatedSprite<Sprite>

  /**
   * @param options - Construction options. `size` defaults to the current frame's
   *   dimensions.
   */
  constructor(options: AnimatedSpriteEntityOptions) {
    super({
      ...options,
      size:
        options.size ?? new Vector2(options.animation.currentFrame().width, options.animation.currentFrame().height),
    })
    this.animation = options.animation
  }

  /**
   * Advance the animation by one fixed step.
   *
   * @param deltaMilliseconds - Elapsed time since the last update.
   */
  override update(deltaMilliseconds: number): void {
    this.animation.update(deltaMilliseconds)
  }

  /**
   * Draw the current animation frame at this entity's position.
   *
   * @param canvas - Target canvas.
   * @param camera - Active camera.
   */
  override draw(canvas: Canvas, camera: Camera): void {
    drawSprite(canvas, this.animation.currentFrame(), this.position.x, this.position.y, camera)
  }
}
