import { clamp } from "@/math/scalar"
import type { AudioContext, AudioSource, PlayOptions } from "./context"

/**
 * Distance-based spatialization helpers. Terminal players can't pan, so
 * spatialization here is volume falloff only — kept honest.
 *
 * @module
 */

/**
 * A position in the game world. `z` is optional so 2D games can pass Vector2-like
 * points and 3D games Vector3-like ones through the same helpers.
 */
export interface SpatialPoint {
  x: number
  y: number
  z?: number
}

/**
 * Linear distance falloff: full volume at the listener, silent at `range` and
 * beyond. Returns a 0–1 gain suitable for {@link PlayOptions.volume}.
 *
 * @param listener - Ear position.
 * @param source - Sound position.
 * @param range - Distance at which the sound goes silent.
 * @returns Gain in [0, 1].
 */
export function attenuation(listener: SpatialPoint, source: SpatialPoint, range: number): number {
  if (range <= 0) return 0
  const dx = source.x - listener.x
  const dy = source.y - listener.y
  const dz = (source.z ?? 0) - (listener.z ?? 0)
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  return clamp(1 - distance / range, 0, 1)
}

/** {@link PlayOptions} plus the listener/source/range needed for spatial falloff. */
export interface SpatialPlayOptions extends PlayOptions {
  /** Ear position. */
  listener: SpatialPoint
  /** Sound position. */
  source: SpatialPoint
  /** Distance at which the sound goes silent. */
  range: number
}

/**
 * Play `name` with its volume scaled by distance from the listener. Folds the
 * distance gain into any explicit `volume`, and skips playback entirely (returns
 * `null`) once the source is out of range, so off-screen sounds cost nothing.
 *
 * @param audio - Backend to play through.
 * @param name - Sound key previously loaded.
 * @param options - Listener, source, range, plus ordinary play options.
 * @returns The playing source handle, or `null` if the sound is out of range.
 */
export function playSpatial(audio: AudioContext, name: string, options: SpatialPlayOptions): AudioSource | null {
  const { listener, source, range, volume = 1, ...rest } = options
  const gain = attenuation(listener, source, range) * volume
  if (gain <= 0) return null
  return audio.play(name, { ...rest, volume: gain })
}
