import {
  type BillboardEntry,
  type Camera,
  type CanvasSurface,
  ColumnDepthBuffer,
  Entity2D,
  RaycastProjection,
  renderBillboards,
  renderGridSurfaces,
  type TileMap,
  Vector2,
} from "@ahokinson/rune"
import type { LevelTheme, LightGrid, TombCell } from "./map"
import { type CrosshairState, renderCrosshair } from "./render/crosshair"
import { TombSurfaceShader, TombSurfaces } from "./render/surfaces"

/** Player eye height in world Z above the floor they stand on. */
export const EYE_HEIGHT = 0.5

export interface LevelOptions {
  tileMap: TileMap<TombCell>
  camera: Camera
  columnCount: number
  rowCount: number
  themes: LevelTheme[]
  lightGrid: LightGrid
  eyeZ?: number
}

export class Level extends Entity2D {
  readonly tileMap: TileMap<TombCell>
  readonly camera: Camera
  readonly columnCount: number
  readonly rowCount: number
  readonly horizon: number
  readonly themes: LevelTheme[]
  readonly lightGrid: LightGrid
  readonly billboards: BillboardEntry[] = []
  readonly crosshair: CrosshairState = { hitFlashRemainingMs: 0 }
  eyeZ: number
  private readonly depthBuffer: ColumnDepthBuffer
  private readonly surfaces: TombSurfaces
  private readonly shader: TombSurfaceShader
  private elapsedMilliseconds = 0

  constructor(options: LevelOptions) {
    super({ position: new Vector2(0, 0), size: new Vector2(0, 0) })
    this.tileMap = options.tileMap
    this.camera = options.camera
    this.columnCount = options.columnCount
    this.rowCount = options.rowCount
    this.themes = options.themes
    this.lightGrid = options.lightGrid
    this.horizon = Math.floor(options.rowCount / 2)
    this.eyeZ = options.eyeZ ?? EYE_HEIGHT
    this.depthBuffer = new ColumnDepthBuffer(options.columnCount, options.rowCount)
    this.surfaces = new TombSurfaces(options.tileMap)
    this.shader = new TombSurfaceShader(options.tileMap, options.themes, options.lightGrid)
    this.zIndex = -100
  }

  get primaryTheme(): LevelTheme {
    return this.themes[0]!
  }

  flashHitMarker(durationMs = 140): void {
    if (durationMs > this.crosshair.hitFlashRemainingMs) {
      this.crosshair.hitFlashRemainingMs = durationMs
    }
  }

  getDepthBuffer(): ColumnDepthBuffer {
    return this.depthBuffer
  }

  override update(deltaMilliseconds: number): void {
    this.elapsedMilliseconds += deltaMilliseconds
    if (this.crosshair.hitFlashRemainingMs > 0) {
      this.crosshair.hitFlashRemainingMs = Math.max(0, this.crosshair.hitFlashRemainingMs - deltaMilliseconds)
    }
  }

  override draw(canvas: CanvasSurface): void {
    const projection = this.camera.projection
    if (!(projection instanceof RaycastProjection)) return

    projection.viewportWidth = this.columnCount
    projection.viewportHeight = this.rowCount

    this.depthBuffer.clear()
    renderGridSurfaces({
      canvas,
      camera: this.camera,
      projection,
      surfaces: this.surfaces,
      shader: this.shader,
      depthBuffer: this.depthBuffer,
      screenColumns: this.columnCount,
      screenRows: this.rowCount,
      eyeZ: this.eyeZ,
    })

    renderBillboards({
      canvas,
      camera: this.camera,
      depthBuffer: this.depthBuffer,
      entries: this.billboards,
      timeMilliseconds: this.elapsedMilliseconds,
      eyeZ: this.eyeZ,
      rowCount: this.rowCount,
    })

    renderCrosshair(canvas, this.columnCount, this.rowCount, this.crosshair)
  }
}
