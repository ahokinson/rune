import { Angle } from "@/math/angle"
import { clamp } from "@/math/scalar"
import { Vector3 } from "@/math/vector3"
import { sphericalToVector3Into } from "./sphere"

/**
 * Sphere projection: maps between screen space and a tilted, spinning unit
 * sphere. Owns both directions of the transform so the forward (surface →
 * screen) and inverse (screen → surface) projections stay in lock-step.
 *
 * @module
 */

/**
 * Where a sphere is drawn this frame. `radius` is the on-screen radius in cells;
 * `rotation` is the spin about the polar axis (radians); `centerX/Y` is the disc
 * centre. Passed per call because it changes every frame.
 */
export interface SphereView {
  centerX: number
  centerY: number
  radius: number
  rotation: number
}

/**
 * A point on the sphere's surface: its spherical angles (radians, see sphere.ts
 * for the theta/phi convention) plus the camera-space surface normal (also the
 * unit screen-space direction, so it drives screen-fixed lighting directly).
 */
export interface SurfacePoint {
  theta: number
  phi: number
  normal: Vector3
}

/**
 * A projected screen position with its depth toward the camera (the true surface
 * depth, ignoring any altitude lift, so culling and shading stay correct).
 */
export interface ScreenPoint {
  x: number
  y: number
  depth: number
}

/** Options for constructing a {@link SphereProjection}. */
export interface SphereProjectionOptions {
  /**
   * Axial tilt applied as Rz(roll)·Rx(pitch) on the sphere so it reads as tilted
   * while still spinning about its own axis; screen-space lighting is unaffected.
   */
  tiltPitch?: number
  /** Roll component of the axial tilt (radians). */
  tiltRoll?: number
  /** Vertical squash for non-square cells (e.g. 0.5 for 2:1 terminal cells). */
  aspectY?: number
}

/** Points behind this depth are on the far hemisphere (or grazing the limb) and are culled by directionToScreen. */
const DEPTH_CULL = 0.05

/**
 * Maps between screen space and a tilted, spinning unit sphere. Owns both
 * directions of the transform so the forward (surface → screen) and inverse
 * (screen → surface) projections stay in lock-step.
 *
 * @example
 * ```ts
 * const sphere = new SphereProjection({ tiltPitch: 0.3, aspectY: 0.5 })
 * const p = sphere.directionToScreen(dir, 1, view)
 * ```
 */
export class SphereProjection {
  private _tiltPitch: number
  private _tiltRoll: number
  /** Vertical squash for non-square terminal cells. */
  aspectY: number

  private _cosP = 1
  private _sinP = 0
  private _cosR = 1
  private _sinR = 0

  /**
   * @param options - Tilt angles and aspect squash.
   */
  constructor(options: SphereProjectionOptions = {}) {
    this._tiltPitch = options.tiltPitch ?? 0
    this._tiltRoll = options.tiltRoll ?? 0
    this.aspectY = options.aspectY ?? 1
    this.recomputeTilt()
  }

  /** Axial tilt pitch in radians. */
  get tiltPitch(): number {
    return this._tiltPitch
  }

  /** Set the axial tilt pitch (recomputes cached trig). */
  set tiltPitch(value: number) {
    this._tiltPitch = value
    this.recomputeTilt()
  }

  /** Axial tilt roll in radians. */
  get tiltRoll(): number {
    return this._tiltRoll
  }

  /** Set the axial tilt roll (recomputes cached trig). */
  set tiltRoll(value: number) {
    this._tiltRoll = value
    this.recomputeTilt()
  }

  private recomputeTilt(): void {
    this._cosP = Math.cos(this._tiltPitch)
    this._sinP = Math.sin(this._tiltPitch)
    this._cosR = Math.cos(this._tiltRoll)
    this._sinR = Math.sin(this._tiltRoll)
  }

  /**
   * Inverse projection: which surface point sits under a screen cell? Returns
   * null for cells outside the disc.
   *
   * @param screenX - Screen column.
   * @param screenY - Screen row.
   * @param view - Sphere placement for this frame.
   * @returns Surface point with angles and normal, or `null` off the disc.
   */
  screenToSurface(screenX: number, screenY: number, view: SphereView): SurfacePoint | null {
    return this.screenToSurfaceInto({ theta: 0, phi: 0, normal: new Vector3() }, screenX, screenY, view)
  }

  /**
   * Allocation-free variant for per-cell sampling: writes into `out` (and its
   * `out.normal`) and returns it, or null when the cell is off the disc.
   *
   * @param out - Target surface point (its `normal` is also filled).
   * @param screenX - Screen column.
   * @param screenY - Screen row.
   * @param view - Sphere placement for this frame.
   * @returns `out`, or `null` off the disc.
   */
  screenToSurfaceInto(out: SurfacePoint, screenX: number, screenY: number, view: SphereView): SurfacePoint | null {
    const nx = (screenX - view.centerX) / view.radius
    const ny = (screenY - view.centerY) / view.radius / this.aspectY

    const distSq = nx * nx + ny * ny
    if (distSq > 1.0) return null

    const nz = Math.sqrt(Math.max(0, 1.0 - distSq))

    // Undo roll Rz(−roll) then pitch Rx(−pitch) to recover geography; the spin is
    // a longitude offset. nx/ny/nz stay the camera-space normal for lighting.
    const ax = nx * this._cosR + ny * this._sinR
    const ay = -nx * this._sinR + ny * this._cosR
    const vy = ay * this._cosP + nz * this._sinP
    const vz = -ay * this._sinP + nz * this._cosP

    out.theta = Math.asin(clamp(-vy, -1, 1))
    out.phi = Angle.normalize(Math.atan2(ax, vz) + view.rotation)
    out.normal.set(nx, ny, nz)
    return out
  }

  /**
   * Forward projection of a unit surface direction. `altitude` (>= 1) pushes the
   * point radially outward so arcs can bow off the surface; culling and the
   * returned depth use the true surface direction, so the far side of a bow hides
   * behind the sphere and shades correctly. Returns null when culled.
   *
   * @param dir - Unit surface direction.
   * @param altitude - Radial lift (>= 1); pass 1 for surface points.
   * @param view - Sphere placement for this frame.
   * @returns Screen point with depth, or `null` if culled.
   */
  directionToScreen(dir: Vector3, altitude: number, view: SphereView): ScreenPoint | null {
    return this.directionToScreenInto({ x: 0, y: 0, depth: 0 }, dir, altitude, view)
  }

  /**
   * Allocation-free forward projection: writes into `out` and returns it, or
   * `null` when culled.
   *
   * @param out - Target screen point.
   * @param dir - Unit surface direction.
   * @param altitude - Radial lift (>= 1); pass 1 for surface points.
   * @param view - Sphere placement for this frame.
   * @returns `out`, or `null` if culled.
   */
  directionToScreenInto(out: ScreenPoint, dir: Vector3, altitude: number, view: SphereView): ScreenPoint | null {
    // Spin about the polar axis (longitude), matching screenToSurface's inverse.
    const cosRot = Math.cos(view.rotation)
    const sinRot = Math.sin(view.rotation)
    const rx = dir.x * cosRot - dir.z * sinRot
    const rz = dir.x * sinRot + dir.z * cosRot

    // Same axial tilt as the inverse: pitch Rx(pitch) then roll Rz(roll).
    const py = dir.y * this._cosP - rz * this._sinP
    const pz = dir.y * this._sinP + rz * this._cosP
    const cxv = rx * this._cosR - py * this._sinR
    const cyv = rx * this._sinR + py * this._cosR

    if (pz <= DEPTH_CULL) return null

    out.x = Math.round(view.centerX + cxv * view.radius * altitude)
    out.y = Math.round(view.centerY + cyv * view.radius * this.aspectY * altitude)
    out.depth = pz
    return out
  }

  /**
   * Convenience: project a spherical elevation/azimuth (radians) at a given altitude.
   *
   * @param theta - Elevation from the equatorial plane.
   * @param phi - Azimuth about the y axis.
   * @param altitude - Radial lift (>= 1); pass 1 for surface points.
   * @param view - Sphere placement for this frame.
   * @returns Screen point with depth, or `null` if culled.
   */
  worldToScreen(theta: number, phi: number, altitude: number, view: SphereView): ScreenPoint | null {
    return this.directionToScreen(sphericalToVector3Into(new Vector3(), theta, phi), altitude, view)
  }
}
