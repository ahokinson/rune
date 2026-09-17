/**
 * 2D entity hosting a 3D scene: ticks a {@link Scene3D} each fixed update and
 * draws it at a viewport, so 2D HUD/effects can layer around it by `zIndex`.
 *
 * @module
 */

import type { Camera } from "@/draw/camera"
import type { Canvas } from "@/draw/canvas"
import type { Viewport3D } from "@/geom/camera3d"
import { Entity2D, type Entity2DOptions } from "./entity2d"
import type { Scene3D } from "./scene3d"

/** Options for constructing a {@link WorldView3D}. */
export interface WorldView3DOptions extends Entity2DOptions {
  /** 3D scene to host. */
  world: Scene3D
  /**
   * Fixed framing; omit to fill the canvas, or override `viewportFor` for
   * a viewport that tracks the canvas size each frame.
   */
  viewport?: Viewport3D
}

/**
 * The bridge that makes "everything is an entity" hold for 3D: a normal
 * {@link Entity2D} that owns a {@link Scene3D}, ticks it each fixed update, and
 * draws it at a viewport.
 *
 * Drop it into a 2D {@link Scene} and 2D HUD/effect entities layer around it by
 * `zIndex`. Subclass and override `viewportFor` when the framing depends
 * on canvas size.
 */
export class WorldView3D extends Entity2D {
  /** Hosted 3D scene. */
  readonly world: Scene3D
  /** Fixed framing, or `null` to fill the canvas. */
  viewport: Viewport3D | null

  /**
   * @param options - Construction options.
   */
  constructor(options: WorldView3DOptions) {
    super(options)
    this.world = options.world
    this.viewport = options.viewport ?? null
  }

  /**
   * The viewport to draw the world at this frame. Defaults to the fixed
   * {@link viewport}, or a centered viewport filling the canvas if none was given.
   *
   * @param canvas - Target canvas.
   * @returns Viewport in canvas pixels.
   */
  protected viewportFor(canvas: Canvas): Viewport3D {
    if (this.viewport) return this.viewport
    const radius = Math.min(canvas.width, canvas.height) / 2
    return { centerX: canvas.width / 2, centerY: canvas.height / 2, radius, aspectY: 1 }
  }

  /**
   * Tick the hosted 3D scene.
   *
   * @param deltaMilliseconds - Elapsed time since the last update.
   */
  override update(deltaMilliseconds: number): void {
    this.world.update(deltaMilliseconds)
  }

  /**
   * Draw the hosted 3D scene at this frame's viewport.
   *
   * @param canvas - Target canvas.
   * @param _camera - Unused; the 3D scene's own camera is used.
   */
  override draw(canvas: Canvas, _camera: Camera): void {
    this.world.draw(canvas, this.viewportFor(canvas))
  }
}
