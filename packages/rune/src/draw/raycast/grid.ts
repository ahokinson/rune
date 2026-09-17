/**
 * First-person raycaster: per-column DDA raycasting against a grid of
 * variable-height floor/ceiling cells, writing colour to the canvas (two
 * vertical sub-pixels per cell through the ▀ half block) and depth to a
 * {@link ColumnDepthBuffer} for later billboard occlusion.
 *
 * @module
 */

import type { Camera } from "../camera"
import type { Canvas } from "../canvas"
import type { SurfaceColor } from "../color"
import type { ColumnDepthBuffer } from "./columnDepthBuffer"
import type { RaycastProjection } from "./projection"

const DEFAULT_MAX_DISTANCE = 32
const UPPER_HALF_BLOCK = "▀"

/**
 * Geometry sampler for {@link renderGridSurfaces}. The domain is infinite — the
 * implementation owns out-of-bounds behaviour. A column terminates when
 * `isSolid` returns `true`, so an adapter that returns `true` (and a finite
 * floor/ceiling) for missing cells produces a closed world.
 */
export interface GridSurfaces {
  isSolid(column: number, row: number): boolean
  floorHeight(column: number, row: number): number
  ceilingHeight(column: number, row: number): number
}

/** One wall sub-pixel handed to a {@link SurfaceShader}. */
export interface WallSample {
  /** Fractional world coordinate along the wall face, [0, 1). */
  u: number
  /** Vertical position within the wall slice span, [0, 1). */
  v: number
  /** Perpendicular distance to the wall (for fog/shading). */
  distance: number
  /** True when the ray crossed a y-grid line (games may darken these faces). */
  isSide: boolean
  mapColumn: number
  mapRow: number
  screenColumn: number
  screenRow: number
}

/** One floor or ceiling sub-pixel handed to a {@link SurfaceShader}. */
export interface FlatSample {
  worldX: number
  worldY: number
  /** Per-sub-pixel distance (for fog/shading). */
  distance: number
  mapColumn: number
  mapRow: number
  screenColumn: number
  screenRow: number
}

/**
 * Per-pixel colour seam. Each method is called twice per terminal cell — once
 * for the upper sub-pixel, once for the lower — and fills `out` (0–255). The
 * renderer adds no fog, lighting, or side-shading; implementations own all of
 * that via the map coordinates on the sample.
 */
export interface SurfaceShader {
  wallPixel(sample: WallSample, out: SurfaceColor): void
  floorPixel(sample: FlatSample, out: SurfaceColor): void
  ceilingPixel(sample: FlatSample, out: SurfaceColor): void
}

/** Options for {@link renderGridSurfaces}. */
export interface RenderGridSurfacesContext {
  canvas: Canvas
  camera: Camera
  projection: RaycastProjection
  surfaces: GridSurfaces
  shader: SurfaceShader
  depthBuffer: ColumnDepthBuffer
  /** Screen columns to cast (one ray each). */
  screenColumns: number
  /** Screen rows; the horizon is fixed at `floor(screenRows / 2)`. */
  screenRows: number
  /** Camera eye height in world Z. */
  eyeZ: number
  /** Ray cutoff distance. Defaults to 32. */
  maxDistance?: number
}

const upperRGB: SurfaceColor = { r: 0, g: 0, b: 0 }
const lowerRGB: SurfaceColor = { r: 0, g: 0, b: 0 }
const wallSample: WallSample = {
  u: 0,
  v: 0,
  distance: 0,
  isSide: false,
  mapColumn: 0,
  mapRow: 0,
  screenColumn: 0,
  screenRow: 0,
}
const flatSample: FlatSample = {
  worldX: 0,
  worldY: 0,
  distance: 0,
  mapColumn: 0,
  mapRow: 0,
  screenColumn: 0,
  screenRow: 0,
}

/**
 * Render a first-person view of a grid of variable-height floor/ceiling cells
 * via per-column DDA raycasting, writing colour to `canvas` (two vertical
 * sub-pixels per cell through the ▀ half-block) and depth to `depthBuffer` for
 * later billboard occlusion. Walls, floor/ceiling strips, and step walls (where
 * a neighbour's floor or ceiling height differs) are all drawn. Geometry comes
 * from {@link GridSurfaces}; colour from {@link SurfaceShader}.
 */
export function renderGridSurfaces(context: RenderGridSurfacesContext): void {
  const { canvas, camera, projection, surfaces, shader, depthBuffer, screenColumns, screenRows, eyeZ } = context
  const maxDistance = context.maxDistance ?? DEFAULT_MAX_DISTANCE

  const forwardX = projection.forwardX
  const forwardY = projection.forwardY
  const rightX = projection.rightX
  const rightY = projection.rightY
  const planeMagnitude = projection.planeMagnitude

  const cameraX = camera.position.x
  const cameraY = camera.position.y
  const horizon = Math.floor(screenRows / 2)

  for (let column = 0; column < screenColumns; column++) {
    const cameraSpace = screenColumns <= 1 ? 0 : (2 * column) / (screenColumns - 1) - 1
    const rayDirX = forwardX + rightX * planeMagnitude * cameraSpace
    const rayDirY = forwardY + rightY * planeMagnitude * cameraSpace

    let mapX = Math.floor(cameraX)
    let mapY = Math.floor(cameraY)

    const deltaDistX = rayDirX === 0 ? Infinity : Math.abs(1 / rayDirX)
    const deltaDistY = rayDirY === 0 ? Infinity : Math.abs(1 / rayDirY)

    let sideDistX: number
    let sideDistY: number
    let stepX: number
    let stepY: number
    if (rayDirX < 0) {
      stepX = -1
      sideDistX = (cameraX - mapX) * deltaDistX
    } else {
      stepX = 1
      sideDistX = (mapX + 1 - cameraX) * deltaDistX
    }
    if (rayDirY < 0) {
      stepY = -1
      sideDistY = (cameraY - mapY) * deltaDistY
    } else {
      stepY = 1
      sideDistY = (mapY + 1 - cameraY) * deltaDistY
    }

    let prevFloor = surfaces.floorHeight(mapX, mapY)
    let prevCeil = surfaces.ceilingHeight(mapX, mapY)
    let prevPerpDistance = 0

    let openTop = 0
    let openBottom = screenRows - 1
    let solidDistance = -1

    let safetyCounter = 0
    while (safetyCounter++ < 1024) {
      let perpDistance: number
      let isYSide: boolean
      if (sideDistX < sideDistY) {
        perpDistance = sideDistX
        sideDistX += deltaDistX
        mapX += stepX
        isYSide = false
      } else {
        perpDistance = sideDistY
        sideDistY += deltaDistY
        mapY += stepY
        isYSide = true
      }
      if (perpDistance > maxDistance) break
      if (perpDistance <= 0) continue

      const newOpenBottom = drawFloorStrip(
        canvas,
        depthBuffer,
        shader,
        column,
        prevFloor,
        prevPerpDistance,
        perpDistance,
        rayDirX,
        rayDirY,
        cameraX,
        cameraY,
        eyeZ,
        screenRows,
        horizon,
        openTop,
        openBottom,
      )
      openBottom = newOpenBottom

      const newOpenTop = drawCeilingStrip(
        canvas,
        depthBuffer,
        shader,
        column,
        prevCeil,
        prevPerpDistance,
        perpDistance,
        rayDirX,
        rayDirY,
        cameraX,
        cameraY,
        eyeZ,
        screenRows,
        horizon,
        openTop,
        openBottom,
      )
      openTop = newOpenTop

      if (openTop > openBottom) break

      let wallU: number
      if (!isYSide) {
        const wallY = cameraY + perpDistance * rayDirY
        wallU = wallY - Math.floor(wallY)
      } else {
        const wallX = cameraX + perpDistance * rayDirX
        wallU = wallX - Math.floor(wallX)
      }

      const cellSolid = surfaces.isSolid(mapX, mapY)

      if (cellSolid) {
        drawWallSlice(
          canvas,
          depthBuffer,
          shader,
          column,
          perpDistance,
          prevFloor,
          prevCeil,
          wallU,
          isYSide,
          screenRows,
          horizon,
          eyeZ,
          openTop,
          openBottom,
          mapX,
          mapY,
        )
        solidDistance = perpDistance
        break
      }

      const nextFloor = surfaces.floorHeight(mapX, mapY)
      const nextCeil = surfaces.ceilingHeight(mapX, mapY)

      if (nextFloor !== prevFloor) {
        const zBottom = Math.min(prevFloor, nextFloor)
        const zTop = Math.max(prevFloor, nextFloor)
        const drew = drawWallSlice(
          canvas,
          depthBuffer,
          shader,
          column,
          perpDistance,
          zBottom,
          zTop,
          wallU,
          isYSide,
          screenRows,
          horizon,
          eyeZ,
          openTop,
          openBottom,
          mapX,
          mapY,
        )
        if (drew.drewAny) {
          if (drew.lastRow >= openBottom) openBottom = drew.firstRow - 1
          else if (drew.firstRow <= openTop) openTop = drew.lastRow + 1
        }
      }

      if (nextCeil !== prevCeil) {
        const zBottom = Math.min(prevCeil, nextCeil)
        const zTop = Math.max(prevCeil, nextCeil)
        const drew = drawWallSlice(
          canvas,
          depthBuffer,
          shader,
          column,
          perpDistance,
          zBottom,
          zTop,
          wallU,
          isYSide,
          screenRows,
          horizon,
          eyeZ,
          openTop,
          openBottom,
          mapX,
          mapY,
        )
        if (drew.drewAny) {
          if (drew.firstRow <= openTop) openTop = drew.lastRow + 1
          else if (drew.lastRow >= openBottom) openBottom = drew.firstRow - 1
        }
      }

      prevFloor = nextFloor
      prevCeil = nextCeil
      prevPerpDistance = perpDistance

      if (openTop > openBottom) break
    }

    if (solidDistance > 0) {
      depthBuffer.set(column, solidDistance)
    }
  }
}

interface SliceDrawResult {
  drewAny: boolean
  firstRow: number
  lastRow: number
}

function drawWallSlice(
  canvas: Canvas,
  depthBuffer: ColumnDepthBuffer,
  shader: SurfaceShader,
  column: number,
  distance: number,
  zBottom: number,
  zTop: number,
  wallU: number,
  isSide: boolean,
  rowCount: number,
  horizon: number,
  eyeZ: number,
  openTop: number,
  openBottom: number,
  mapX: number,
  mapY: number,
): SliceDrawResult {
  if (distance <= 0 || zTop <= zBottom) {
    return { drewAny: false, firstRow: 0, lastRow: -1 }
  }
  const wallHeight = Math.max(1, Math.floor(((zTop - zBottom) * rowCount) / distance))
  const centerZ = (zBottom + zTop) / 2
  const centerRow = Math.floor(horizon + ((eyeZ - centerZ) * rowCount) / distance)
  const halfHeight = Math.floor(wallHeight / 2)
  const top = centerRow - halfHeight
  const bottom = centerRow + halfHeight
  const span = bottom - top + 1

  const firstRow = Math.max(openTop, top)
  const lastRow = Math.min(openBottom, bottom)
  if (firstRow > lastRow) {
    return { drewAny: false, firstRow: 0, lastRow: -1 }
  }

  wallSample.u = wallU
  wallSample.distance = distance
  wallSample.isSide = isSide
  wallSample.mapColumn = mapX
  wallSample.mapRow = mapY
  wallSample.screenColumn = column
  for (let row = firstRow; row <= lastRow; row++) {
    depthBuffer.setCell(column, row, distance)
    const vTop = (row - top + 0.25) / span
    const vBottom = (row - top + 0.75) / span
    wallSample.screenRow = row
    wallSample.v = vTop
    shader.wallPixel(wallSample, upperRGB)
    const fgR = upperRGB.r,
      fgG = upperRGB.g,
      fgB = upperRGB.b
    wallSample.v = vBottom
    shader.wallPixel(wallSample, lowerRGB)
    canvas.setCellBytesUnsafe(column, row, UPPER_HALF_BLOCK, fgR, fgG, fgB, lowerRGB.r, lowerRGB.g, lowerRGB.b)
  }
  return { drewAny: true, firstRow, lastRow }
}

function drawFloorStrip(
  canvas: Canvas,
  depthBuffer: ColumnDepthBuffer,
  shader: SurfaceShader,
  column: number,
  floorZ: number,
  dNear: number,
  dFar: number,
  rayDirX: number,
  rayDirY: number,
  cameraX: number,
  cameraY: number,
  eyeZ: number,
  rowCount: number,
  horizon: number,
  openTop: number,
  openBottom: number,
): number {
  if (eyeZ <= floorZ) return openBottom

  const heightAbove = eyeZ - floorZ
  const rowFar = Math.floor(horizon + (heightAbove * rowCount) / dFar)
  const rowNearFloat = dNear <= 0 ? rowCount - 1 : horizon + (heightAbove * rowCount) / dNear
  const rowNear = Math.min(rowCount - 1, Math.floor(rowNearFloat))

  const firstRow = Math.max(openTop, rowFar, Math.ceil(horizon))
  const lastRow = Math.min(openBottom, rowNear, rowCount - 1)
  if (firstRow > lastRow) return openBottom

  flatSample.screenColumn = column
  for (let row = firstRow; row <= lastRow; row++) {
    const yTop = row + 0.25
    const yBottom = row + 0.75
    const dTop = (heightAbove * rowCount) / Math.max(0.0001, yTop - horizon)
    const dBottom = (heightAbove * rowCount) / Math.max(0.0001, yBottom - horizon)
    depthBuffer.setCell(column, row, Math.min(dTop, dBottom))
    const worldXTop = cameraX + rayDirX * dTop
    const worldYTop = cameraY + rayDirY * dTop
    const worldXBottom = cameraX + rayDirX * dBottom
    const worldYBottom = cameraY + rayDirY * dBottom
    const tileXTop = Math.floor(worldXTop)
    const tileYTop = Math.floor(worldYTop)
    const tileXBottom = Math.floor(worldXBottom)
    const tileYBottom = Math.floor(worldYBottom)
    flatSample.screenRow = row
    flatSample.worldX = worldXTop
    flatSample.worldY = worldYTop
    flatSample.distance = dTop
    flatSample.mapColumn = tileXTop
    flatSample.mapRow = tileYTop
    shader.floorPixel(flatSample, upperRGB)
    const fgR = upperRGB.r,
      fgG = upperRGB.g,
      fgB = upperRGB.b
    flatSample.worldX = worldXBottom
    flatSample.worldY = worldYBottom
    flatSample.distance = dBottom
    flatSample.mapColumn = tileXBottom
    flatSample.mapRow = tileYBottom
    shader.floorPixel(flatSample, lowerRGB)
    canvas.setCellBytesUnsafe(column, row, UPPER_HALF_BLOCK, fgR, fgG, fgB, lowerRGB.r, lowerRGB.g, lowerRGB.b)
  }
  return Math.min(openBottom, firstRow - 1)
}

function drawCeilingStrip(
  canvas: Canvas,
  depthBuffer: ColumnDepthBuffer,
  shader: SurfaceShader,
  column: number,
  ceilZ: number,
  dNear: number,
  dFar: number,
  rayDirX: number,
  rayDirY: number,
  cameraX: number,
  cameraY: number,
  eyeZ: number,
  rowCount: number,
  horizon: number,
  openTop: number,
  openBottom: number,
): number {
  if (eyeZ >= ceilZ) return openTop

  const heightBelow = ceilZ - eyeZ
  const rowNearFloat = dNear <= 0 ? 0 : horizon - (heightBelow * rowCount) / dNear
  const rowNear = Math.max(0, Math.ceil(rowNearFloat))
  const rowFar = Math.floor(horizon - (heightBelow * rowCount) / dFar)

  const firstRow = Math.max(openTop, rowNear)
  const lastRow = Math.min(openBottom, rowFar, Math.floor(horizon) - 1)
  if (firstRow > lastRow) return openTop

  flatSample.screenColumn = column
  for (let row = firstRow; row <= lastRow; row++) {
    const yTop = row + 0.25
    const yBottom = row + 0.75
    const dTop = (heightBelow * rowCount) / Math.max(0.0001, horizon - yTop)
    const dBottom = (heightBelow * rowCount) / Math.max(0.0001, horizon - yBottom)
    depthBuffer.setCell(column, row, Math.min(dTop, dBottom))
    const worldXTop = cameraX + rayDirX * dTop
    const worldYTop = cameraY + rayDirY * dTop
    const worldXBottom = cameraX + rayDirX * dBottom
    const worldYBottom = cameraY + rayDirY * dBottom
    const tileXTop = Math.floor(worldXTop)
    const tileYTop = Math.floor(worldYTop)
    const tileXBottom = Math.floor(worldXBottom)
    const tileYBottom = Math.floor(worldYBottom)
    flatSample.screenRow = row
    flatSample.worldX = worldXTop
    flatSample.worldY = worldYTop
    flatSample.distance = dTop
    flatSample.mapColumn = tileXTop
    flatSample.mapRow = tileYTop
    shader.ceilingPixel(flatSample, upperRGB)
    const fgR = upperRGB.r,
      fgG = upperRGB.g,
      fgB = upperRGB.b
    flatSample.worldX = worldXBottom
    flatSample.worldY = worldYBottom
    flatSample.distance = dBottom
    flatSample.mapColumn = tileXBottom
    flatSample.mapRow = tileYBottom
    shader.ceilingPixel(flatSample, lowerRGB)
    canvas.setCellBytesUnsafe(column, row, UPPER_HALF_BLOCK, fgR, fgG, fgB, lowerRGB.r, lowerRGB.g, lowerRGB.b)
  }
  return Math.max(openTop, lastRow + 1)
}
