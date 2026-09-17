/**
 * Tile-grid renderer: a camera-culled pass through a tile set that looks up each
 * visible cell's appearance (resolving animation and neighbour rules) and draws
 * it, with optional per-tile transient effects layered on top.
 *
 * @module
 */

import type { Camera } from "@/draw/camera"
import type { Canvas } from "@/draw/canvas"
import { drawSprite } from "@/draw/sprite"
import type { TileContext, TileSet } from "@/draw/tileSet"
import { Easing } from "@/math/easing"
import { Rectangle } from "@/math/rectangle"
import { Vector2 } from "@/math/vector2"
import { Tween, type TweenOptions, TweenState } from "@/tween/tween"
import type { TileMap } from "@/world/tileMap"
import { Entity2D, type Entity2DOptions } from "./entity2d"

/**
 * A transient draw-time displacement of a single tile (the block bump, a shaking
 * tile). `offset` is the peak shift in world cells; the tween scales it
 * 0 → peak → 0.
 */
interface TileEffect {
  /** Tile column. */
  column: number
  /** Tile row. */
  row: number
  /** Peak shift in world cells. */
  offset: Vector2
  /** Tween scaling `offset` over time. */
  tween: Tween
}

/** Options for constructing a {@link TileLayer}. */
export interface TileLayerOptions<TCell> extends Entity2DOptions {
  /** Tile map to read cells from. */
  tileMap: TileMap<TCell>
  /** Tile set resolving each cell's appearance. */
  tileSet: TileSet<TCell>
  /** Edge length of one tile in world units. */
  tileSize: number
  /**
   * Cells to leave undrawn even if the tile set defines them. Cells with no
   * appearance in the tile set are skipped regardless.
   *
   * @param cell - Cell value to test.
   * @returns `true` to skip the cell.
   */
  skip?(cell: TCell): boolean
  /**
   * Per-axis scroll factor relative to the camera, for parallax backgrounds:
   * `1` tracks the camera exactly (default), `<1` scrolls slower (distant),
   * `>1` faster (foreground). Assumes an orthographic, unit-scale camera.
   */
  parallax?: Vector2
}

/** How far a bumped tile rises, as a fraction of its size, when `bump` is called without overrides. */
const DEFAULT_BUMP_RISE_FRACTION = 0.6
/** How long a bumped tile's nudge lasts, in milliseconds, when `bump` is called without overrides. */
const DEFAULT_BUMP_MILLISECONDS = 160

/**
 * Renders a tile grid through a tile set: a camera-culled pass that looks up each
 * visible cell's appearance (resolving animation and neighbour rules) and draws
 * it, with optional per-tile transient effects layered on top.
 *
 * This replaces the per-game switch-on-cell draw loop and the ad-hoc bump
 * bookkeeping. Assumes an orthographic camera whose position is the top-left of
 * the view in world cells.
 */
export class TileLayer<TCell> extends Entity2D {
  /** Tile map read for cell values. */
  readonly tileMap: TileMap<TCell>
  /** Tile set resolving each cell's appearance. */
  readonly tileSet: TileSet<TCell>
  /** Edge length of one tile in world units. */
  readonly tileSize: number
  private readonly skip?: (cell: TCell) => boolean
  private readonly effects: TileEffect[] = []
  private readonly context: TileContext<TCell>
  /** Per-axis parallax scroll factor relative to the camera. */
  readonly parallax: Vector2

  /**
   * @param options - Construction options.
   */
  constructor(options: TileLayerOptions<TCell>) {
    super(options)
    this.tileMap = options.tileMap
    this.tileSet = options.tileSet
    this.tileSize = options.tileSize
    this.skip = options.skip
    this.parallax = options.parallax ?? new Vector2(1, 1)
    this.context = { tileMap: options.tileMap, column: 0, row: 0 }
  }

  /**
   * Advance the tile set's animations and any active tile effects.
   *
   * @param deltaMilliseconds - Elapsed time since the last update.
   */
  override update(deltaMilliseconds: number): void {
    this.tileSet.update(deltaMilliseconds)
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i]!
      effect.tween.advance(deltaMilliseconds)
      if (effect.tween.status === TweenState.Completed) this.effects.splice(i, 1)
    }
  }

  /**
   * Draw the visible tiles, culled to the camera, with any active effects applied.
   *
   * @param canvas - Target canvas.
   * @param camera - Active camera.
   */
  override draw(canvas: Canvas, camera: Camera): void {
    // Effective (parallax-scaled) camera for culling; the draw offset shifts world
    // coordinates so the real camera projects them to the parallaxed position.
    const cameraX = camera.position.x * this.parallax.x
    const cameraY = camera.position.y * this.parallax.y
    const drawOffsetX = camera.position.x - cameraX
    const drawOffsetY = camera.position.y - cameraY
    const minColumn = Math.max(0, Math.floor(cameraX / this.tileSize))
    const maxColumn = Math.min(this.tileMap.width - 1, Math.floor((cameraX + canvas.width) / this.tileSize))
    const minRow = Math.max(0, Math.floor(cameraY / this.tileSize))
    const maxRow = Math.min(this.tileMap.height - 1, Math.floor((cameraY + canvas.height) / this.tileSize))

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        const cell = this.tileMap.get(column, row)
        if (cell === undefined) continue
        if (this.skip?.(cell)) continue
        this.context.column = column
        this.context.row = row
        const sprite = this.tileSet.appearanceFor(cell, this.context)
        if (!sprite) continue
        let shiftX = 0
        let shiftY = 0
        for (const effect of this.effects) {
          if (effect.column === column && effect.row === row) {
            shiftX += effect.offset.x * effect.tween.value
            shiftY += effect.offset.y * effect.tween.value
          }
        }
        drawSprite(
          canvas,
          sprite,
          column * this.tileSize + drawOffsetX + shiftX,
          row * this.tileSize + drawOffsetY + shiftY,
          camera,
        )
      }
    }
  }

  /**
   * Nudge a tile up and back down, the classic bonked-block bounce.
   *
   * @param column - Tile column.
   * @param row - Tile row.
   * @param options - Overrides for `rise` (fraction of `tileSize`) and `durationMilliseconds`.
   */
  bump(column: number, row: number, options: { rise?: number; durationMilliseconds?: number } = {}): void {
    const rise = options.rise ?? this.tileSize * DEFAULT_BUMP_RISE_FRACTION
    const durationMilliseconds = options.durationMilliseconds ?? DEFAULT_BUMP_MILLISECONDS
    this.nudge(column, row, new Vector2(0, -rise), {
      from: 0,
      to: 1,
      durationMilliseconds,
      yoyo: true,
      easing: Easing.quadraticOut,
    })
  }

  /**
   * Drive a tile's draw-time offset with an arbitrary tween (the tween's value
   * scales `offset`). Use {@link bump} for the common vertical bounce.
   *
   * @param column - Tile column.
   * @param row - Tile row.
   * @param offset - Peak shift in world cells.
   * @param tween - Tween options driving the effect.
   */
  nudge(column: number, row: number, offset: Vector2, tween: TweenOptions): void {
    const drive = new Tween(tween)
    drive.start()
    this.effects.push({ column, row, offset, tween: drive })
  }

  /**
   * Solid-tile rectangles overlapping `box` expanded by `pad`, for swept-AABB
   * collision — the small obstacle set near a mover, not the whole grid.
   *
   * @param box - AABB to expand and test.
   * @param pad - Expansion on every side, in world units.
   * @returns Solid tile rectangles near `box`.
   */
  collidersNear(box: Rectangle, pad: number): Rectangle[] {
    const out: Rectangle[] = []
    const minColumn = Math.floor((box.x - pad) / this.tileSize)
    const maxColumn = Math.floor((box.x + box.width + pad) / this.tileSize)
    const minRow = Math.floor((box.y - pad) / this.tileSize)
    const maxRow = Math.floor((box.y + box.height + pad) / this.tileSize)
    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        if (this.tileSet.isSolid(this.tileMap.get(column, row))) {
          out.push(new Rectangle(column * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize))
        }
      }
    }
    return out
  }
}
